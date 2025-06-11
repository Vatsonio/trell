import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { Board } from '../../../backend/src/models/Board';

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
      case 'POST':
        // Add card to board
        const { title, description, column } = req.body;
        
        if (!title || !column) {
          return res.status(400).json({ message: 'Title and column are required' });
        }
        
        const board = await Board.findById(id);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }
        
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
        
        const createdCard = board.cards[board.cards.length - 1];
        return res.status(201).json(createdCard);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
