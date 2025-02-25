import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    console.log('Checking auth:', req.isAuthenticated());
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };

  const requireCashier = (req: any, res: any, next: any) => {
    console.log('Checking cashier permissions:', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user?.username,
      isCashier: req.user?.isCashier
    });

    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    if (!req.user?.isCashier) {
      return res.sendStatus(403);
    }

    next();
  };

  // User search route (for cashiers only)
  app.get("/api/users/search", requireCashier, async (req, res) => {
    try {
      const searchTerm = req.query.search as string;
      console.log('Processing search request:', searchTerm);

      if (!searchTerm || searchTerm.length < 2) {
        return res.json([]);
      }

      const users = await storage.searchUsers(searchTerm);
      console.log('Search results:', users);
      res.json(users);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Fehler bei der Benutzersuche' });
    }
  });

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

  // Balance management route
  app.post("/api/balance", requireCashier, async (req, res) => {
    const { userId, amount, type, description } = req.body;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Benutzer nicht gefunden" });
      }

      const newBalance = type === "deposit"
        ? user.balance + amount
        : user.balance - amount;

      if (newBalance < 0) {
        return res.status(400).json({ error: "Nicht genügend Guthaben" });
      }

      await storage.createTransaction({ userId, amount, type, description });

      if (type === "deposit") {
        const pointsToAward = Math.floor(amount / 200);
        if (pointsToAward > 0) {
          await storage.addPoints(userId, pointsToAward, `Punkte für ${amount / 100}€ Einzahlung`);
        }

        const totalPoints = user.points + pointsToAward;
        if (totalPoints >= 100 && !(await storage.hasAchievement(userId, "points_100"))) {
          await storage.unlockAchievement(userId, "points_100", "Punktesammler", "Sammle 100 Punkte");
        }
      }

      const updatedUser = await storage.updateBalance(userId, newBalance);
      res.json(updatedUser);
    } catch (error) {
      console.error('Balance update error:', error);
      res.status(500).json({ error: 'Fehler bei der Guthabenaktualisierung' });
    }
  });

  // Neue Route für QR-Code-ID Lookup hinzufügen
  app.get("/api/users/qr/:qrCodeId", requireCashier, async (req, res) => {
    try {
      const user = await storage.getUserByQRCodeId(req.params.qrCodeId);
      if (!user) {
        return res.status(404).json({ error: "Benutzer nicht gefunden" });
      }
      res.json(user);
    } catch (error) {
      console.error('QR code lookup error:', error);
      res.status(500).json({ error: 'Fehler bei der Benutzersuche' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}