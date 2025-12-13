import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env first, then let .env.local override everything.
// This avoids situations where an old/placeholder DATABASE_URL is already present in the environment.
config({ path: ".env" });
config({ path: ".env.local", override: true });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
