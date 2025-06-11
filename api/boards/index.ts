import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { Board } from '../../backend/src/models/Board';
import { generateBoardId } from '../../backend/src/utils/generateId';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskboard';
    await mongoose.connect(mongoUri);
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default async (req: VercelRequest, res: VercelResponse) => {
  await connectDB();
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'POST':
        // Create new board
        const { name } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: 'Board name is required' });
        }
        
        const boardId = generateBoardId();
        const board = new Board({
          _id: boardId,
          name,
          cards: []
        });
        
        await board.save();
        return res.status(201).json(board);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
