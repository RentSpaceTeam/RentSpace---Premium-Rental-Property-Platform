import mongoose from 'mongoose';
import { dbStore } from '../store.ts';

/**
 * Safely sanitizes raw MONGODB_URI string.
 * Removes surrounding quotes and accidental copy-paste whitespace (e.g. 'mongodb  +srv://' or linebreaks).
 */
export function cleanMongoUri(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s+/g, '');
}

/**
 * Masks username and password from a MongoDB connection string to ensure credentials
 * are NEVER printed in server logs, error outputs, or diagnostics.
 */
export function maskMongoUri(uri: string): string {
  if (!uri) return '[NOT CONFIGURED]';
  return uri.replace(/\/\/[^@]+@/, '//***:***@');
}

export interface DatabaseStatus {
  isConnected: boolean;
  readyState: number;
  dbName: string;
  host: string | null;
  maskedUri: string;
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus(): DatabaseStatus {
  const readyState = mongoose.connection.readyState;
  const isConnected = readyState === 1;
  const rawUri = process.env.MONGODB_URI || '';
  const maskedUri = maskMongoUri(cleanMongoUri(rawUri));

  return {
    isConnected,
    readyState,
    dbName: mongoose.connection.name || 'rentspace',
    host: mongoose.connection.host ? mongoose.connection.host.replace(/:.*$/, '') : null,
    maskedUri
  };
}

/**
 * Reusable database connection module.
 * Establishes Mongoose connection to MongoDB Atlas with the database name 'rentspace'.
 */
export async function connectToDatabase(): Promise<boolean> {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    console.warn('[RentSpace Database] MONGODB_URI environment variable is not defined.');
    console.warn('[RentSpace Database] Operating with the high-fidelity persistent in-memory store.');
    dbStore.isMongoConnected = false;
    return false;
  }

  const cleanedUri = cleanMongoUri(rawUri);

  if (!cleanedUri.startsWith('mongodb://') && !cleanedUri.startsWith('mongodb+srv://')) {
    console.warn(`[RentSpace Database] Invalid MONGODB_URI scheme in ${maskMongoUri(cleanedUri)}. Expected 'mongodb://' or 'mongodb+srv://'.`);
    dbStore.isMongoConnected = false;
    return false;
  }

  console.log(`[RentSpace Database] Connecting to MongoDB Atlas cluster at ${maskMongoUri(cleanedUri)}...`);

  try {
    // Configure Mongoose to connect to database 'rentspace'
    await mongoose.connect(cleanedUri, {
      dbName: 'rentspace',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      autoIndex: true
    });

    dbStore.isMongoConnected = true;
    console.log(`[RentSpace Database] Connected successfully to MongoDB Atlas! Active database: "${mongoose.connection.name}"`);

    // Attach lifecycle listeners
    mongoose.connection.on('error', (err) => {
      console.error('[RentSpace Database] Mongoose runtime connection error:', err.message);
      dbStore.isMongoConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[RentSpace Database] Mongoose disconnected from MongoDB Atlas.');
      dbStore.isMongoConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[RentSpace Database] Mongoose reconnected to MongoDB Atlas.');
      dbStore.isMongoConnected = true;
    });

    // Populate initial collections if MongoDB Atlas is empty
    await dbStore.syncInitialDataToMongo();

    return true;
  } catch (err: any) {
    dbStore.isMongoConnected = false;
    console.warn(`[RentSpace Database] MongoDB Atlas connection notice: ${err.message}`);

    if (err.message?.includes('SSL alert number 80') || err.message?.includes('whitelist') || err.message?.includes('IP')) {
      console.warn('[RentSpace Database] TIP: MongoDB Atlas requires whitelisting your IP in Network Access.');
      console.warn('[RentSpace Database] Add 0.0.0.0/0 (Allow access from anywhere) in Atlas Console -> Security -> Network Access.');
    }

    console.warn('[RentSpace Database] RentSpace continues operating reliably with high-fidelity store layer.');
    return false;
  }
}

/**
 * Reusable disconnect function for graceful server shutdown and testing
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    dbStore.isMongoConnected = false;
    console.log('[RentSpace Database] Disconnected from MongoDB.');
  }
}

// Backwards-compatible alias for existing server.ts entry point
export const initDatabaseConnection = connectToDatabase;
