import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { pgConnection, pgSsl } from "./src/db/connection";

const conn = pgConnection();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials:
    conn.kind === "url"
      ? { url: conn.url }
      : {
          host: conn.host,
          port: conn.port,
          database: conn.database!,
          // drizzle-kit calls it `user`, the driver calls it `username`.
          user: conn.username,
          password: conn.password,
          ssl: pgSsl(),
        },
});
