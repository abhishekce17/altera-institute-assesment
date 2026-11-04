import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database Error] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB connection lost');
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${(error as Error).message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly');
  } catch (error) {
    console.error(`[Database Error] Disconnect error: ${(error as Error).message}`);
  }
}
