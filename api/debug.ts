import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check environment variables
    const mongoUri = process.env.MONGODB_URI;
    
    res.status(200).json({
      message: 'Debug endpoint',
      mongoUri: mongoUri ? 'SET' : 'NOT SET',
      mongoUriLength: mongoUri ? mongoUri.length : 0,
      nodeEnv: process.env.NODE_ENV,
      method: req.method,
      url: req.url,
      body: req.body
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
