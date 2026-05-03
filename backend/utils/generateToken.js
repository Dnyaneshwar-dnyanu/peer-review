const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const parseDurationToMs = (value, fallbackMs) => {
     if (!value) return fallbackMs;
     if (typeof value === 'number') return value;
     if (typeof value !== 'string') return fallbackMs;

     const trimmed = value.trim();
     if (/^\d+$/.test(trimmed)) return Number(trimmed);

     const match = trimmed.match(/^(\d+)([smhd])$/i);
     if (!match) return fallbackMs;

     const amount = Number(match[1]);
     const unit = match[2].toLowerCase();
     const multipliers = {
          s: 1000,
          m: 60 * 1000,
          h: 60 * 60 * 1000,
          d: 24 * 60 * 60 * 1000
     };

     return amount * multipliers[unit];
};

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

const ACCESS_TOKEN_MAX_AGE_MS = parseDurationToMs(
     ACCESS_TOKEN_EXPIRES_IN,
     15 * 60 * 1000
);
const REFRESH_TOKEN_MAX_AGE_MS = parseDurationToMs(
     REFRESH_TOKEN_EXPIRES_IN,
     7 * 24 * 60 * 60 * 1000
);

const generateAccessToken = (user) => {
     return jwt.sign(
          { email: user.email, _id: user._id },
          process.env.JWT_KEY,
          { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
     );
};

const generateRefreshToken = () => crypto.randomBytes(32).toString('hex');

module.exports = {
     generateAccessToken,
     generateRefreshToken,
     ACCESS_TOKEN_MAX_AGE_MS,
     REFRESH_TOKEN_MAX_AGE_MS
};