import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        mongoUri: process.env.MONGODB_URI ? 'configured' : 'missing',
        vercelEnv: process.env.VERCEL_ENV || 'unknown'
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Health check failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
