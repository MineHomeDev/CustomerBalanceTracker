import { User, InsertUser, Transaction, InsertTransaction, Point, InsertPoint } from "@shared/schema";
import { users as usersTable, transactions, points } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByQRCodeId(qrCodeId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateBalance(userId: number, newBalance: number): Promise<User>;
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  addPoints(userId: number, amount: number, reason: string): Promise<Point>;
  getPoints(userId: number): Promise<Point[]>;
  searchUsers(query: string): Promise<User[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      console.log('Executing user search:', query);
      const results = await db
        .select()
        .from(usersTable)
        .where(ilike(usersTable.email, `%${query}%`))
        .limit(10);
      console.log('Search results:', results);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(usersTable)
        .values({
          ...insertUser,
          balance: 0,
          isCashier: insertUser.isCashier || false,
          points: 0
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateBalance(userId: number, newBalance: number): Promise<User> {
    try {
      const [user] = await db
        .update(usersTable)
        .set({ balance: newBalance })
        .where(eq(usersTable.id, userId))
        .returning();

      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    try {
      return await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.timestamp));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    try {
      const [transaction] = await db
        .insert(transactions)
        .values(insertTransaction)
        .returning();
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async addPoints(userId: number, amount: number, reason: string): Promise<Point> {
    try {
      await db
        .update(usersTable)
        .set({ 
          points: sql`${usersTable.points} + ${amount}` 
        })
        .where(eq(usersTable.id, userId));

      const [point] = await db
        .insert(points)
        .values({
          userId,
          amount,
          reason,
        })
        .returning();

      return point;
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  async getPoints(userId: number): Promise<Point[]> {
    try {
      return await db
        .select()
        .from(points)
        .where(eq(points.userId, userId))
        .orderBy(desc(points.timestamp));
    } catch (error) {
      console.error('Error getting points:', error);
      throw error;
    }
  }

  async getUserByQRCodeId(qrCodeId: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.qrCodeId, qrCodeId));
      return user;
    } catch (error) {
      console.error('Error getting user by QR code ID:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();