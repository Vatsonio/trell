import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Column from './Column';

const Board = ({ board }) => {
  // Group cards by column
  const todoCards = board.cards.filter((card) => card.column === 'todo');
  const inProgressCards = board.cards.filter((card) => card.column === 'inProgress');
  const doneCards = board.cards.filter((card) => card.column === 'done');

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
