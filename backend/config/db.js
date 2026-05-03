const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        logger.info("db.connect.start");
        const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

        if (!mongoUri) {
            throw new Error("MONGO_URI or MONGO_URL is not defined in environment variables");
        }

        const options = {
            autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in dev, but not in prod (manual index management preferred)
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(mongoUri, options);
        logger.info("db.connect.success");

        mongoose.connection.on('error', (err) => {
            logger.error("db.connection.error", { error: err.message });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn("db.connection.disconnected");
        });

    } catch (err) {
        logger.error("db.connect.error", { error: err.message, stack: err.stack });
        // In production, we want the container orchestrator to handle restarts
        process.exit(1);
    }
};

module.exports = connectDB;