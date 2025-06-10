"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Board_1 = require("../models/Board");
const generateId_1 = require("../utils/generateId");
const router = (0, express_1.Router)();
// Get board by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const board = await Board_1.Board.findById(id);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        res.json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// Create new board
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Board name is required' });
        }
        const boardId = (0, generateId_1.generateBoardId)();
        const board = new Board_1.Board({
            _id: boardId,
            name,
            cards: []
        });
        await board.save();
        res.status(201).json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// Update board
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const board = await Board_1.Board.findByIdAndUpdate(id, { name }, { new: true });
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        res.json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// Delete board
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const board = await Board_1.Board.findByIdAndDelete(id);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        res.json({ message: 'Board deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// Add card to board
router.post('/:id/cards', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, column } = req.body;
        if (!title || !column) {
            return res.status(400).json({ message: 'Title and column are required' });
        }
        const board = await Board_1.Board.findById(id);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        // Get the highest order number for the column
        const cardsInColumn = board.cards.filter(card => card.column === column);
        const maxOrder = cardsInColumn.length > 0
            ? Math.max(...cardsInColumn.map(card => card.order))
            : -1;
        const newCard = {
            title,
            description: description || '',
            column,
            order: maxOrder + 1,
            _id: (0, generateId_1.generateBoardId)()
        };
        board.cards.push(newCard);
        await board.save();
        res.status(201).json(newCard);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=boards.js.map