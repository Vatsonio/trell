const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Define schemas inline (same as boards.js)
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

// Get all cards for a board
router.get('/board/:boardId', async (req, res) => {
  try {
    await connectToDatabase();
    const board = await Board.findById(req.params.boardId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json(board.cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Create a new card
router.post('/', async (req, res) => {
  try {
    await connectToDatabase();
    const { boardId, title, description = '', column } = req.body;
    
    if (!boardId || !title || !column) {
      return res.status(400).json({ 
        error: 'boardId, title, and column are required' 
      });
    }
    
    if (!['todo', 'inProgress', 'done'].includes(column)) {
      return res.status(400).json({ 
        error: 'column must be one of: todo, inProgress, done' 
      });
    }
    
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    // Calculate next order for the column
    const cardsInColumn = board.cards.filter(card => card.column === column);
    const maxOrder = cardsInColumn.length > 0 
      ? Math.max(...cardsInColumn.map(card => card.order)) 
      : -1;
    
    const newCard = {
      _id: generateId(),
      title: title.trim(),
      description: description.trim(),
      column,
      order: maxOrder + 1
    };
    
    board.cards.push(newCard);
    await board.save();
    
    res.status(201).json(newCard);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update a card
router.put('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const { boardId, title, description, column } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ error: 'boardId is required' });
    }
    
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const cardIndex = board.cards.findIndex(card => card._id.toString() === req.params.id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Update card properties
    if (title !== undefined) board.cards[cardIndex].title = title.trim();
    if (description !== undefined) board.cards[cardIndex].description = description.trim();
    if (column !== undefined) {
      if (!['todo', 'inProgress', 'done'].includes(column)) {
        return res.status(400).json({ 
          error: 'column must be one of: todo, inProgress, done' 
        });
      }
      board.cards[cardIndex].column = column;
    }
    
    await board.save();
    res.json(board.cards[cardIndex]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a card
router.delete('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const { boardId } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ error: 'boardId is required' });
    }
    
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const cardIndex = board.cards.findIndex(card => card._id.toString() === req.params.id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    board.cards.splice(cardIndex, 1);
    await board.save();
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Move card to different column
router.put('/:id/move', async (req, res) => {
  try {
    await connectToDatabase();
    const { boardId, sourceColumn, targetColumn, sourceIndex, targetIndex } = req.body;
    
    if (!boardId || !sourceColumn || !targetColumn || 
        sourceIndex === undefined || targetIndex === undefined) {
      return res.status(400).json({ 
        error: 'boardId, sourceColumn, targetColumn, sourceIndex, and targetIndex are required' 
      });
    }
    
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const cardIndex = board.cards.findIndex(card => card._id.toString() === req.params.id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Update card column
    board.cards[cardIndex].column = targetColumn;
    
    // Reorder cards in both columns
    const sourceCards = board.cards.filter(card => card.column === sourceColumn && card._id.toString() !== req.params.id);
    const targetCards = board.cards.filter(card => card.column === targetColumn && card._id.toString() !== req.params.id);
    
    // Insert moved card at target index
    targetCards.splice(targetIndex, 0, board.cards[cardIndex]);
    
    // Update order values
    sourceCards.forEach((card, index) => {
      const cardIdx = board.cards.findIndex(c => c._id.toString() === card._id.toString());
      board.cards[cardIdx].order = index;
    });
    
    targetCards.forEach((card, index) => {
      const cardIdx = board.cards.findIndex(c => c._id.toString() === card._id.toString());
      board.cards[cardIdx].order = index;
    });
    
    await board.save();
    res.json(board.cards[cardIndex]);
  } catch (error) {
    console.error('Error moving card:', error);
    res.status(500).json({ error: 'Failed to move card' });
  }
});

module.exports = router;
