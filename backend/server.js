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

app.use(cors({
     origin: "http://localhost:5173",
     methods: ["GET", "POST", "PUT", "DELETE"],
     credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.use('/admin', adminRouter);

app.use('/student', userRouter);

app.use('/projects', projectRouter)

app.get('/', (req, res) => {
     res.send("Hello Brother");
});

app.listen(3000);