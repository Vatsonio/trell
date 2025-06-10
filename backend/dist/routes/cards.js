"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Board_1 = require("../models/Board");
const router = (0, express_1.Router)();
// Update card
router.put('/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        const { title, description } = req.body;
        const board = await Board_1.Board.findOne({ 'cards._id': cardId });
        if (!board) {
            return res.status(404).json({ message: 'Card not found' });
        }
        const card = board.cards.find(c => c._id?.toString() === cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        if (title !== undefined)
            card.title = title;
        if (description !== undefined)
            card.description = description;
        await board.save();
        res.json(card);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// Delete card
router.delete('/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        const board = await Board_1.Board.findOne({ 'cards._id': cardId });
        if (!board) {
            return res.status(404).json({ message: 'Card not found' });
        }
        board.cards = board.cards.filter(c => c._id?.toString() !== cardId);
        await board.save();
        res.json({ message: 'Card deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// Move card (drag and drop)
router.put('/:cardId/move', async (req, res) => {
    try {
        const { cardId } = req.params;
        const { column, order } = req.body;
        if (!column || order === undefined) {
            return res.status(400).json({ message: 'Column and order are required' });
        }
        const board = await Board_1.Board.findOne({ 'cards._id': cardId });
        if (!board) {
            return res.status(404).json({ message: 'Card not found' });
        }
        const card = board.cards.find(c => c._id?.toString() === cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        const oldColumn = card.column;
        const oldOrder = card.order;
        // Update card column and order
        card.column = column;
        card.order = order;
        // Reorder cards in the old column
        if (oldColumn !== column) {
            board.cards
                .filter(c => c.column === oldColumn && c.order > oldOrder)
                .forEach(c => c.order--);
        }
        // Reorder cards in the new column
        board.cards
            .filter(c => c.column === column &&
            c._id?.toString() !== cardId &&
            c.order >= order)
            .forEach(c => c.order++);
        await board.save();
        res.json(card);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=cards.js.map