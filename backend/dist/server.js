"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const boards_1 = __importDefault(require("./routes/boards"));
const cards_1 = __importDefault(require("./routes/cards"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/boards', boards_1.default);
app.use('/api/cards', cards_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running with MongoDB!' });
});
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskboard';
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    console.log('Starting server without MongoDB connection...');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} (without MongoDB)`);
    });
});
//# sourceMappingURL=server.js.map