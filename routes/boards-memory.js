const express = require('express');
const router = express.Router();
const { boards, generateId } = require('../data/memory-store');

// Get all boards
router.get('/', async (req, res) => {
  try {
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Get a specific board
router.get('/:id', async (req, res) => {
  try {
    const board = boards.find(b => b._id === req.params.id);
    
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
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Board name is required and must be a non-empty string' });
    }
    
    const boardId = generateId();
    const board = {
      _id: boardId,
      name: name.trim(),
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    boards.push(board);
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update a board
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Board name is required and must be a non-empty string' });
    }
    
    const boardIndex = boards.findIndex(b => b._id === req.params.id);
    
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    boards[boardIndex].name = name.trim();
    boards[boardIndex].updatedAt = new Date();
    
    res.json(boards[boardIndex]);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete a board
router.delete('/:id', async (req, res) => {
  try {
    const boardIndex = boards.findIndex(b => b._id === req.params.id);
    
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    boards.splice(boardIndex, 1);
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

module.exports = router;
