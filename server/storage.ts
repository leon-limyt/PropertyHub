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

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private leads: Map<number, Lead>;
  private favorites: Map<number, Favorite>;
  private marketAnalytics: Map<number, MarketAnalytics>;
  private currentPropertyId: number;
  private currentLeadId: number;
  private currentFavoriteId: number;
  private currentAnalyticsId: number;

  constructor() {
    this.properties = new Map();
    this.leads = new Map();
    this.favorites = new Map();
    this.marketAnalytics = new Map();
    this.currentPropertyId = 1;
    this.currentLeadId = 1;
    this.currentFavoriteId = 1;
    this.currentAnalyticsId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample properties
    const sampleProperties: InsertProperty[] = [
      {
        title: "Marina Bay Residences",
        description: "Luxury waterfront living in the heart of Singapore's CBD with stunning marina views and world-class amenities.",
        price: "1200000",
        psf: "1850",
        location: "1 Shenton Way, Singapore 068803",
        district: "District 1",
        country: "Singapore",
        propertyType: "New Launch Condo",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 650,
        status: "available",
        launchType: "new-launch",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        agentName: "Sarah Lim",
        agentPhone: "+65 9123 4567",
        agentEmail: "sarah@propertyhub.sg",
        expectedRoi: null,
        isFeatured: true,
        isOverseas: false,
      },
      {
        title: "Orchard Heights",
        description: "Premium residential development in the prestigious Orchard Road district with shopping and dining at your doorstep.",
        price: "2800000",
        psf: "2200",
        location: "15 Orchard Road, Singapore 238841",
        district: "District 9",
        country: "Singapore",
        propertyType: "New Launch Condo",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1100,
        status: "available",
        launchType: "top-soon",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        agentName: "Michael Tan",
        agentPhone: "+65 9234 5678",
        agentEmail: "michael@propertyhub.sg",
        expectedRoi: null,
        isFeatured: true,
        isOverseas: false,
      },
      {
        title: "Sentosa Cove Luxury",
        description: "Exclusive beachfront living with panoramic ocean views and resort-style amenities on Singapore's premier island.",
        price: "4200000",
        psf: "2800",
        location: "31 Ocean Drive, Singapore 098374",
        district: "Sentosa",
        country: "Singapore",
        propertyType: "New Launch Condo",
        bedrooms: 4,
        bathrooms: 3,
        sqft: 1400,
        status: "available",
        launchType: "preview",
        imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        agentName: "Jennifer Wong",
        agentPhone: "+65 9345 6789",
        agentEmail: "jennifer@propertyhub.sg",
        expectedRoi: null,
        isFeatured: true,
        isOverseas: false,
      },
      {
        title: "The Residences KLCC",
        description: "Iconic twin towers offering luxury living in the heart of Kuala Lumpur with KLCC park views.",
        price: "420000",
        psf: "580",
        location: "Kuala Lumpur City Centre, Malaysia",
        district: "KLCC",
        country: "Malaysia",
        propertyType: "New Launch Condo",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 950,
        status: "available",
        launchType: "new-launch",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        agentName: "David Lee",
        agentPhone: "+60 12 345 6789",
        agentEmail: "david@propertyhub.sg",
        expectedRoi: "7.5",
        isFeatured: false,
        isOverseas: true,
      },
      {
        title: "Ocean View Residences",
        description: "Tropical beachfront paradise with direct ocean access and world-class resort amenities in Phuket.",
        price: "380000",
        psf: "520",
        location: "Patong Beach, Phuket, Thailand",
        district: "Patong",
        country: "Thailand",
        propertyType: "New Launch Condo",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 730,
        status: "available",
        launchType: "new-launch",
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        agentName: "Lisa Chen",
        agentPhone: "+66 8 1234 5678",
        agentEmail: "lisa@propertyhub.sg",
        expectedRoi: "8.2",
        isFeatured: false,
        isOverseas: true,
      },
    ];

    // Initialize market analytics
    const sampleAnalytics: InsertMarketAnalytics[] = [
      {
        district: "District 1",
        averagePrice: "2850000",
        averagePsf: "2850",
        yoyChange: "3.2",
        quarterlyChange: "1.8",
        unitsSold: 145,
      },
      {
        district: "District 9",
        averagePrice: "2200000",
        averagePsf: "2200",
        yoyChange: "2.8",
        quarterlyChange: "1.5",
        unitsSold: 198,
      },
      {
        district: "District 10",
        averagePrice: "2100000",
        averagePsf: "2100",
        yoyChange: "4.1",
        quarterlyChange: "2.3",
        unitsSold: 167,
      },
    ];

    sampleProperties.forEach(property => {
      this.createProperty(property);
    });

    sampleAnalytics.forEach(analytics => {
      this.createMarketAnalytics(analytics);
    });
  }

  // Properties
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async searchProperties(params: SearchPropertiesParams): Promise<Property[]> {
    const properties = Array.from(this.properties.values());
    
    console.log('Search params:', params);
    console.log('Total properties:', properties.length);
    
    const results = properties.filter(property => {
      // Location search - check district, location, and country
      if (params.location) {
        const locationMatch = 
          property.location.toLowerCase().includes(params.location.toLowerCase()) ||
          property.district.toLowerCase().includes(params.location.toLowerCase()) ||
          property.country.toLowerCase().includes(params.location.toLowerCase()) ||
          property.district === params.location ||
          property.country === params.location;
        
        if (!locationMatch) {
          return false;
        }
      }
      
      if (params.propertyType && property.propertyType !== params.propertyType) {
        return false;
      }
      if (params.bedrooms && property.bedrooms !== params.bedrooms) {
        return false;
      }
      if (params.bathrooms && property.bathrooms !== params.bathrooms) {
        return false;
      }
      if (params.minPrice && parseFloat(property.price) < params.minPrice) {
        return false;
      }
      if (params.maxPrice && parseFloat(property.price) > params.maxPrice) {
        return false;
      }
      if (params.minSqft && property.sqft < params.minSqft) {
        return false;
      }
      if (params.maxSqft && property.sqft > params.maxSqft) {
        return false;
      }
      if (params.isOverseas !== undefined && property.isOverseas !== params.isOverseas) {
        return false;
      }
      if (params.launchType && property.launchType !== params.launchType) {
        return false;
      }
      return true;
    });
    
    console.log('Search results:', results.length);
    console.log('First few results:', results.slice(0, 2).map(p => ({ title: p.title, district: p.district, country: p.country })));
    
    return results;
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.isFeatured);
  }

  async getOverseasProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.isOverseas);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;

    const updatedProperty = {
      ...property,
      ...updateData,
      updatedAt: new Date(),
    };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = {
      ...insertLead,
      id,
      createdAt: new Date(),
    };
    this.leads.set(id, lead);
    return lead;
  }

  // Favorites
  async getFavorites(userId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(f => f.userId === userId);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: string, propertyId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      f => f.userId === userId && f.propertyId === propertyId
    );
    if (!favorite) return false;
    return this.favorites.delete(favorite.id);
  }

  // Market Analytics
  async getMarketAnalytics(): Promise<MarketAnalytics[]> {
    return Array.from(this.marketAnalytics.values());
  }

  async getMarketAnalyticsByDistrict(district: string): Promise<MarketAnalytics | undefined> {
    return Array.from(this.marketAnalytics.values()).find(a => a.district === district);
  }

  async createMarketAnalytics(insertAnalytics: InsertMarketAnalytics): Promise<MarketAnalytics> {
    const id = this.currentAnalyticsId++;
    const analytics: MarketAnalytics = {
      ...insertAnalytics,
      id,
      createdAt: new Date(),
    };
    this.marketAnalytics.set(id, analytics);
    return analytics;
  }
}

export const storage = new MemStorage();
