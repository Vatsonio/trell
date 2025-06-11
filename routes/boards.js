const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

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

// MongoDB connection function
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trell';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Get all boards
router.get('/', async (req, res) => {
  try {
    await connectToDatabase();
    const boards = await Board.find({});
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Get a specific board
router.get('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create a new board
router.post('/', async (req, res) => {
  try {
    await connectToDatabase();
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Board name is required and must be a non-empty string' });
    }
    
    const boardId = generateId();
    const board = new Board({
      _id: boardId,
      name: name.trim(),
      cards: []
    });
    
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update a board
router.put('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Board name is required and must be a non-empty string' });
    }
    
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete a board
router.delete('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const board = await Board.findByIdAndDelete(req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

module.exports = router;
