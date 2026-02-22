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

connectDB();

const PORT = process.env.PORT || 3000;

app.use(cors({
     origin: process.env.FRONTEND_URL,
     methods: ["GET", "POST", "PUT", "DELETE"],
     credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
     console.log("Incoming:", req.method, req.url);
     next();
});

app.use('/api/auth', authRouter);

app.use('/admin', adminRouter);

app.use('/student', userRouter);

app.use('/projects', projectRouter)

app.get('/', (req, res) => {
     res.send("Peer Review Server is Working Fine");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});