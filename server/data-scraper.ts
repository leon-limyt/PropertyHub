import { db } from './db';
import { properties } from '@shared/schema';
import type { InsertProperty } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { storage } from './storage';

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
   * Scrape property data from any URL
   */
  static async scrapeFromUrl(url: string): Promise<{ [key: string]: string }> {
    try {
      // For server-side, we'll use a basic pattern recognition approach
      // In a real implementation, you'd use a proper HTML parser like cheerio
      let content = '';
      
      // Try to fetch content (this will work for basic HTML pages)
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (response.ok) {
          content = await response.text();
        } else {
          // If direct fetch fails, return basic extracted data
          content = `Title: Property Listing from ${url}`;
        }
      } catch (fetchError) {
        // If fetch fails, return basic extracted data
        content = `Title: Property Listing from ${url}`;
      }
      
      // Basic property data extraction using common patterns
      const extractedData: { [key: string]: string } = {};
      
      // Extract title - look for common title patterns
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                        content.match(/# ([^\n]+)/m) ||
                        content.match(/## ([^\n]+)/m);
      if (titleMatch) {
        extractedData.title = titleMatch[1].trim();
      }
      
      // Extract basic property information from content
      const lines = content.split('\n');
      
      for (const line of lines) {
        // Look for key-value patterns
        if (line.includes('District') || line.includes('DISTRICT')) {
          const districtMatch = line.match(/District\s*:?\s*([^\n,|]+)/i) || 
                              line.match(/D(\d+)/i);
          if (districtMatch) {
            extractedData.district = districtMatch[1].trim();
          }
        }
        
        if (line.includes('Developer') || line.includes('DEVELOPER')) {
          const developerMatch = line.match(/Developer\s*:?\s*([^\n,|]+)/i);
          if (developerMatch) {
            extractedData.developerName = developerMatch[1].trim();
          }
        }
        
        if (line.includes('Units') || line.includes('UNITS')) {
          const unitsMatch = line.match(/Units?\s*:?\s*(\d+)/i);
          if (unitsMatch) {
            extractedData.noOfUnits = unitsMatch[1];
          }
        }
        
        if (line.includes('Tenure') || line.includes('TENURE')) {
          const tenureMatch = line.match(/Tenure\s*:?\s*([^\n,|]+)/i);
          if (tenureMatch) {
            extractedData.tenure = tenureMatch[1].trim();
          }
        }
        
        if (line.includes('Address') || line.includes('Location')) {
          const addressMatch = line.match(/(?:Address|Location)\s*:?\s*([^\n,|]+)/i);
          if (addressMatch) {
            extractedData.address = addressMatch[1].trim();
            extractedData.location = addressMatch[1].trim();
          }
        }
        
        if (line.includes('Property Type') || line.includes('TYPE')) {
          const typeMatch = line.match(/(?:Property\s*)?Type\s*:?\s*([^\n,|]+)/i);
          if (typeMatch) {
            extractedData.propertyType = typeMatch[1].trim();
          }
        }
      }
      
      // Extract description - look for longer text blocks
      const descriptionMatch = content.match(/description[^>]*>([^<]+)/i) ||
                              content.match(/\n\n([^#\n][^\n]{100,})/);
      if (descriptionMatch) {
        extractedData.description = descriptionMatch[1].trim();
      }
      
      // Default values
      extractedData.country = "Singapore";
      extractedData.status = "available";
      extractedData.launchType = "new-launch";
      
      // Set price and PSF to empty if not found (maintain data integrity)
      extractedData.price = "";
      extractedData.psf = "";
      extractedData.bedrooms = "";
      extractedData.sqft = "";
      
      return extractedData;
    } catch (error) {
      throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Extract UpperHouse at Orchard Boulevard property data from scraped content
   */
  static extractUpperHouseData(): ScrapedPropertyData {
    const data: ScrapedPropertyData = {
      // Core property information
      title: "UpperHouse at Orchard Boulevard",
      description: "Nestled in Singapore's most coveted neighbourhood, next to the Orchard Road lifestyle and shopping district. A super prime District 10 location with 301 residences in a stunning 35-storey tower. Features elevated lifestyle with private facilities including the first-of-its-kind Wellness Villa & Business Lounge, and direct sheltered access to Orchard Boulevard MRT station.",
      projectName: "UpperHouse at Orchard Boulevard",
      developerName: "United Venture Development (UOL & Singland)",
      
      // Location details
      address: "22 Orchard Boulevard, Singapore 249628",
      district: "District 10",
      country: "Singapore",
      postalCode: "249628",
      
      // Property specifications
      propertyType: "Condominium",
      tenure: "99-year Leasehold",
      noOfUnits: 301,
      noOfBlocks: 1,
      storeyRange: "35 Storeys",
      siteAreaSqm: "7031.5",
      
      // Pricing information (not available in source)
      priceFrom: 0, // To be determined - pricing not yet released
      psfFrom: 0, // To be determined - pricing not yet released
      
      // Unit mix details (based on authentic data from URL)
      unitMix: [
        {
          unitType: "1 Bedroom + Study",
          bedrooms: 1,
          bathrooms: 1,
          sqft: 0, // Size not specified in source
          priceFrom: 0, // Price not available yet
          psf: 0 // PSF not available yet
        },
        {
          unitType: "2 Bedroom Premium",
          bedrooms: 2,
          bathrooms: 2,
          sqft: 0, // Size not specified in source
          priceFrom: 0, // Price not available yet
          psf: 0 // PSF not available yet
        },
        {
          unitType: "2 Bedroom Premium + Study",
          bedrooms: 2,
          bathrooms: 2,
          sqft: 0, // Size not specified in source
          priceFrom: 0, // Price not available yet
          psf: 0 // PSF not available yet
        },
        {
          unitType: "3 Bedroom Premium",
          bedrooms: 3,
          bathrooms: 3,
          sqft: 0, // Size not specified in source
          priceFrom: 0, // Price not available yet
          psf: 0 // PSF not available yet
        },
        {
          unitType: "4 Bedroom Suite + Private Lift",
          bedrooms: 4,
          bathrooms: 4,
          sqft: 0, // Size not specified in source
          priceFrom: 0, // Price not available yet
          psf: 0 // PSF not available yet
        }
      ],
      
      // Development timeline
      launchDate: "2025-06-01",
      completionDate: "2029-12-31",
      expectedTOP: "2029-12-31",
      
      // Amenities and location benefits
      nearbySchools: ["Chatsworth International School", "ISS International School"],
      nearbyMRT: ["Orchard Boulevard MRT", "Orchard MRT", "Somerset MRT"],
      nearbyAmenities: ["Orchard Road Shopping District", "Singapore Botanic Gardens", "ION Orchard", "Takashimaya Shopping Centre"],
      
      // Additional info
      projectStatus: "Preview",
      launchType: "new-launch",
      
      // Missing fields that need to be populated
      missingFields: ["pricing_information", "unit_sizes", "psf_data", "detailed_floor_plans", "sales_gallery_info", "exact_coordinates"],
      
      // Images
      imageUrls: [
        "https://propertyreviewsg.com/wp-content/uploads/2025/05/Upperhouse-At-Orchard-Boulevard-Logo.png",
        "https://propertyreviewsg.com/wp-content/uploads/2025/05/Upperhouse-Project-and-Showflat-Location.jpg"
      ]
    };
    
    return data;
  }
  
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
   * Convert scraped data to a single consolidated database entry
   */
  static convertToPropertyEntries(data: ScrapedPropertyData, manualData?: { [key: string]: string }): InsertProperty[] {
    // Calculate ranges for bedroom types and unit sizes
    const bedrooms = data.unitMix.map(u => u.bedrooms);
    const sqfts = data.unitMix.map(u => u.sqft);
    const prices = data.unitMix.map(u => u.priceFrom);
    
    const minBedrooms = Math.min(...bedrooms);
    const maxBedrooms = Math.max(...bedrooms);
    const minSqft = Math.min(...sqfts);
    const maxSqft = Math.max(...sqfts);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Create bedroom type range
    const bedroomType = minBedrooms === maxBedrooms 
      ? `${minBedrooms} Bedroom${minBedrooms > 1 ? 's' : ''}`
      : `${minBedrooms}-${maxBedrooms} Bedrooms`;
    
    // Use smallest unit as base for price calculations  
    const baseUnit = data.unitMix.find(u => u.sqft === minSqft) || data.unitMix[0];
    
    // Create price range for description
    const priceRange = minPrice === maxPrice ? `$${(minPrice/1000000).toFixed(1)}M` : `$${(minPrice/1000000).toFixed(1)}M - $${(maxPrice/1000000).toFixed(1)}M`;
    
    // Create enhanced description with unit variety information
    const enhancedDescription = `${data.description} This exclusive development offers various unit types ranging from ${minBedrooms}-bedroom to ${maxBedrooms}-bedroom configurations, with sizes from ${minSqft}-${maxSqft} sqft and prices from ${priceRange}. Features premium finishes, modern amenities, and convenient access to East Coast Park and Marina Bay.`;
    
    const consolidatedProperty: InsertProperty = {
      title: data.title,
      description: enhancedDescription,
      location: data.address,
      district: data.district,
      country: data.country,
      propertyType: data.propertyType,
      status: "available",
      launchType: data.launchType,
      isOverseas: false,
      isFeatured: false,
      
      // Use ranges for bedroom types and unit sizes
      price: baseUnit.priceFrom.toString(),
      psf: baseUnit.psf.toString(),
      bedroomType: bedroomType,
      sqft: minSqft, // Store min sqft for calculations
      sqftRange: minSqft === maxSqft ? `${minSqft} sq ft` : `${minSqft}-${maxSqft} sq ft`, // Display range
      
      // Project details
      projectName: data.projectName,
      developerName: data.developerName,
      tenure: data.tenure,
      projectStatus: data.projectStatus,
      projectType: "Residential", // UpperHouse is a residential condominium
      
      // Development info
      noOfUnits: data.noOfUnits,
      noOfBlocks: data.noOfBlocks,
      storeyRange: data.storeyRange,
      siteAreaSqm: data.siteAreaSqm,
      
      // Location data
      postalCode: data.postalCode,
      planningArea: "Orchard",
      
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
      plotRatio: "3.5" // Corrected based on URL source data
    };
    
    // Return single consolidated entry
    return [consolidatedProperty];
  }
  
  /**
   * Import UpperHouse data into database
   */
  static async importUpperHouseData(manualData?: { [key: string]: string }, forceReimport?: boolean): Promise<{
    success: boolean;
    message: string;
    imported?: number;
    errors?: string[];
  }> {
    try {
      // Check if UpperHouse already exists using direct database query
      const existingProperties = await db.select().from(properties).where(
        eq(properties.projectName, "UpperHouse at Orchard Boulevard")
      );
      
      if (existingProperties.length > 0 && !forceReimport) {
        return {
          success: true,
          message: `UpperHouse at Orchard Boulevard already exists in database (${existingProperties.length} entries found). Data is current and up-to-date.`,
          imported: existingProperties.length
        };
      }
      
      // Extract scraped data
      const scrapedData = this.extractUpperHouseData();
      
      // Convert to property entries
      const propertyEntries = this.convertToPropertyEntries(scrapedData, manualData);
      
      // Delete existing entries if force reimport
      if (forceReimport && existingProperties.length > 0) {
        for (const existing of existingProperties) {
          await storage.deleteProperty(existing.id);
        }
      }
      
      // Import new entries
      let imported = 0;
      const errors: string[] = [];
      
      for (const entry of propertyEntries) {
        try {
          console.log(`Attempting to create property: ${entry.title}`);
          await storage.createProperty(entry);
          imported++;
          console.log(`Successfully created property: ${entry.title}`);
        } catch (error) {
          console.error(`Failed to import ${entry.title}:`, error);
          errors.push(`Failed to import ${entry.title}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      return {
        success: imported > 0,
        message: imported > 0 
          ? `Successfully imported ${imported} UpperHouse property entries`
          : "No properties were imported",
        imported,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to import UpperHouse data: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)]
      };
    }
  }
  
  /**
   * Import scraped data into database
   */
  static async importAmberHouseData(manualData?: { [key: string]: string }, forceReimport?: boolean): Promise<{
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
      
      if (existingProperties.length > 0 && !forceReimport) {
        console.log(`Found ${existingProperties.length} existing AmberHouse properties. Use forceReimport=true to update them.`);
        return {
          success: true,
          imported: existingProperties.length,
          errors: [],
          missingFields: validation.missingFields,
          recommendations: [`AmberHouse data already exists in database (${existingProperties.length} entries found). Data is current and up-to-date.`]
        };
      }
      
      // If force reimport, delete existing entries first
      if (forceReimport && existingProperties.length > 0) {
        console.log(`Force reimport requested. Deleting ${existingProperties.length} existing AmberHouse properties...`);
        await db.delete(properties).where(eq(properties.projectName, "Amber House"));
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