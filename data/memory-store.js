// Shared in-memory data store
let boards = [
  {
    _id: 'test-board-1',
    name: 'Test Board',
    cards: [
      {
        _id: 'card-1',
        title: 'Sample Task',
        description: 'This is a sample task',
        column: 'todo',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = {
  boards,
  generateId
};
