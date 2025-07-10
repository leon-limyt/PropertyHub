import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertLeadSchema, 
  insertFavoriteSchema, 
  searchPropertiesSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Configuration route
  app.get("/api/config", async (req, res) => {
    try {
      res.json({
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch config" });
    }
  });

  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/featured", async (req, res) => {
    try {
      const properties = await storage.getFeaturedProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });

  app.get("/api/properties/overseas", async (req, res) => {
    try {
      const properties = await storage.getOverseasProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overseas properties" });
    }
  });

  app.post("/api/properties/search", async (req, res) => {
    try {
      const searchParams = searchPropertiesSchema.parse(req.body);
      const properties = await storage.searchProperties(searchParams);
      res.json(properties);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Leads routes
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid lead data" });
    }
  });

  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data" });
    }
  });

  app.delete("/api/favorites/:userId/:propertyId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const propertyId = parseInt(req.params.propertyId);
      const success = await storage.removeFavorite(userId, propertyId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Market Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getMarketAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/:district", async (req, res) => {
    try {
      const district = req.params.district;
      const analytics = await storage.getMarketAnalyticsByDistrict(district);
      if (!analytics) {
        return res.status(404).json({ message: "Analytics not found for district" });
      }
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
