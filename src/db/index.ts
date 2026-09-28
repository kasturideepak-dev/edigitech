import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse the connection across hot reloads in development.
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

const client =
  globalForDb.pgClient ??
  postgres(process.env.DATABASE_URL!, {
    max: 5, // shared hosting has low connection limits
    // Managed Postgres (Neon/Supabase) requires TLS; a local server usually has none.
    ssl: process.env.DATABASE_SSL === "false" ? false : "prefer",
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export { schema };
