import mongoose, { Document, Schema } from 'mongoose';

export interface ICard {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  column: 'todo' | 'inProgress' | 'done';
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBoard extends Document {
  _id: string;
  name: string;
  cards: ICard[];
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>({
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

const BoardSchema = new Schema<IBoard>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  cards: [CardSchema],
}, {
  timestamps: true,
  _id: false
});

export const Board = mongoose.model<IBoard>('Board', BoardSchema);
