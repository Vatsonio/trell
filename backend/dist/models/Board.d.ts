import mongoose, { Document } from 'mongoose';
export interface ICard {
    _id?: string;
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
export declare const Board: mongoose.Model<IBoard, {}, {}, {}, mongoose.Document<unknown, {}, IBoard, {}> & IBoard & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Board.d.ts.map