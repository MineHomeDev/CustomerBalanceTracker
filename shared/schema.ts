import { pgTable, text, serial, integer, boolean, timestamp, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(0),
  isCashier: boolean("is_cashier").notNull().default(false),
  points: integer("points").notNull().default(0),
  depositQrCodeId: text("deposit_qr_code_id").notNull(),
  withdrawQrCodeId: text("withdraw_qr_code_id").notNull()
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
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

export const insertUserSchema = createInsertSchema(users)
  .pick({
    email: true,
    firstName: true,
    lastName: true,
    dateOfBirth: true,
    password: true,
    isCashier: true
  })
  .extend({
    passwordConfirm: z.string(),
    dateOfBirth: z.string().transform((str) => new Date(str))
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof transactionSchema>;
export type Point = typeof points.$inferSelect;
export type InsertPoint = z.infer<typeof pointSchema>;