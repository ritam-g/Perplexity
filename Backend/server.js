import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
dotenv.config()


const PORT = process.env.PORT || 5000;

connectDB()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

