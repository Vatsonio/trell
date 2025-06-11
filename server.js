const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/cards', require('./routes/cards'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Trell API Server', 
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
});

module.exports = app;
