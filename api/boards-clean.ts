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

// MongoDB connection - Improved for serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');
    
    const { method, url } = req;
    const pathParts = url?.split('/').filter(Boolean) || [];
    console.log(`Processing ${method} request with path:`, pathParts);
    
    // GET /api/boards - List all boards
    if (method === 'GET' && pathParts.length === 2) {
      const boards = await Board.find({}).sort({ createdAt: -1 });
      return res.status(200).json(boards);
    }
    
    // POST /api/boards - Create new board
    if (method === 'POST' && pathParts.length === 2) {
      const { name } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Board name is required and must be a non-empty string' });
      }
      
      const boardData = {
        _id: generateBoardId(),
        name: name.trim(),
        cards: []
      };
      
      const board = new Board(boardData);
      const savedBoard = await board.save();
      
      return res.status(201).json(savedBoard);
    }
    
    // GET /api/boards/:id - Get specific board
    if (method === 'GET' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const board = await Board.findById(boardId);
      
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }
      
      return res.status(200).json(board);
    }
    
    // PUT /api/boards/:id - Update board
    if (method === 'PUT' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const { name } = req.body;
      
      const board = await Board.findByIdAndUpdate(
        boardId,
        { name },
        { new: true }
      );
      
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }
      
      return res.status(200).json(board);
    }
    
    // DELETE /api/boards/:id - Delete board
    if (method === 'DELETE' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const board = await Board.findByIdAndDelete(boardId);
      
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }
      
      return res.status(200).json({ message: 'Board deleted successfully' });
    }
    
    return res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('Boards API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        return res.status(500).json({ 
          error: 'Database configuration error',
          message: 'MongoDB connection not configured properly'
        });
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return res.status(504).json({ 
          error: 'Database timeout',
          message: 'Database connection timed out'
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An error occurred'
    });
  }
}
