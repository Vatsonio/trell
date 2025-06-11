import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// Define schemas inline to avoid import issues
const CardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  column: { 
    type: String, 
    enum: ['todo', 'inProgress', 'done'], 
    required: true 
  },
  order: { type: Number, required: true },
}, {
  timestamps: true
});

const BoardSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  cards: [CardSchema],
}, {
  timestamps: true,
  _id: false
});

const Board = mongoose.models.Board || mongoose.model('Board', BoardSchema);

// Generate board ID function
function generateBoardId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: 1,
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();
    
    const { method, url } = req;    const pathParts = url?.split('/').filter(Boolean) || [];
      if (method === 'GET' && pathParts.length === 2) {
      const boards = await (Board as any).find({}).sort({ createdAt: -1 });
      res.status(200).json(boards);
      return;
    }
    
    if (method === 'POST' && pathParts.length === 2) {
      const { name } = req.body;
      
      if (!name) {
        res.status(400).json({ error: 'Board name is required' });
        return;
      }
      
      const boardId = generateBoardId();
      const board = new Board({
        _id: boardId,
        name,
        cards: []
      });
      
      await board.save();
      res.status(201).json(board);
      return;
    }
      if (method === 'GET' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const board = await (Board as any).findById(boardId);
      
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }
      
      res.status(200).json(board);
      return;
    }
      if (method === 'PUT' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const { name } = req.body;
      
      const board = await (Board as any).findByIdAndUpdate(
        boardId,
        { name },
        { new: true }
      );
      
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }
      
      res.status(200).json(board);
      return;
    }
      if (method === 'DELETE' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const board = await (Board as any).findByIdAndDelete(boardId);
      
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }
      
      res.status(200).json({ message: 'Board deleted successfully' });
      return;
    }
    
    res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('Boards API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
