import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Minimal DB connection setup to satisfy template requirements
// The actual app data is in Firestore.
// We use a dummy connection string if none is provided to avoid crashes during build,
// though in production this backend might not be used for data.

const connectionString = process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname";

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
