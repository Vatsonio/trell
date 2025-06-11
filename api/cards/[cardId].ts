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

  const { cardId } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(cardId as string)) {
      return res.status(400).json({ message: 'Invalid card ID' });
    }

    switch (req.method) {
      case 'PUT':
        // Update card
        const { title, description } = req.body;
        
        const board = await Board.findOne({ 'cards._id': cardId });
        if (!board) {
          return res.status(404).json({ message: 'Card not found' });
        }
        
        const card = board.cards.find(c => c._id?.toString() === cardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }
        
        if (title !== undefined) card.title = title;
        if (description !== undefined) card.description = description;
        
        await board.save();
        return res.json(card);

      case 'DELETE':
        // Delete card
        const boardWithCard = await Board.findOne({ 'cards._id': cardId });
        if (!boardWithCard) {
          return res.status(404).json({ message: 'Card not found' });
        }
        
        boardWithCard.cards = boardWithCard.cards.filter(c => c._id?.toString() !== cardId);
        await boardWithCard.save();
        
        return res.json({ message: 'Card deleted successfully' });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
