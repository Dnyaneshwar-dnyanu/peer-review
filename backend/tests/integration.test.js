import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.JWT_KEY = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../server');
const userModel = require('../models/User');
const roomModel = require('../models/Room');
const projectModel = require('../models/Projects');
const reviewModel = require('../models/Reviews');

let mongoServer;

const registerUser = async ({ name, email, password, role, usn }) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password, role, usn });

  expect(res.statusCode).toBe(201);

  await userModel.updateOne({ email }, { isVerified: true });
};

const loginAgent = async ({ email, password }) => {
  const agent = request.agent(app);
  const res = await agent
    .post('/api/auth/login')
    .send({ email, password });

  expect(res.statusCode).toBe(200);
  expect(res.body.auth).toBe(true);

  return agent;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([
    userModel.deleteMany({}),
    roomModel.deleteMany({}),
    projectModel.deleteMany({}),
    reviewModel.deleteMany({})
  ]);
});

describe('Auth flow', () => {
  it('registers, logs in, and refreshes tokens', async () => {
    await registerUser({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'pass1234',
      role: 'admin'
    });

    const agent = await loginAgent({ email: 'admin@test.com', password: 'pass1234' });

    const refreshRes = await agent.post('/api/auth/refresh-token');
    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.success).toBe(true);
  });
});

describe('Classroom lifecycle', () => {
  it('creates, opens, and closes a classroom', async () => {
    await registerUser({
      name: 'Admin User',
      email: 'admin-room@test.com',
      password: 'pass1234',
      role: 'admin'
    });

    const adminAgent = await loginAgent({ email: 'admin-room@test.com', password: 'pass1234' });

    const createRes = await adminAgent
      .post('/api/admin/createRoom')
      .send({ roomName: 'Capstone', semester: '6', section: 'A', maxMarks: 50 });

    expect(createRes.statusCode).toBe(201);

    const roomId = createRes.body.room._id;

    const openRes = await adminAgent.post(`/api/admin/openRoom/${roomId}`);
    expect(openRes.statusCode).toBe(200);
    expect(openRes.body.code).toBeTruthy();

    const closeRes = await adminAgent.post(`/api/admin/closeRoom/${roomId}`);
    expect(closeRes.statusCode).toBe(200);
  });
});

describe('Project and review rules', () => {
  it('enforces review rules and deletion access', async () => {
    await registerUser({
      name: 'Admin User',
      email: 'admin-project@test.com',
      password: 'pass1234',
      role: 'admin'
    });

    const adminAgent = await loginAgent({ email: 'admin-project@test.com', password: 'pass1234' });

    const createRes = await adminAgent
      .post('/api/admin/createRoom')
      .send({ roomName: 'Projects', semester: '6', section: 'B', maxMarks: 30 });

    const roomId = createRes.body.room._id;

    const openRes = await adminAgent.post(`/api/admin/openRoom/${roomId}`);
    expect(openRes.statusCode).toBe(200);

    const roomCode = openRes.body.code;

    await registerUser({
      name: 'Student One',
      email: 'student1@test.com',
      password: 'pass1234',
      role: 'student',
      usn: '1MS23CS001'
    });

    await registerUser({
      name: 'Student Two',
      email: 'student2@test.com',
      password: 'pass1234',
      role: 'student',
      usn: '1MS23CS002'
    });

    const studentAgent = await loginAgent({ email: 'student1@test.com', password: 'pass1234' });
    const reviewerAgent = await loginAgent({ email: 'student2@test.com', password: 'pass1234' });

    const joinStudent = await studentAgent.post(`/api/student/room/${roomCode}/join`);
    expect(joinStudent.statusCode).toBe(200);

    const joinReviewer = await reviewerAgent.post(`/api/student/room/${roomCode}/join`);
    expect(joinReviewer.statusCode).toBe(200);

    const addProjectRes = await studentAgent
      .post(`/api/projects/add/${roomId}`)
      .send({ title: 'Demo Project', description: 'Test', type: 'individual' });

    expect(addProjectRes.statusCode).toBe(201);

    const projectId = addProjectRes.body.project._id;

    const ownReviewRes = await studentAgent
      .post(`/api/projects/addReview/${projectId}`)
      .send({ marks: 8, comment: 'Self review' });

    expect(ownReviewRes.statusCode).toBe(400);

    const firstReviewRes = await reviewerAgent
      .post(`/api/projects/addReview/${projectId}`)
      .send({ marks: 9, comment: 'Nice work' });

    expect(firstReviewRes.statusCode).toBe(200);

    const secondReviewRes = await reviewerAgent
      .post(`/api/projects/addReview/${projectId}`)
      .send({ marks: 9, comment: 'Second attempt' });

    expect(secondReviewRes.statusCode).toBe(400);

    const studentDeleteRes = await studentAgent.delete(`/api/projects/${projectId}/delete`);
    expect(studentDeleteRes.statusCode).toBe(403);

    const adminDeleteRes = await adminAgent.delete(`/api/projects/${projectId}/delete`);
    expect(adminDeleteRes.statusCode).toBe(200);
  });
});

describe('Password Reset flow', () => {
  it('validates a reset token and updates the password', async () => {
    await registerUser({
      name: 'Reset User',
      email: 'reset@test.com',
      password: 'old-password',
      role: 'student',
      usn: '1MS23CS999'
    });

    // 1. Request reset
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'reset@test.com' });

    const user = await userModel.findOne({ email: 'reset@test.com' });
    expect(user.resetPasswordToken).toBeTruthy();

    // Since we can't easily get the raw token (it's hashed in DB), 
    // we'll manually set a known token for testing
    const crypto = require('crypto');
    const rawToken = 'test-reset-token';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10000;
    await user.save();

    // 2. Verify token
    const verifyRes = await request(app).get(`/api/auth/verify/reset-token/${rawToken}`);
    expect(verifyRes.statusCode).toBe(200);

    // 3. Reset password
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'new-password' });
    
    expect(resetRes.statusCode).toBe(200);

    // 4. Verify login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reset@test.com', password: 'new-password' });
    
    expect(loginRes.statusCode).toBe(200);
  });
});
