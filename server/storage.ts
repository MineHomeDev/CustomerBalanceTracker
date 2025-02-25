import { User, InsertUser, Transaction, InsertTransaction, Point, InsertPoint, Achievement, InsertAchievement } from "@shared/schema";
import { users as usersTable, transactions, points, achievements } from "@shared/schema";
import { db } from "./db";
import { eq, ilike } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateBalance(userId: number, newBalance: number): Promise<User>;
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  addPoints(userId: number, amount: number, reason: string): Promise<Point>;
  getPoints(userId: number): Promise<Point[]>;
  unlockAchievement(userId: number, type: string, name: string, description: string): Promise<Achievement>;
  getAchievements(userId: number): Promise<Achievement[]>;
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
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    console.log('Datenbanksuche gestartet mit:', query);
    try {
      const searchResults = await db
        .select()
        .from(usersTable)
        .where(ilike(usersTable.username, `%${query}%`))
        .limit(10);

      console.log('Datenbanksuche erfolgreich:', searchResults);
      return searchResults;
    } catch (error) {
      console.error('Datenbankfehler bei der Suche:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(usersTable)
      .values({
        ...insertUser,
        balance: 0,
        isCashier: insertUser.isCashier || false
      })
      .returning();
    return user;
  }

  async updateBalance(userId: number, newBalance: number): Promise<User> {
    const [user] = await db
      .update(usersTable)
      .set({ balance: newBalance })
      .where(eq(usersTable.id, userId))
      .returning();

    if (!user) throw new Error("User not found");
    return user;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.timestamp);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async addPoints(userId: number, amount: number, reason: string): Promise<Point> {
    // First update the user's total points
    await db
      .update(usersTable)
      .set({ points: db.raw('points + ?', [amount]) })
      .where(eq(usersTable.id, userId));

    // Then create a points record
    const [point] = await db
      .insert(points)
      .values({
        userId,
        amount,
        reason,
      })
      .returning();

    return point;
  }

  async getPoints(userId: number): Promise<Point[]> {
    return await db
      .select()
      .from(points)
      .where(eq(points.userId, userId))
      .orderBy(points.timestamp);
  }

  async unlockAchievement(userId: number, type: string, name: string, description: string): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values({
        userId,
        type,
        name,
        description,
      })
      .returning();

    return achievement;
  }

  async getAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(achievements.unlockedAt);
  }
}

export const storage = new DatabaseStorage();