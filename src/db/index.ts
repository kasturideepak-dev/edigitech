import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { pgConnection, pgSsl } from "./connection";

// Reuse the connection across hot reloads in development.
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

function connect() {
  const conn = pgConnection();
  // shared hosting has low connection limits
  const common = { max: 5, ssl: pgSsl() };
  return conn.kind === "url"
    ? postgres(conn.url, common)
    : postgres({
        host: conn.host,
        port: conn.port,
        database: conn.database,
        username: conn.username,
        password: conn.password,
        ...common,
      });
}

const client = globalForDb.pgClient ?? connect();

if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export { schema };
