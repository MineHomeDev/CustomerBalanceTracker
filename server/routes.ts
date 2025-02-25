import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { eq, ilike } from "drizzle-orm";
import { users } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };

  const requireCashier = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      console.log('Fehler: Benutzer nicht authentifiziert');
      return res.sendStatus(401);
    }

    if (!req.user || !req.user.isCashier) {
      console.log('Fehler: Benutzer ist kein Kassierer', req.user);
      return res.sendStatus(403);
    }

    console.log('Kassierer-Zugriff gewährt für:', req.user.username);
    next();
  };

  // Get user transactions
  app.get("/api/transactions", requireAuth, async (req, res) => {
    const transactions = await storage.getTransactions(req.user!.id);
    res.json(transactions);
  });

  // Get user points
  app.get("/api/points", requireAuth, async (req, res) => {
    const points = await storage.getPoints(req.user!.id);
    res.json(points);
  });

  // Get user achievements
  app.get("/api/achievements", requireAuth, async (req, res) => {
    const achievements = await storage.getAchievements(req.user!.id);
    res.json(achievements);
  });

  // Search users (for cashiers only)
  app.get("/api/users/search", requireCashier, async (req, res) => {
    try {
      const search = req.query.search as string;
      console.log('Benutzersuche gestartet:', search);

      if (!search || search.length < 2) {
        console.log('Suchbegriff zu kurz');
        return res.json([]);
      }

      const users = await storage.searchUsers(search);
      console.log('Gefundene Benutzer:', users);
      res.json(users);
    } catch (error) {
      console.error('Fehler bei der Benutzersuche:', error);
      res.status(500).json({ error: 'Fehler bei der Benutzersuche' });
    }
  });

  // Cashier routes for managing balances
  app.post("/api/balance", requireCashier, async (req, res) => {
    const { userId, amount, type, description } = req.body;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const newBalance = type === "deposit"
      ? user.balance + amount
      : user.balance - amount;

    if (newBalance < 0) {
      return res.status(400).send("Nicht genügend Guthaben");
    }

    await storage.createTransaction({
      userId,
      amount,
      type,
      description
    });

    if (type === "deposit") {
      const pointsToAward = Math.floor(amount / 200);
      if (pointsToAward > 0) {
        await storage.addPoints(
          userId,
          pointsToAward,
          `Points for ${amount / 100}€ deposit`
        );
      }

      const totalPoints = user.points + pointsToAward;
      if (totalPoints >= 100 && !(await hasAchievement(userId, "points_100"))) {
        await storage.unlockAchievement(
          userId,
          "points_100",
          "Punktesammler",
          "Sammle 100 Punkte"
        );
      }
    }

    const updatedUser = await storage.updateBalance(userId, newBalance);
    res.json(updatedUser);
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function hasAchievement(userId: number, type: string): Promise<boolean> {
  const achievements = await storage.getAchievements(userId);
  return achievements.some(a => a.type === type);
}