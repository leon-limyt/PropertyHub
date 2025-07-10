import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
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
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  sqft: integer("sqft").notNull(),
  status: text("status").notNull().default("available"), // available, sold, preview
  launchType: text("launch_type").notNull(), // new-launch, resale, top-soon, preview
  imageUrl: text("image_url").notNull(),
  agentName: text("agent_name").notNull(),
  agentPhone: text("agent_phone").notNull(),
  agentEmail: text("agent_email").notNull(),
  expectedRoi: decimal("expected_roi", { precision: 4, scale: 2 }),
  isFeatured: boolean("is_featured").default(false),
  isOverseas: boolean("is_overseas").default(false),
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
  bathrooms: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minSqft: z.number().optional(),
  maxSqft: z.number().optional(),
  isOverseas: z.boolean().optional(),
  launchType: z.string().optional(),
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
