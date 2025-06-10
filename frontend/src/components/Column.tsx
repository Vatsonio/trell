import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { addCard, moveCard } from '../store/slices/boardSlice';
import { Card as CardType } from '../types';
import Card from './Card';

interface ColumnProps {
  title: string;
  column: 'todo' | 'inProgress' | 'done';
  cards: CardType[];
  boardId: string;
}

const Column: React.FC<ColumnProps> = ({ title, column, cards, boardId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');

  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    drop: (item: { id: string; column: string; order: number }) => {
      if (item.column !== column) {
        // Moving to different column
        dispatch(moveCard({
          cardId: item.id,
          moveData: { column, order: cards.length }
        }));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      await dispatch(addCard({
        boardId,
        cardData: {
          title: newCardTitle.trim(),
          description: newCardDescription.trim(),
          column
        }
      }));
      setNewCardTitle('');
      setNewCardDescription('');
      setIsAddingCard(false);
    }
  };

  const handleCancel = () => {
    setNewCardTitle('');
    setNewCardDescription('');
    setIsAddingCard(false);
  };

  // Sort cards by order
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  return (
    <div
      ref={drop}
      className={`flex-1 bg-gray-50 rounded-lg p-4 min-h-96 transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
      }`}
    >
      <h2 className="font-semibold text-gray-800 mb-4 text-center">{title}</h2>
      
      <div className="space-y-3">
        {sortedCards.map((card) => (
          <Card key={card._id} card={card} />
        ))}
        
        {isAddingCard ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-3">
              <input
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter a title for this card..."
                autoFocus
              />
              <textarea
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Description..."
                rows={3}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddCard}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 font-medium"
                >
                  Add Card
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;
