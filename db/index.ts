import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a MySQL connection pool
export const pool = mysql.createPool({
  // Parse the database URL to extract connection details
  ...(process.env.DATABASE_URL ? parseDatabaseUrl(process.env.DATABASE_URL) : {}),
  // SSL configuration for MySQL
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined,
  // Set environment variables for MySQL session store
  ...(process.env.DATABASE_URL && (() => {
    const config = parseDatabaseUrl(process.env.DATABASE_URL);
    process.env.MYSQL_HOST = config.host;
    process.env.MYSQL_PORT = String(config.port);
    process.env.MYSQL_USER = config.user;
    process.env.MYSQL_PASSWORD = config.password;
    process.env.MYSQL_DATABASE = config.database;
    return {};
  })())
});

// Helper function to parse DATABASE_URL into MySQL connection config
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '3306'),
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.substring(1), // Remove leading slash
    };
  } catch (error) {
    console.error('Failed to parse DATABASE_URL:', error);
    return {};
  }
}

// Export the drizzle instance
export const db = drizzle(pool, { schema, mode: 'default' });