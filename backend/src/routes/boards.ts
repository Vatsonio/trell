import { Router, Request, Response } from 'express';
import { Board, IBoard } from '../models/Board';
import { generateBoardId } from '../utils/generateId';
import mongoose from 'mongoose';

const router = Router();

// Get board by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create new board
router.post('/', async (req: Request, res: Response) => {
  try {
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
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update board
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const board = await Board.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete board
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const board = await Board.findByIdAndDelete(id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Add card to board
router.post('/:id/cards', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, column } = req.body;
    
    if (!title || !column) {
      return res.status(400).json({ message: 'Title and column are required' });
    }
    
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
      // Get the highest order number for the column
    const cardsInColumn = board.cards.filter(card => card.column === column);
    const maxOrder = cardsInColumn.length > 0 
      ? Math.max(...cardsInColumn.map(card => card.order))
      : -1;
      
    const newCard = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description: description || '',
      column,
      order: maxOrder + 1,
    };
    
    board.cards.push(newCard);
    await board.save();
    
    // Get the created card from the saved board
    const createdCard = board.cards[board.cards.length - 1];
    res.status(201).json(createdCard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
