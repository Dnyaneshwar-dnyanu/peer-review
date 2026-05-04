import { describe, it, expect } from 'vitest';
const request = require('supertest');
const app = require('../server');

describe('GET /', () => {
  it('should return 200 and a success message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Peer Review Server is Working Fine');
  });
});

describe('GET /healthz', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
