import React from 'react';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import { store, RootState, AppDispatch } from './store/store';
import { fetchBoard } from './store/slices/boardSlice';
import BoardHeader from './components/BoardHeader';
import Board from './components/Board';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBoard, loading, error } = useSelector((state: RootState) => state.board);

  const handleLoadBoard = (boardId: string) => {
    dispatch(fetchBoard(boardId));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <BoardHeader board={currentBoard} onLoadBoard={handleLoadBoard} />
      
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {currentBoard && !loading && !error && (
        <Board board={currentBoard} />
      )}
      
      {!currentBoard && !loading && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to Task Management Board</h2>
            <p className="text-gray-600 mb-6">Create a new board or load an existing one to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
