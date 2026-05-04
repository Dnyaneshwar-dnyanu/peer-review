const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRouter');
const classroomRouter = require('./routes/classroomRouter');
const userRouter = require('./routes/userRouter');
const projectRouter = require('./routes/projectRouter');
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./utils/logger');

if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const PORT = process.env.PORT || 3000;

if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}

app.disable('x-powered-by');

const normalizeOrigin = (origin) => origin.replace(/\/$/, '');

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);

const shouldEnforceOriginCheck = process.env.ENFORCE_ORIGIN_CHECK
    ? process.env.ENFORCE_ORIGIN_CHECK === 'true'
    : process.env.NODE_ENV === 'production';

const isUnsafeMethod = (method) => !['GET', 'HEAD', 'OPTIONS'].includes(method);

const getRequestOrigin = (req) => {
    if (req.headers.origin) return req.headers.origin;
    if (!req.headers.referer) return null;

    try {
        const refererUrl = new URL(req.headers.referer);
        return refererUrl.origin;
    } catch (err) {
        return null;
    }
};

app.use(helmet());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        const normalizedOrigin = normalizeOrigin(origin);

        if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        if (allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    credentials: true,
    exposedHeaders: ["Content-Disposition", "X-Request-Id"]
}));

const apiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
});

app.use('/api', apiLimiter);

app.use((req, res, next) => {
    const requestId = crypto.randomUUID();
    req.id = requestId;
    res.setHeader('X-Request-Id', requestId);

    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        logger.info('http.request', {
            requestId,
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            latencyMs: Math.round(durationMs),
            userId: req.user?._id ? String(req.user._id) : null
        });
    });

    next();
});

app.use((req, res, next) => {
    if (!shouldEnforceOriginCheck || !isUnsafeMethod(req.method)) {
        return next();
    }

    if (allowedOrigins.length === 0) {
        return next();
    }

    const requestOrigin = getRequestOrigin(req);

    if (!requestOrigin) {
        logger.warn('csrf.origin.missing', {
            requestId: req.id,
            method: req.method,
            path: req.originalUrl
        });
        return res.status(403).json({ success: false, message: 'Origin required' });
    }

    const normalizedOrigin = normalizeOrigin(requestOrigin);

    if (!allowedOrigins.includes(normalizedOrigin)) {
        logger.warn('csrf.origin.blocked', {
            requestId: req.id,
            method: req.method,
            path: req.originalUrl,
            origin: requestOrigin
        });
        return res.status(403).json({ success: false, message: 'Origin not allowed' });
    }

    return next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/admin', classroomRouter);
app.use('/api/student', userRouter);
app.use('/api/projects', projectRouter);

app.get('/', (req, res) => {
    res.send("Peer Review Server is Working Fine");
});

app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/readyz', (req, res) => {
    const isReady = mongoose.connection.readyState === 1;
    const status = isReady ? 'ready' : 'not-ready';
    const code = isReady ? 200 : 503;

    res.status(code).json({ status });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('http.error', {
        requestId: req.id,
        error: err.message,
        stack: err.stack
    });
    res.status(500).send({ success: false, message: "Something went wrong! Internal Server Error" });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info('server.started', { port: PORT });
    });
}

module.exports = app;