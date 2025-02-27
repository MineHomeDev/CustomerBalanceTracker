import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { scrypt, randomBytes, randomInt } from "crypto";
import { promisify } from "util";

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

  // Admin-Route zur Erstellung neuer Kassierer (nur für existierende Kassierer)
  app.post("/api/admin/create-cashier", requireCashier, async (req, res) => {
    try {
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).send("E-Mail-Adresse wird bereits verwendet");
      }

      // Verwende die gleiche Funktion wie bei der Registrierung, um einen QR-Code zu generieren
      const scryptAsync = promisify(scrypt);
      
      async function hashPassword(password: string) {
        const salt = randomBytes(16).toString("hex");
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${buf.toString("hex")}.${salt}`;
      }
      
      async function generateUniqueQRCodeId(): Promise<string> {
        while (true) {
          const id = String(randomInt(10000000, 99999999));
          const existingUser = await storage.getUserByQRCodeId(id);
          if (!existingUser) {
            return id;
          }
        }
      }

      const qrCodeId = await generateUniqueQRCodeId();
      
      // Kassierer erstellen (mit isCashier = true)
      const userData = {
        ...req.body,
        isCashier: true,
        password: await hashPassword(req.body.password),
        qrCodeId
      };
      
      const user = await storage.createUser(userData);
      
      // Sende den erstellten Benutzer zurück, ohne das Passwort
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
      
    } catch (error) {
      console.error('Error creating cashier:', error);
      res.status(500).json({ error: 'Fehler bei der Erstellung des Kassierers' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}