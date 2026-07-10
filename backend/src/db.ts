import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// One Prisma client per isolate. Edge functions are short-lived and
// per-request, but many platforms reuse the same isolate across requests, so
// caching here avoids reconnecting every time. Keyed by URL so switching
// environments (or tests using a different DB) doesn't reuse a stale client.
const cache = new Map<string, PrismaClient>();

export function getPrisma(databaseUrl: string): PrismaClient {
  const existing = cache.get(databaseUrl);
  if (existing) return existing;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .dev.vars (dev) or `wrangler secret " +
        "put DATABASE_URL` (production) — see .dev.vars.example."
    );
  }

  // PrismaNeon is a driver-adapter *factory*: it takes connection config
  // (not an already-open Pool) and PrismaClient calls .connect() on it
  // internally, lazily, on first query.
  const adapter = new PrismaNeon({ connectionString: databaseUrl });
  const client = new PrismaClient({ adapter });
  cache.set(databaseUrl, client);
  return client;
}
