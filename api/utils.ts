import type { VercelRequest, VercelResponse } from '@vercel/node';

export function withErrorHandling(handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Set CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('MONGODB_URI')) {
          res.status(500).json({ 
            error: 'Database configuration error',
            message: 'MongoDB connection not configured properly'
          });
        } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          res.status(504).json({ 
            error: 'Database timeout',
            message: 'Database connection timed out'
          });
        } else {
          res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
          });
        }
      } else {
        res.status(500).json({ 
          error: 'Unknown error',
          message: 'An unexpected error occurred'
        });
      }
    }
  };
}
