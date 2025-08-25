import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routers/user.js';
import adminRouter from './routers/admin.js';
import hodRouter from './routers/hod.js';
import teacherRouter from './routers/teacher.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000']
}));

const PORT = process.env.PORT || 3000;

app.use('/api/user', userRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/admin', adminRouter);
app.use('/api/hod', hodRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});