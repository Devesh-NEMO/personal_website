import { MongoClient } from "mongodb";

/**
 * One cached Mongo client for the whole process.
 *
 * MongoClient pools connections internally; the expensive part is *creating*
 * a client, and doing it per request (or per hot reload) is how the Atlas
 * free-tier connection limit gets exhausted. The global cache survives HMR in
 * dev and serverless instance warm-up in production, so the pool is created
 * once and then shared for the life of the process.
 *
 * `MONGODB_URI` never has a NEXT_PUBLIC prefix — this module is imported only
 * from server code (`src/lib/content.ts`, the admin layer, scripts), never
 * from a client component. `server-only` is applied at the content layer as a
 * belt-and-braces guarantee that the chain cannot be bundled client-side.
 */

const uri = process.env.MONGODB_URI;

const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
};

export function getMongoClient(): MongoClient | null {
  if (!uri) return null;

  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(uri, {
      // One admin plus a visitor contact form: 5 is plenty. Atlas free tier
      // caps out at 500 connections, and each one is a server-side socket.
      maxPoolSize: 5,
      // Fail fast so the public page can drop to its static fallback instead
      // of hanging for the driver's default 30s.
      serverSelectionTimeoutMS: 4000,
    });
  }

  return globalForMongo._mongoClient;
}

/**
 * The database named in `MONGODB_URI`, or `null` when it is not set or cannot
 * be reached.
 *
 * Resolves the same cached client every call, so concurrent requests share
 * one connection pool. `connect()` is idempotent — it returns immediately on
 * an already-connected client.
 *
 * Never throws: a dead database must degrade to the static content fallback,
 * not break a render or a build. The warning is deduped so a long-running
 * process doesn't repeat it on every request.
 */
let hasWarned = false;

export async function connectToDatabase() {
  const client = getMongoClient();
  if (!client) return null;

  try {
    await client.connect();
    return client.db();
  } catch (error) {
    if (!hasWarned) {
      hasWarned = true;
      console.warn(
        `[mongodb] Unreachable — falling back to static content in src/data. (${(error as Error).message})`,
      );
    }
    return null;
  }
}

/** Closes the cached client. Used by the seed script so the process exits. */
export async function disconnect() {
  const client = getMongoClient();
  if (!client) return;
  await client.close();
}