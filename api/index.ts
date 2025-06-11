import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is the main API router for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    
    if (url?.includes('/boards')) {
      // Import and use boards handler
      const { default: boardsHandler } = await import('./boards');
      return boardsHandler(req, res);
    } else if (url?.includes('/cards')) {
      // Import and use cards handler
      const { default: cardsHandler } = await import('./cards');
      return cardsHandler(req, res);
    } else {
      res.status(404).json({ error: 'API endpoint not found', availableEndpoints: ['/api/boards', '/api/cards'] });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
