const express = require('express');
const router = express.Router();
const { boards, generateId } = require('../data/memory-store');

// Get all cards for a board
router.get('/board/:boardId', async (req, res) => {
  try {
    const board = boards.find(b => b._id === req.params.boardId);
    
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
    
    const boardIndex = boards.findIndex(b => b._id === boardId);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    // Calculate next order for the column
    const cardsInColumn = boards[boardIndex].cards.filter(card => card.column === column);
    const maxOrder = cardsInColumn.length > 0 
      ? Math.max(...cardsInColumn.map(card => card.order)) 
      : -1;
    
    const newCard = {
      _id: generateId(),
      title: title.trim(),
      description: description.trim(),
      column,
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    boards[boardIndex].cards.push(newCard);
    boards[boardIndex].updatedAt = new Date();
    
    res.status(201).json(newCard);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update a card
router.put('/:id', async (req, res) => {
  try {
    const { boardId, title, description, column } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ error: 'boardId is required' });
    }
    
    const boardIndex = boards.findIndex(b => b._id === boardId);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const cardIndex = boards[boardIndex].cards.findIndex(card => card._id === req.params.id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Update card properties
    if (title !== undefined) boards[boardIndex].cards[cardIndex].title = title.trim();
    if (description !== undefined) boards[boardIndex].cards[cardIndex].description = description.trim();
    if (column !== undefined) {
      if (!['todo', 'inProgress', 'done'].includes(column)) {
        return res.status(400).json({ 
          error: 'column must be one of: todo, inProgress, done' 
        });
      }
      boards[boardIndex].cards[cardIndex].column = column;
    }
    
    boards[boardIndex].cards[cardIndex].updatedAt = new Date();
    boards[boardIndex].updatedAt = new Date();
    
    res.json(boards[boardIndex].cards[cardIndex]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a card
router.delete('/:id', async (req, res) => {
  try {
    const { boardId } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ error: 'boardId is required' });
    }
    
    const boardIndex = boards.findIndex(b => b._id === boardId);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const cardIndex = boards[boardIndex].cards.findIndex(card => card._id === req.params.id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    boards[boardIndex].cards.splice(cardIndex, 1);
    boards[boardIndex].updatedAt = new Date();
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Move card to different column
router.put('/:id/move', async (req, res) => {
  try {
    const { boardId, sourceColumn, targetColumn, sourceIndex, targetIndex } = req.body;
    
    if (!boardId || !sourceColumn || !targetColumn || 
        sourceIndex === undefined || targetIndex === undefined) {
      return res.status(400).json({ 
        error: 'boardId, sourceColumn, targetColumn, sourceIndex, and targetIndex are required' 
      });
    }
    
    const boardIndex = boards.findIndex(b => b._id === boardId);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const cardIndex = boards[boardIndex].cards.findIndex(card => card._id === req.params.id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Update card column
    boards[boardIndex].cards[cardIndex].column = targetColumn;
    boards[boardIndex].cards[cardIndex].updatedAt = new Date();
    
    // Reorder cards in both columns
    const sourceCards = boards[boardIndex].cards.filter(card => card.column === sourceColumn && card._id !== req.params.id);
    const targetCards = boards[boardIndex].cards.filter(card => card.column === targetColumn && card._id !== req.params.id);
    
    // Insert moved card at target index
    targetCards.splice(targetIndex, 0, boards[boardIndex].cards[cardIndex]);
    
    // Update order values
    sourceCards.forEach((card, index) => {
      const cardIdx = boards[boardIndex].cards.findIndex(c => c._id === card._id);
      boards[boardIndex].cards[cardIdx].order = index;
    });
    
    targetCards.forEach((card, index) => {
      const cardIdx = boards[boardIndex].cards.findIndex(c => c._id === card._id);
      boards[boardIndex].cards[cardIdx].order = index;
    });
    
    boards[boardIndex].updatedAt = new Date();
    res.json(boards[boardIndex].cards[cardIndex]);
  } catch (error) {
    console.error('Error moving card:', error);
    res.status(500).json({ error: 'Failed to move card' });
  }
});

module.exports = router;
