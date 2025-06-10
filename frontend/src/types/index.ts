export interface Card {
  _id: string;
  title: string;
  description: string;
  column: 'todo' | 'inProgress' | 'done';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Board {
  _id: string;
  name: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardState {
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
}

export interface CreateCardData {
  title: string;
  description: string;
  column: 'todo' | 'inProgress' | 'done';
}

export interface UpdateCardData {
  title?: string;
  description?: string;
}

export interface MoveCardData {
  column: 'todo' | 'inProgress' | 'done';
  order: number;
}