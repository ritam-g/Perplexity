import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import chatRouter from './routes/chat.route.js';
import fileRouter from './routes/file.route.js';
import userRouter from './routes/user.route.js';
import { errorHandler } from './middleware/error.middleware.js';
// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan("dev"))
// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});


// NOTE - Routers
app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter)
app.use("/api/files", fileRouter);
// User profile routes live under /api/users, including PATCH /api/users/profile.
app.use('/api/users', userRouter)


// Error handling middleware
app.use(errorHandler);

export default app;
