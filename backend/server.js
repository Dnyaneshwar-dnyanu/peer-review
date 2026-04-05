const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRouter');
const adminRouter = require('./routes/adminRouter');
const userRouter = require('./routes/userRouter');
const projectRouter = require('./routes/projectRouter');
require('dotenv').config();
const connectDB = require('./config/db');

if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const PORT = process.env.PORT || 3000;

app.use(cors({
     origin: process.env.FRONTEND_URL,
     methods: ["GET", "POST", "PUT", "DELETE"],
     allowedHeaders: ["Content-Type", "Authorization"],
     credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/student', userRouter);
app.use('/api/projects', projectRouter);

app.get('/', (req, res) => {
     res.send("Peer Review Server is Working Fine");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ success: false, message: "Something went wrong! Internal Server Error" });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
         console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;