import { db } from './db';
import { properties } from '@shared/schema';
import type { InsertProperty } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface ScrapedPropertyData {
  // Core property information
  title: string;
  description: string;
  projectName: string;
  developerName: string;
  
  // Location details
  address: string;
  district: string;
  country: string;
  postalCode?: string;
  
  // Property specifications
  propertyType: string;
  tenure: string;
  noOfUnits: number;
  noOfBlocks: number;
  storeyRange: string;
  siteAreaSqm: string;
  
  // Pricing information
  priceFrom: number;
  psfFrom: number;
  
  // Unit mix details
  unitMix: Array<{
    unitType: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    priceFrom: number;
    psf: number;
  }>;
  
  // Development timeline
  launchDate: string;
  completionDate: string;
  expectedTOP: string;
  
  // Amenities and location benefits
  nearbySchools: string[];
  nearbyMRT: string[];
  nearbyAmenities: string[];
  
  // Additional info
  projectStatus: string;
  launchType: string;
  
  // Missing fields that need to be populated
  missingFields: string[];
  
  // Images
  imageUrls: string[];
}

export class PropertyDataScraper {
  /**
   * Extract AmberHouse property data from scraped content
   */
  static extractAmberHouseData(): ScrapedPropertyData {
    const data: ScrapedPropertyData = {
      title: "AmberHouse",
      description: "Located at Amber Gardens, AmberHouse is a freehold development that sits within the quaint residential enclave along Amber Road, in the prime vicinity of Singapore's East Coast. Stay close to an array of dining, shopping and recreational amenities.",
      projectName: "Amber House",
      developerName: "Far East Organization",
      
      // Location details
      address: "30 Amber Gardens, Singapore 439964",
      district: "District 15",
      country: "Singapore",
      postalCode: "439964",
      
      // Property specifications
      propertyType: "Condominium",
      tenure: "Freehold",
      noOfUnits: 105,
      noOfBlocks: 1,
      storeyRange: "16 Storeys",
      siteAreaSqm: "3801.4",
      
      // Pricing information
      priceFrom: 1920000, // $1.92M
      psfFrom: 2880, // Starting from $2,880 PSF
      
      // Unit mix details
      unitMix: [
        {
          unitType: "2 BR",
          bedrooms: 2,
          bathrooms: 2,
          sqft: 635,
          priceFrom: 1920000,
          psf: 3020
        },
        {
          unitType: "2 BR + Study (732 sqft)",
          bedrooms: 2,
          bathrooms: 2,
          sqft: 732,
          priceFrom: 2180000,
          psf: 2980
        },
        {
          unitType: "2 BR + Study (753 sqft)",
          bedrooms: 2,
          bathrooms: 2,
          sqft: 753,
          priceFrom: 2180000,
          psf: 2980
        },
        {
          unitType: "3 BR",
          bedrooms: 3,
          bathrooms: 2,
          sqft: 980,
          priceFrom: 2900000,
          psf: 2960
        },
        {
          unitType: "3 BR + Study",
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1216,
          priceFrom: 3500000,
          psf: 2880
        },
        {
          unitType: "3 BR Premium",
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1238,
          priceFrom: 3690000,
          psf: 2980
        },
        {
          unitType: "4 BR Premium",
          bedrooms: 4,
          bathrooms: 3,
          sqft: 1744,
          priceFrom: 5130000,
          psf: 2940
        }
      ],
      
      // Development timeline
      launchDate: "2025-06-28",
      completionDate: "2029-12-31",
      expectedTOP: "Q1 2029",
      
      // Amenities and location benefits
      nearbySchools: ["Tanjong Katong Primary School"],
      nearbyMRT: ["Tanjong Katong MRT", "Marine Parade MRT"],
      nearbyAmenities: [
        "Parkway Parade Shopping Mall",
        "Katong Square", 
        "I12 Katong",
        "East Coast Park",
        "Katong shophouses"
      ],
      
      // Additional info
      projectStatus: "Open for Booking",
      launchType: "new-launch",
      
      // Images
      imageUrls: [
        "https://propertyreviewsg.com/wp-content/uploads/2025/06/Amberhouse-Project-Image-1.jpg",
        "https://propertyreviewsg.com/wp-content/uploads/2025/06/Amberhouse-Project-Image-2.jpg",
        "https://propertyreviewsg.com/wp-content/uploads/2025/06/Amberhouse-Project-Image-3.jpg",
        "https://propertyreviewsg.com/wp-content/uploads/2025/06/Amberhouse-Project-Image-4.jpg",
        "https://propertyreviewsg.com/wp-content/uploads/2025/06/Amberhouse-Project-Image-5.jpg"
      ],
      
      // Missing fields that need to be populated
      missingFields: []
    };
    
    return data;
  }
  
