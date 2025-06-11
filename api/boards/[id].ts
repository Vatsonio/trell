import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { Board } from '../../backend/src/models/Board';

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

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        // Get board by ID
        const board = await Board.findById(id);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }
        return res.json(board);

      case 'PUT':
        // Update board
        const { name } = req.body;
        
        const updatedBoard = await Board.findByIdAndUpdate(
          id,
          { name },
          { new: true }
        );
        
        if (!updatedBoard) {
          return res.status(404).json({ message: 'Board not found' });
        }
        
        return res.json(updatedBoard);

      case 'DELETE':
        // Delete board
        const deletedBoard = await Board.findByIdAndDelete(id);
        
        if (!deletedBoard) {
          return res.status(404).json({ message: 'Board not found' });
        }
        
        return res.json({ message: 'Board deleted successfully' });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
