import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { Board } from '../backend/src/models/Board';
import boardRoutes from '../backend/src/routes/boards';
import cardRoutes from '../backend/src/routes/cards';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskboard';
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Routes
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);

// Vercel serverless function handler
export default async (req: VercelRequest, res: VercelResponse) => {
  await connectDB();
  
  // Create a mock request/response for Express
  const mockReq = req as any;
  const mockRes = res as any;
  
  return app(mockReq, mockRes);
};
