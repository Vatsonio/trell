import axios from 'axios';

// Use Vercel deployment URL in production, localhost in development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // This will use the same domain as the frontend on Vercel
  : process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const boardApi = {
  // Get board by ID
  getBoard: async (id) => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  // Create new board
  createBoard: async (name) => {
    const response = await api.post('/boards', { name });
    return response.data;
  },

  // Update board
  updateBoard: async (id, name) => {
    const response = await api.put(`/boards/${id}`, { name });
    return response.data;
  },

  // Delete board
  deleteBoard: async (id) => {
    await api.delete(`/boards/${id}`);
  },

  // Add card to board
  addCard: async (boardId, cardData) => {
    const response = await api.post(`/boards/${boardId}/cards`, cardData);
    return response.data;
  },
};

export const cardApi = {
  // Update card
  updateCard: async (cardId, cardData) => {
    const response = await api.put(`/cards/${cardId}`, cardData);
    return response.data;
  },

  // Delete card
  deleteCard: async (cardId) => {
    await api.delete(`/cards/${cardId}`);
  },

  // Move card
  moveCard: async (cardId, moveData) => {
    const response = await api.put(`/cards/${cardId}/move`, moveData);
    return response.data;
  },
};
