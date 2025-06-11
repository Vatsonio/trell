const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (using in-memory versions for testing)
app.use('/api/health', require('./routes/health'));
app.use('/api/boards', require('./routes/boards-memory'));
app.use('/api/cards', require('./routes/cards-memory'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Trell API Server (In-Memory Version)', 
    endpoints: [
      '/api/health',
      '/api/boards',
      '/api/cards'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧠 Using in-memory storage for testing`);
});

module.exports = app;
