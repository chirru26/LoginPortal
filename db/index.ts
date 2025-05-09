import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a PostgreSQL client
export const client = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum number of connections
});

// Export PostgreSQL pool for session store
export const pool = {
  connect: async () => client,
  query: async (text: string, params: any[] = []) => {
    return client.unsafe(text, params);
  },
  end: async () => {
    await client.end();
  }
};

// Export the drizzle instance
export const db = drizzle(client, { schema });