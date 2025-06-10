import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, Board as BoardType } from '../types';
import Column from './Column';

interface BoardProps {
  board: BoardType;
}

const Board: React.FC<BoardProps> = ({ board }) => {
  // Group cards by column
  const todoCards = board.cards.filter((card: Card) => card.column === 'todo');
  const inProgressCards = board.cards.filter((card: Card) => card.column === 'inProgress');
  const doneCards = board.cards.filter((card: Card) => card.column === 'done');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6 p-6 min-h-screen bg-gray-100">
        <Column
          title="To Do"
          column="todo"
          cards={todoCards}
          boardId={board._id}
        />
        <Column
          title="In Progress"
          column="inProgress"
          cards={inProgressCards}
          boardId={board._id}
        />
        <Column
          title="Done"
          column="done"
          cards={doneCards}
          boardId={board._id}
        />
      </div>
    </DndProvider>
  );
};

export default Board;
