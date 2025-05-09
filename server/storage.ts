import { db } from "@db";
import { users, userDbSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import { pool } from "@db";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";

// Initialize MySQL session store
const MySQLSessionStore = MySQLStore(session);

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
    // MySQL session store configuration
    const sessionStoreOptions = {
      createDatabaseTable: true,
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      }
    };
    
    // Create an instance of MySQL session store
    this.sessionStore = new MySQLSessionStore(sessionStoreOptions, pool);
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
      console.log("🔍 Validating user data against schema...");
      // Validate the user data against our schema
      const validUser = userDbSchema.parse(user);
      console.log("✅ User data validated successfully");
      
      // Log the validated data
      console.log("📊 Validated user data:", {
        username: validUser.username,
        firstName: validUser.firstName,
        lastName: validUser.lastName,
        email: validUser.email,
        phone: validUser.phone,
        hasAuthCode: !!validUser.authCode,
      });
      
      console.log("🔄 Inserting user into database...");
      // Insert the user into the database
      const [result] = await db.insert(users)
        .values(validUser)
        .returning();

      console.log(`✅ User inserted successfully with ID: ${result.id}`);
      return result;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
