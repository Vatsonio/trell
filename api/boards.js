const mongoose = require('mongoose');

// Define schemas inline
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
function generateBoardId() {
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
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    isConnected = false;
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();
    
    const { method, url } = req;
    const pathParts = url?.split('/').filter(Boolean) || [];
    
    // Get all boards
    if (method === 'GET' && pathParts.length === 2) {
      const boards = await Board.find({}).sort({ createdAt: -1 });
      res.status(200).json(boards);
      return;
    }
    
    // Create new board
    if (method === 'POST' && pathParts.length === 2) {
      const { name } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Board name is required and must be a non-empty string' });
        return;
      }
      
      const boardId = generateBoardId();
      
      const boardData = {
        _id: boardId,
        name: name.trim(),
        cards: []
      };
      
      const board = new Board(boardData);
      const savedBoard = await board.save();
      
      res.status(201).json(savedBoard);
      return;
    }
    
    // Get specific board
    if (method === 'GET' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const board = await Board.findById(boardId);
      
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }
      
      res.status(200).json(board);
      return;
    }
    
    // Update board
    if (method === 'PUT' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const { name } = req.body;
      
      const board = await Board.findByIdAndUpdate(
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
    
    // Delete board
    if (method === 'DELETE' && pathParts.length === 3) {
      const boardId = pathParts[2];
      const board = await Board.findByIdAndDelete(boardId);
      
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
};
