/**
 * PostgreSQL connection settings.
 *
 * Two ways to configure it:
 *
 *   DATABASE_URL="postgres://user:password@host:5432/database"
 *
 * or the discrete variables, which are required when the server listens on a
 * Unix socket rather than TCP (shared hosting often does), because a socket
 * path cannot be expressed in a parseable URL. They also avoid having to
 * percent-encode passwords containing @ : / ? or #.
 *
 *   PGHOST="/var/run/postgresql"
 *   PGDATABASE="my_database"
 *   PGUSER="my_user"
 *   PGPASSWORD="raw password, no encoding needed"
 *
 * PGHOST wins when both are set.
 */
export type PgConnection =
  | { kind: "url"; url: string }
  | { kind: "options"; host: string; port?: number; database?: string; username?: string; password?: string };

export function pgConnection(): PgConnection {
  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, DATABASE_URL } = process.env;

  if (PGHOST) {
    return {
      kind: "options",
      host: PGHOST,
      ...(PGPORT ? { port: Number(PGPORT) } : {}),
      database: PGDATABASE,
      username: PGUSER,
      password: PGPASSWORD,
    };
  }

  if (!DATABASE_URL) {
    throw new Error(
      "No database configured. Set DATABASE_URL, or PGHOST/PGDATABASE/PGUSER/PGPASSWORD when connecting over a Unix socket.",
    );
  }
  return { kind: "url", url: DATABASE_URL };
}

/** Managed Postgres needs TLS; a local server or socket usually has none. */
export const pgSsl = (): false | "prefer" => (process.env.DATABASE_SSL === "false" ? false : "prefer");
