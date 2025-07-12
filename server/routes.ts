import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertLeadSchema, 
  insertFavoriteSchema, 
  searchPropertiesSchema 
} from "@shared/schema";
import { PropertyDataScraper } from "./data-scraper";

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

  app.get("/api/properties/:id/nearby", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (!property.district) {
        return res.status(400).json({ message: "Property district not available" });
      }
      
      const sameDistrictProperties = await storage.getPropertiesByDistrict(property.district, id);
      
      res.json(sameDistrictProperties);
    } catch (error) {
      console.error("Error fetching same district properties:", error);
      res.status(500).json({ message: "Failed to fetch same district properties" });
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

  // Data Import routes (Admin functionality)
  app.post("/api/admin/import/upperhouse", async (req, res) => {
    try {
      console.log('Starting UpperHouse data import...');
      const { manualData } = req.body;
      const result = await PropertyDataScraper.importUpperHouseData(manualData);
      
      console.log('Import result:', result);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          imported: result.imported
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          errors: result.errors
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ 
        success: false,
        message: "Server error during import",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/admin/import/amberhouse", async (req, res) => {
    try {
      console.log('Starting AmberHouse data import...');
      const { manualData } = req.body;
      const result = await PropertyDataScraper.importAmberHouseData(manualData);
      
      if (result.success) {
        res.json({
          success: true,
          message: `Successfully imported ${result.imported} AmberHouse property variants`,
          imported: result.imported,
          missingFields: result.missingFields,
          recommendations: result.recommendations
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to import AmberHouse data",
          errors: result.errors,
          missingFields: result.missingFields,
          recommendations: result.recommendations
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ 
        success: false,
        message: "Server error during import",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Data validation endpoints
  app.get("/api/admin/validate/upperhouse", async (req, res) => {
    try {
      const scrapedData = PropertyDataScraper.extractUpperHouseData();
      const validation = PropertyDataScraper.validateData(scrapedData);
      
      res.json({
        title: scrapedData.title,
        projectName: scrapedData.projectName,
        developer: scrapedData.developerName,
        unitVariants: 1, // Single consolidated property entry
        validation: {
          isValid: validation.isValid,
          missingFields: validation.missingFields,
          recommendations: validation.recommendations
        },
        previewData: {
          address: scrapedData.address,
          district: scrapedData.district,
          tenure: scrapedData.tenure,
          totalUnits: scrapedData.noOfUnits,
          priceRange: `$${(scrapedData.priceFrom / 1000000).toFixed(2)}M - $${(Math.max(...scrapedData.unitMix.map(u => u.priceFrom)) / 1000000).toFixed(2)}M`,
          psfRange: `$${Math.min(...scrapedData.unitMix.map(u => u.psf))} - $${Math.max(...scrapedData.unitMix.map(u => u.psf))} PSF`,
          completionDate: scrapedData.completionDate
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to validate data",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/admin/validate/amberhouse", async (req, res) => {
    try {
      const scrapedData = PropertyDataScraper.extractAmberHouseData();
      const validation = PropertyDataScraper.validateData(scrapedData);
      
      res.json({
        title: scrapedData.title,
        projectName: scrapedData.projectName,
        developer: scrapedData.developerName,
        unitVariants: 1, // Single consolidated property entry
        validation: {
          isValid: validation.isValid,
          missingFields: validation.missingFields,
          recommendations: validation.recommendations
        },
        previewData: {
          address: scrapedData.address,
          district: scrapedData.district,
          tenure: scrapedData.tenure,
          totalUnits: scrapedData.noOfUnits,
          priceRange: `$${(scrapedData.priceFrom / 1000000).toFixed(2)}M - $${(Math.max(...scrapedData.unitMix.map(u => u.priceFrom)) / 1000000).toFixed(2)}M`,
          psfRange: `$${Math.min(...scrapedData.unitMix.map(u => u.psf))} - $${Math.max(...scrapedData.unitMix.map(u => u.psf))} PSF`,
          completionDate: scrapedData.completionDate
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to validate data",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // URL scraping endpoint
  app.post("/api/admin/scrape-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Invalid URL provided"
        });
      }

      // Use web_fetch to get the content
      const scrapedData = await PropertyDataScraper.scrapeFromUrl(url);
      
      res.json({
        success: true,
        data: scrapedData,
        message: "URL scraped successfully"
      });
    } catch (error) {
      console.error('URL scraping error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to scrape URL",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Full scraped data endpoints
  app.get("/api/admin/scraped-data/upperhouse", async (req, res) => {
    try {
      const scrapedData = PropertyDataScraper.extractUpperHouseData();
      res.json(scrapedData);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch scraped data",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/admin/scraped-data/amberhouse", async (req, res) => {
    try {
      const scrapedData = PropertyDataScraper.extractAmberHouseData();
      res.json(scrapedData);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch scraped data",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
