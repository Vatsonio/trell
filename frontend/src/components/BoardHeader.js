import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBoard, updateBoard, deleteBoard } from '../store/slices/boardSlice';

const BoardHeader = ({ board, onLoadBoard }) => {
  const dispatch = useDispatch();
  const [boardId, setBoardId] = useState('');
  const [boardName, setBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleLoadBoard = () => {
    if (boardId.trim()) {
      onLoadBoard(boardId.trim());
      setBoardId('');
    }
  };

  const handleCreateBoard = async () => {
    if (boardName.trim()) {
      await dispatch(createBoard(boardName.trim()));
      setBoardName('');
      setIsCreating(false);
    }
  };

  const handleUpdateBoard = async () => {
    if (board && boardName.trim()) {
      await dispatch(updateBoard({ id: board._id, name: boardName.trim() }));
      setBoardName('');
      setIsEditing(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (board && window.confirm('Are you sure you want to delete this board?')) {
      await dispatch(deleteBoard(board._id));
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Load Board Section */}
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter a board ID here..."
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLoadBoard();
              }
            }}
          />
          <button
            onClick={handleLoadBoard}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Load
          </button>
        </div>

        {/* Board Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {board ? (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                      placeholder="Board name"
                      className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateBoard();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateBoard}
                      className="px-3 py-1 bg-success text-white rounded hover:bg-green-600 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setBoardName('');
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">{board.name}</h1>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setBoardName(board.name);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Edit board name"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
                <span className="text-sm text-gray-500">ID: {board._id}</span>
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-800">Task Management Board</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {board ? (
              <button
                onClick={handleDeleteBoard}
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete Board
              </button>
            ) : (
              <>
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                      placeholder="Enter board name"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateBoard();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleCreateBoard}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 font-medium"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setBoardName('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Create New Board
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;
