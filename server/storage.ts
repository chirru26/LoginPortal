import { db } from "@db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import { User as SelectUser, InsertUser } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUserById(id: number): Promise<SelectUser>;
  getUserByUsername(username: string): Promise<SelectUser | undefined>;
  createUser(user: Omit<InsertUser, "id">): Promise<SelectUser>;
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

  async createUser(user: Omit<InsertUser, "id">): Promise<SelectUser> {
    const [result] = await db.insert(users)
      .values(user)
      .returning();

    return result;
  }
}

export const storage = new DatabaseStorage();
