import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    // Basic environment check
    const envCheck = {
      hasMongoUri: !!mongoUri,
      mongoUriLength: mongoUri ? mongoUri.length : 0,
      mongoUriStart: mongoUri ? mongoUri.substring(0, 20) + '...' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
      connectionState: mongoose.connection.readyState
    };

    // Simple connection test
    if (mongoUri) {
      try {
        const connectionTest = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        });
        
        res.status(200).json({
          status: 'success',
          message: 'MongoDB connection test successful',
          environment: envCheck,
          connectionReady: mongoose.connection.readyState === 1
        });
      } catch (connectionError) {
        res.status(500).json({
          status: 'error',
          message: 'MongoDB connection failed',
          environment: envCheck,
          error: connectionError instanceof Error ? connectionError.message : 'Unknown error'
        });
      }
    } else {
      res.status(500).json({
        status: 'error',
        message: 'MONGODB_URI not set',
        environment: envCheck
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
