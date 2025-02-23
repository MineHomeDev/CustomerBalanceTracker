import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };

  const requireCashier = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user.isCashier) {
      return res.sendStatus(403);
    }
    next();
  };

  // Get user transactions
  app.get("/api/transactions", requireAuth, async (req, res) => {
    const transactions = await storage.getTransactions(req.user!.id);
    res.json(transactions);
  });

  // Cashier routes for managing balances
  app.post("/api/balance", requireCashier, async (req, res) => {
    const { userId, amount, type, description } = req.body;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    const newBalance = type === "deposit" 
      ? user.balance + amount 
      : user.balance - amount;

    if (newBalance < 0) {
      return res.status(400).send("Insufficient balance");
    }

    await storage.createTransaction({
      userId,
      amount,
      type,
      description
    });

    const updatedUser = await storage.updateBalance(userId, newBalance);
    res.json(updatedUser);
  });

  const httpServer = createServer(app);
  return httpServer;
}
