import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  __sushi_sql__?: ReturnType<typeof postgres>;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Allow the app to boot without DB for UI-only work.
  // Any DB usage should fail loudly.
  console.warn("[db] DATABASE_URL is not set. DB is disabled.");
}

const sql =
  globalForDb.__sushi_sql__ ??
  postgres(databaseUrl ?? "postgres://invalid", {
    ssl: databaseUrl ? "require" : undefined,
    max: 1,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__sushi_sql__ = sql;

export const db = drizzle(sql, { schema });
