import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(0),
  isCashier: boolean("is_cashier").notNull().default(false),
  points: integer("points").notNull().default(0)
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "deposit" or "withdrawal"
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow()
});

export const points = pgTable("points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow()
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isCashier: true
});

export const transactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  description: true
});

export const pointSchema = createInsertSchema(points).pick({
  userId: true,
  amount: true,
  reason: true
});

export const achievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  type: true,
  name: true,
  description: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof transactionSchema>;
export type Point = typeof points.$inferSelect;
export type InsertPoint = z.infer<typeof pointSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof achievementSchema>;