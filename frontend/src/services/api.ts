import axios from 'axios';
import { Board, CreateCardData, UpdateCardData, MoveCardData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const boardApi = {
  // Get board by ID
  getBoard: async (id: string): Promise<Board> => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  // Create new board
  createBoard: async (name: string): Promise<Board> => {
    const response = await api.post('/boards', { name });
    return response.data;
  },

  // Update board
  updateBoard: async (id: string, name: string): Promise<Board> => {
    const response = await api.put(`/boards/${id}`, { name });
    return response.data;
  },

  // Delete board
  deleteBoard: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },

  // Add card to board
  addCard: async (boardId: string, cardData: CreateCardData) => {
    const response = await api.post(`/boards/${boardId}/cards`, cardData);
    return response.data;
  },
};

export const cardApi = {
  // Update card
  updateCard: async (cardId: string, cardData: UpdateCardData) => {
    const response = await api.put(`/cards/${cardId}`, cardData);
    return response.data;
  },

  // Delete card
  deleteCard: async (cardId: string): Promise<void> => {
    await api.delete(`/cards/${cardId}`);
  },

  // Move card
  moveCard: async (cardId: string, moveData: MoveCardData) => {
    const response = await api.put(`/cards/${cardId}/move`, moveData);
    return response.data;
  },
};