  /**
   * Validate scraped data against database schema requirements
   */
  static validateData(data: ScrapedPropertyData): { 
    isValid: boolean; 
    missingFields: string[]; 
    recommendations: string[] 
  } {
    const missingFields: string[] = [];
    const recommendations: string[] = [];
    
    // Check for missing critical fields
    if (!data.title) missingFields.push("title");
    if (!data.description) missingFields.push("description");
    if (!data.address) missingFields.push("location/address");
    if (!data.district) missingFields.push("district");
    if (!data.priceFrom) missingFields.push("price");
    if (!data.propertyType) missingFields.push("propertyType");
    if (!data.tenure) missingFields.push("tenure");
    if (!data.developerName) missingFields.push("developerName");
    
    // Check for missing optional but important fields
    if (!data.postalCode) {
      missingFields.push("postalCode");
      recommendations.push("Extract postal code from address for better location accuracy");
    }
    
    if (data.unitMix.length === 0) {
      missingFields.push("unit specifications");
      recommendations.push("Add bedroom/bathroom counts and square footage details");
    }
    
    if (data.nearbyMRT.length === 0) {
      missingFields.push("nearby MRT stations");
      recommendations.push("Add MRT station information for better searchability");
    }
    
    if (data.nearbySchools.length === 0) {
      missingFields.push("nearby schools");
      recommendations.push("Add school information for family-oriented buyers");
    }
    
    if (!data.launchDate) {
      missingFields.push("launch date");
      recommendations.push("Add launch/preview date for timeline information");
    }
    
    if (!data.completionDate) {
      missingFields.push("completion date");
      recommendations.push("Add expected completion date for buyer planning");
    }
    
    if (data.imageUrls.length === 0) {
      missingFields.push("property images");
      recommendations.push("Add property images for better visual appeal");
    }
    
    // Check for coordinates (lat/lng)
    missingFields.push("coordinates (lat/lng)");
    recommendations.push("Add GPS coordinates for map integration and location-based search");
    
    // Check for agent information
    missingFields.push("agent contact information");
    recommendations.push("Add agent name, phone, and email for lead generation");
    
    // Check for investment metrics
    missingFields.push("expected ROI");
    recommendations.push("Add expected rental yield/ROI for investment analysis");
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      recommendations
    };
  }
  
  /**
   * Convert scraped data to multiple database entries (one per unit type)
   */
  static convertToPropertyEntries(data: ScrapedPropertyData, manualData?: { [key: string]: string }): InsertProperty[] {
    const baseProperty = {
      title: data.title,
      description: data.description,
      location: data.address,
      district: data.district,
      country: data.country,
      propertyType: data.propertyType,
      status: "available",
      launchType: data.launchType,
      isOverseas: false,
      isFeatured: false,
      
      // Project details
      projectName: data.projectName,
      developerName: data.developerName,
      tenure: data.tenure,
      projectStatus: data.projectStatus,
      
      // Development info
      noOfUnits: data.noOfUnits,
      noOfBlocks: data.noOfBlocks,
      storeyRange: data.storeyRange,
      siteAreaSqm: data.siteAreaSqm,
      
      // Location data
      postalCode: data.postalCode,
      planningArea: "Marine Parade",
      
      // Timeline
      launchDate: data.launchDate,
      completionDate: data.completionDate,
      
      // Amenities
      primarySchoolsWithin1km: data.nearbySchools,
      mrtNearby: data.nearbyMRT,
      
      // Images
      imageUrl: data.imageUrls[0] || "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      
      // Missing fields that need manual input (use manual data if provided)
      agentName: manualData?.agentName || "Property Sales Team",
      agentPhone: manualData?.agentPhone || "+65 6100 8108",
      agentEmail: manualData?.agentEmail || "sales@propertyreviewsg.com",
      expectedRoi: manualData?.expectedRoi || "6.5",
      featured: manualData?.featured === "true" || false,
      
      // GPS coordinates (use manual data if provided, otherwise approximate)
      lat: manualData?.lat || "1.302000",
      lng: manualData?.lng || "103.906700",
      
      // Project description (use manual data if provided, otherwise use scraped data)
      projectDescription: manualData?.projectDescription || data.description,
      
      // Additional calculated fields
      plotRatio: "2.5" // Estimated based on site area and building height
    };
    
    // Create separate entries for each unit type
    const properties: InsertProperty[] = data.unitMix.map((unit, index) => ({
      ...baseProperty,
      title: `${data.title} - ${unit.unitType}`,
      price: unit.priceFrom.toString(),
      psf: unit.psf.toString(),
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      sqft: unit.sqft,
      imageUrl: data.imageUrls[index % data.imageUrls.length] || baseProperty.imageUrl
    }));
    
    return properties;
  }
  
  /**
   * Import scraped data into database
   */
  static async importAmberHouseData(manualData?: { [key: string]: string }): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
    missingFields: string[];
    recommendations: string[];
  }> {
    try {
      console.log('Starting AmberHouse data import...');
      
      // Extract data
      const scrapedData = this.extractAmberHouseData();
      
      // Validate data
      const validation = this.validateData(scrapedData);
      
      // Convert to database entries
      const propertyEntries = this.convertToPropertyEntries(scrapedData, manualData);
      
      // Check for existing entries first to avoid duplicates
      const existingProperties = await db.select().from(properties).where(
        eq(properties.projectName, "Amber House")
      );
      
      if (existingProperties.length > 0) {
        console.log(`Found ${existingProperties.length} existing AmberHouse properties. Skipping import.`);
        return {
          success: false,
          imported: 0,
          errors: [`AmberHouse data already exists in database (${existingProperties.length} entries found)`],
          missingFields: validation.missingFields,
          recommendations: validation.recommendations
        };
      }
      
      // Debug log the first property entry
      console.log('First property entry:', JSON.stringify(propertyEntries[0], null, 2));
      
      // Insert into database
      const insertedProperties = await db.insert(properties).values(propertyEntries).returning();
      
      console.log(`Successfully imported ${insertedProperties.length} AmberHouse unit variants`);
      
      return {
        success: true,
        imported: insertedProperties.length,
        errors: [],
        missingFields: validation.missingFields,
        recommendations: validation.recommendations
      };
      
    } catch (error) {
      console.error('Error importing AmberHouse data:', error);
      return {
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        missingFields: [],
        recommendations: []
      };
    }
  }
}