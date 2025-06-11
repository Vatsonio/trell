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

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskboard';
    await mongoose.connect(mongoUri);
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
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
    await connectDB();
    
    const { method, url } = req;
    const pathParts = url?.split('/').filter(Boolean) || [];
    
    if (method === 'POST' && pathParts.length === 2) {
      const { boardId, title, description, column } = req.body;
      
      if (!boardId || !title || !column) {
        res.status(400).json({ error: 'Board ID, title, and column are required' });
        return;
      }
        const board = await (Board as any).findById(boardId);
      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }
      
      const cardsInColumn = board.cards.filter(card => card.column === column);
      const order = cardsInColumn.length;
      
      const newCard = {
        _id: new mongoose.Types.ObjectId(),
        title,
        description: description || '',
        column,
        order,
      };
      
      board.cards.push(newCard);
      await board.save();
      
      res.status(201).json(newCard);
      return;
    }
    
    if (method === 'PUT' && pathParts.length === 3) {
      const cardId = pathParts[2];
      
      if (!mongoose.Types.ObjectId.isValid(cardId)) {        res.status(400).json({ error: 'Invalid card ID' });
        return;
      }
      
      const board = await (Board as any).findOne({ 'cards._id': cardId });
      if (!board) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }
      
      const card = board.cards.find(c => c._id?.toString() === cardId);
      if (!card) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }
      
      if (url?.includes('/move')) {
        const { column, order } = req.body;
        
        if (!column || order === undefined) {
          res.status(400).json({ error: 'Column and order are required' });
          return;
        }
        
        card.column = column;
        card.order = order;
        
        const cardsInColumn = board.cards.filter(c => 
          c.column === column && c._id?.toString() !== cardId
        );
        
        cardsInColumn.forEach((c, index) => {
          if (index >= order) {
            c.order = index + 1;
          }
        });
      } else {
        const { title, description } = req.body;
        
        if (title !== undefined) card.title = title;
        if (description !== undefined) card.description = description;
      }
      
      await board.save();
      res.status(200).json(card);
      return;
    }
    
    if (method === 'DELETE' && pathParts.length === 3) {
      const cardId = pathParts[2];
      
      if (!mongoose.Types.ObjectId.isValid(cardId)) {
        res.status(400).json({ error: 'Invalid card ID' });
        return;
      }
        const board = await (Board as any).findOne({ 'cards._id': cardId });
      if (!board) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }
      
      board.cards = board.cards.filter(c => c._id?.toString() !== cardId);
      await board.save();
      
      res.status(200).json({ message: 'Card deleted successfully' });
      return;
    }
    
    res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('Cards API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
