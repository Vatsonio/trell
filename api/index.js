// Main API router for Vercel
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Route to appropriate handler based on URL
    const { url } = req;
    
    if (url?.includes('/health')) {
      // Import and use health handler
      const healthHandler = require('./health');
      return healthHandler(req, res);
    } else if (url?.includes('/boards')) {
      // Import and use boards handler
      const boardsHandler = require('./boards');
      return boardsHandler(req, res);
    } else if (url?.includes('/cards')) {
      // Import and use cards handler
      const cardsHandler = require('./cards');
      return cardsHandler(req, res);
    } else {
      res.status(404).json({ error: 'API endpoint not found', availableEndpoints: ['/api/health', '/api/boards', '/api/cards'] });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message || 'Unknown error' });
  }
};
