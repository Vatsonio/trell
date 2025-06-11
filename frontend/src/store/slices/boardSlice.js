import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardApi, cardApi } from '../../services/api';

const initialState = {
  currentBoard: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (boardId) => {
    const board = await boardApi.getBoard(boardId);
    return board;
  }
);

export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (name) => {
    const board = await boardApi.createBoard(name);
    return board;
  }
);

export const updateBoard = createAsyncThunk(
  'board/updateBoard',
  async ({ id, name }) => {
    const board = await boardApi.updateBoard(id, name);
    return board;
  }
);

export const deleteBoard = createAsyncThunk(
  'board/deleteBoard',
  async (boardId) => {
    await boardApi.deleteBoard(boardId);
    return boardId;
  }
);

export const addCard = createAsyncThunk(
  'board/addCard',
  async ({ boardId, cardData }) => {
    const card = await boardApi.addCard(boardId, cardData);
    return card;
  }
);

export const updateCard = createAsyncThunk(
  'board/updateCard',
  async ({ cardId, cardData }) => {
    const card = await cardApi.updateCard(cardId, cardData);
    return card;
  }
);

export const deleteCard = createAsyncThunk(
  'board/deleteCard',
  async (cardId) => {
    await cardApi.deleteCard(cardId);
    return cardId;
  }
);

export const moveCard = createAsyncThunk(
  'board/moveCard',
  async ({ cardId, moveData }) => {
    const card = await cardApi.moveCard(cardId, moveData);
    return card;
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBoard: (state) => {
      state.currentBoard = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch board
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board';
      })
      // Create board
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create board';
      })
      // Update board
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.currentBoard = action.payload;
      })
      // Delete board
      .addCase(deleteBoard.fulfilled, (state) => {
        state.currentBoard = null;
      })
      // Add card
      .addCase(addCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          state.currentBoard.cards.push(action.payload);
        }
      })
      // Update card
      .addCase(updateCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          const cardIndex = state.currentBoard.cards.findIndex(
            card => card._id === action.payload._id
          );
          if (cardIndex !== -1) {
            state.currentBoard.cards[cardIndex] = action.payload;
          }
        }
      })
      // Delete card
      .addCase(deleteCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          state.currentBoard.cards = state.currentBoard.cards.filter(
            card => card._id !== action.payload
          );
        }
      })
      // Move card
      .addCase(moveCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          const cardIndex = state.currentBoard.cards.findIndex(
            card => card._id === action.payload._id
          );
          if (cardIndex !== -1) {
            state.currentBoard.cards[cardIndex] = action.payload;
          }
        }
      });
  },
});

export const { clearError, clearBoard } = boardSlice.actions;
export default boardSlice.reducer;
