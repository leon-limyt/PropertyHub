import { 
  properties, 
  leads, 
  favorites, 
  marketAnalytics,
  type Property, 
  type InsertProperty, 
  type Lead, 
  type InsertLead, 
  type Favorite, 
  type InsertFavorite, 
  type MarketAnalytics, 
  type InsertMarketAnalytics,
  type SearchPropertiesParams 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";

export interface IStorage {
  // Properties
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  searchProperties(params: SearchPropertiesParams): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  getOverseasProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  
  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, propertyId: number): Promise<boolean>;
  
  // Market Analytics
  getMarketAnalytics(): Promise<MarketAnalytics[]>;
  getMarketAnalyticsByDistrict(district: string): Promise<MarketAnalytics | undefined>;
  createMarketAnalytics(analytics: InsertMarketAnalytics): Promise<MarketAnalytics>;
}



export class DatabaseStorage implements IStorage {
  // Properties
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async searchProperties(params: SearchPropertiesParams): Promise<Property[]> {
    console.log('Search params:', params);
    
    let query = db.select().from(properties);
    const conditions = [];

    if (params.location) {
      conditions.push(
        or(
          ilike(properties.location, `%${params.location}%`),
          eq(properties.district, params.location), // Exact match for district
          ilike(properties.country, `%${params.location}%`),
          eq(properties.country, params.location)
        )
      );
    }

    if (params.propertyType) {
      conditions.push(eq(properties.propertyType, params.propertyType));
    }

    if (params.bedrooms) {
      conditions.push(eq(properties.bedrooms, params.bedrooms));
    }

    if (params.bathrooms) {
      conditions.push(eq(properties.bathrooms, params.bathrooms));
    }

    if (params.minPrice) {
      conditions.push(gte(properties.price, params.minPrice.toString()));
    }

    if (params.maxPrice) {
      conditions.push(lte(properties.price, params.maxPrice.toString()));
    }

    if (params.minSqft) {
      conditions.push(gte(properties.sqft, params.minSqft));
    }

    if (params.maxSqft) {
      conditions.push(lte(properties.sqft, params.maxSqft));
    }

    if (params.isOverseas !== undefined) {
      conditions.push(eq(properties.isOverseas, params.isOverseas));
    }

    if (params.launchType) {
      conditions.push(eq(properties.launchType, params.launchType));
    }

    if (params.developerName) {
      conditions.push(ilike(properties.developerName, `%${params.developerName}%`));
    }

    if (params.projectType) {
      conditions.push(eq(properties.projectType, params.projectType));
    }

    if (params.tenure) {
      conditions.push(eq(properties.tenure, params.tenure));
    }

    if (params.planningArea) {
      conditions.push(ilike(properties.planningArea, `%${params.planningArea}%`));
    }

    if (params.district) {
      conditions.push(ilike(properties.district, `%${params.district}%`));
    }

    if (params.projectStatus) {
      conditions.push(eq(properties.projectStatus, params.projectStatus));
    }

    if (params.featured !== undefined) {
      conditions.push(eq(properties.featured, params.featured));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;
    console.log('Search results:', results.length);
    
    return results;
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.isFeatured, true));
  }

  async getOverseasProperties(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.isOverseas, true));
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties).values(insertProperty).returning();
    return property;
  }

  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();
    return property || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  // Favorites
  async getFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }

  async removeFavorite(userId: string, propertyId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));
    return result.rowCount > 0;
  }

  // Market Analytics
  async getMarketAnalytics(): Promise<MarketAnalytics[]> {
    return await db.select().from(marketAnalytics);
  }

  async getMarketAnalyticsByDistrict(district: string): Promise<MarketAnalytics | undefined> {
    const [analytics] = await db
      .select()
      .from(marketAnalytics)
      .where(eq(marketAnalytics.district, district));
    return analytics || undefined;
  }

  async createMarketAnalytics(insertAnalytics: InsertMarketAnalytics): Promise<MarketAnalytics> {
    const [analytics] = await db
      .insert(marketAnalytics)
      .values(insertAnalytics)
      .returning();
    return analytics;
  }
}

export const storage = new DatabaseStorage();
