import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import chatRouter from './routes/chat.route.js';
import fileRouter from './routes/file.route.js';
// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan("dev"))
// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});


// TODO: Add your API routes here
app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter)
app.use("/api/files", fileRouter);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err?.stack || err);

  if (err?.name === "MulterError") {
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "File size must be 5MB or smaller."
      : err.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  return res.status(err?.statusCode || 500).json({
    success: false,
    message: err?.message || "Something broke!",
  });
});

export default app;
