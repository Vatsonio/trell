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

// MongoDB connection - Simplified for serverless
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  console.log('Connecting to MongoDB...');
  
  // For serverless, create a fresh connection each time
  await mongoose.connect(mongoUri, {
    bufferCommands: false,
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 5000,
    connectTimeoutMS: 3000,
  });
  
  console.log('MongoDB connected successfully');
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
    console.log('Attempting to connect to MongoDB...');
    
    // Add timeout to connection attempt
    const connectionPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('MongoDB connection timeout')), 8000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('MongoDB connection successful, processing request...');
    
    const { method, url } = req;
    const pathParts = url?.split('/').filter(Boolean) || [];
    console.log(`Processing ${method} request with path:`, pathParts);
    
    if (method === 'GET' && pathParts.length === 2) {
      const boards = await (Board as any).find({}).sort({ createdAt: -1 });
      res.status(200).json(boards);
      return;
    }
    
    if (method === 'POST' && pathParts.length === 2) {
      console.log('Creating new board...');
      const { name } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.log('Invalid board name provided:', name);
        res.status(400).json({ error: 'Board name is required and must be a non-empty string' });
        return;
      }
      
      const boardId = generateBoardId();
      console.log('Generated board ID:', boardId);
      
      const boardData = {
        _id: boardId,
        name: name.trim(),
        cards: []
      };
      
      console.log('Creating board with data:', boardData);
      
      const board = new Board(boardData);
      
      const savedBoard = await board.save();
      console.log('Board saved successfully:', savedBoard._id);
      
      res.status(201).json(savedBoard);
      return;    }
    
    if (method === 'GET' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const board = await (Board as any).findById(boardId);
      
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }
      
      res.status(200).json(board);
      return;    }
    
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
      return;    }
    
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
