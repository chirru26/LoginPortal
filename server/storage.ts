import { db } from "@db";
import { users, userDbSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";

const PostgresSessionStore = connectPg(session);

// Type for database operations
export type DbUser = z.infer<typeof userDbSchema>;

export interface IStorage {
  getUserById(id: number): Promise<SelectUser>;
  getUserByUsername(username: string): Promise<SelectUser | undefined>;
  createUser(user: DbUser): Promise<SelectUser>;
  sessionStore: session.Store;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'sessions'
    });
  }

  async getUserById(id: number): Promise<SelectUser> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });

    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }

    return result;
  }

  async getUserByUsername(username: string): Promise<SelectUser | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    return result;
  }

  async createUser(user: DbUser): Promise<SelectUser> {
    try {
      // Validate the user data against our schema
      const validUser = userDbSchema.parse(user);
      
      // Insert the user into the database
      const [result] = await db.insert(users)
        .values(validUser)
        .returning();

      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
