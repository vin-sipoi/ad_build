import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

type DbgResult = {
  uriMasked: string;
  dbName: string | null;
  connected: boolean;
  collections: Record<string, number | string>;
  error?: string;
};

function maskUri(uri: string) {
  // mask credentials in URI
  try {
    const u = uri.replace(/:\/\/(.*):(.+)@/, '://***:***@');
    return u;
  } catch {
    return '***REDACTED***';
  }
}

export async function POST(request: NextRequest) {
  const required = process.env.DEBUG_SEED_SECRET;
  const secret = request.headers.get('x-debug-secret');
  if (!required) {
    return NextResponse.json({ error: 'Server: DEBUG_SEED_SECRET not set' }, { status: 500 });
  }
  if (secret !== required) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uri = process.env.MONGODB_URI || null;
  const dbName = process.env.MONGODB_DB || null;

  const res: DbgResult = {
    uriMasked: uri ? maskUri(uri) : 'MISSING',
    dbName,
    connected: false,
    collections: {},
  };

  if (!uri) {
    res.error = 'MONGODB_URI not set in environment';
    return NextResponse.json(res, { status: 500 });
  }

  try {
    // Use a short lived connection for debugging
    const conn = await mongoose.createConnection(uri, { bufferCommands: false }).asPromise();
    try {
      const adminDb = conn.db;
      if (!adminDb) {
        res.error = 'Failed to retrieve admin database';
        return NextResponse.json(res, { status: 500 });
      }
      // determine target db
      const targetDb = dbName || adminDb.databaseName;
      res.dbName = targetDb;

      // collection list we'll check
      const check = ['users', 'courses', 'topics', 'lessons', 'progresses'];
      for (const col of check) {
        try {
          const count = await adminDb.collection(col).countDocuments();
          res.collections[col] = count;
        } catch {
          res.collections[col] = 'missing or error';
        }
      }

      res.connected = true;
    } finally {
      await conn.close();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.error = msg;
    return NextResponse.json(res, { status: 500 });
  }

  return NextResponse.json(res);
}
