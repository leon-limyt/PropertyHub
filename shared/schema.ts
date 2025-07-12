import { pgTable, text, serial, integer, boolean, decimal, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  psf: decimal("psf", { precision: 8, scale: 2 }).notNull(),
  location: text("location").notNull(),
  district: text("district").notNull(),
  country: text("country").notNull().default("Singapore"),
  propertyType: text("property_type").notNull(),
  bedroomType: text("bedroom_type").notNull(),
  sqft: integer("sqft").notNull(),
  sqftRange: text("sqft_range"), // For displaying unit size ranges like "635-1744 sq ft"
  status: text("status").notNull().default("available"), // available, sold, preview
  launchType: text("launch_type").notNull(), // new-launch, resale, top-soon, preview
  imageUrl: text("image_url").notNull(),
  agentName: text("agent_name").notNull(),
  agentPhone: text("agent_phone").notNull(),
  agentEmail: text("agent_email").notNull(),
  expectedRoi: decimal("expected_roi", { precision: 4, scale: 2 }),
  isFeatured: boolean("is_featured").default(false),
  isOverseas: boolean("is_overseas").default(false),
  
  // New enhanced fields
  projectId: text("project_id").unique(),
  projectName: text("project_name"),
  developerName: text("developer_name"),
  projectType: text("project_type"), // Condo, EC, Landed
  tenure: text("tenure"), // Freehold, 99-year, 999-year
  planningArea: text("planning_area"),
  address: text("address"),
  postalCode: text("postal_code"),
  launchDate: date("launch_date"),
  completionDate: date("completion_date"),
  noOfUnits: integer("no_of_units"),
  noOfBlocks: integer("no_of_blocks"),
  storeyRange: text("storey_range"),
  siteAreaSqm: decimal("site_area_sqm", { precision: 10, scale: 2 }),
  plotRatio: decimal("plot_ratio", { precision: 4, scale: 2 }),
  primarySchoolsWithin1km: text("primary_schools_within_1km").array(),
  mrtNearby: text("mrt_nearby").array(),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lng: decimal("lng", { precision: 11, scale: 8 }),
  projectDescription: text("project_description"),
  developerSalesTeamContact: jsonb("developer_sales_team_contact"),
  featured: boolean("featured").default(false),
  projectStatus: text("project_status"), // Coming Soon, Preview, Open for Booking, Fully Sold
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  budgetRange: text("budget_range").notNull(),
  preferences: text("preferences"),
  propertyId: integer("property_id").references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // For simplicity, using string user ID
  propertyId: integer("property_id").notNull().references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketAnalytics = pgTable("market_analytics", {
  id: serial("id").primaryKey(),
  district: text("district").notNull(),
  averagePrice: decimal("average_price", { precision: 12, scale: 2 }).notNull(),
  averagePsf: decimal("average_psf", { precision: 8, scale: 2 }).notNull(),
  yoyChange: decimal("yoy_change", { precision: 5, scale: 2 }).notNull(),
  quarterlyChange: decimal("quarterly_change", { precision: 5, scale: 2 }).notNull(),
  unitsSold: integer("units_sold").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertMarketAnalyticsSchema = createInsertSchema(marketAnalytics).omit({
  id: true,
  createdAt: true,
});

export const searchPropertiesSchema = z.object({
  location: z.string().optional(),
  propertyType: z.string().optional(),
  bedrooms: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minSqft: z.number().optional(),
  maxSqft: z.number().optional(),
  isOverseas: z.boolean().optional(),
  launchType: z.string().optional(),
  // New search fields
  developerName: z.string().optional(),
  projectType: z.string().optional(),
  tenure: z.string().optional(),
  planningArea: z.string().optional(),
  district: z.string().optional(),
  projectStatus: z.string().optional(),
  featured: z.boolean().optional(),
  // Filter panel fields
  topYear: z.number().optional(),
  mrtDistance: z.string().optional(),
  schoolDistance: z.string().optional(),
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertMarketAnalytics = z.infer<typeof insertMarketAnalyticsSchema>;
export type MarketAnalytics = typeof marketAnalytics.$inferSelect;
export type SearchPropertiesParams = z.infer<typeof searchPropertiesSchema>;
