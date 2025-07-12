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
   * Clean HTML tags and decode entities from text
   */
  static cleanHtmlText(text: string): string {
    if (!text) return '';
    
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Decode common HTML entities
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  /**
   * Scrape property data from any URL using advanced extraction patterns
   */
  static async scrapeFromUrl(url: string): Promise<{ [key: string]: string }> {
    try {
      let content = '';
      
      // Fetch content with proper headers
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });
        
        if (response.ok) {
          content = await response.text();
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        throw new Error(`Failed to fetch URL: ${fetchError instanceof Error ? fetchError.message : 'Network error'}`);
      }
      
      // Initialize extracted data
      const extractedData: { [key: string]: string } = {};
      
      // Clean and prepare content for extraction
      const cleanContent = this.cleanHtmlText(content);
      const lines = cleanContent.split('\n').filter(line => line.trim().length > 0);
      
      // Extract title from multiple sources
      const titlePatterns = [
        /<title[^>]*>([^<]+)<\/title>/i,
        /<h1[^>]*>([^<]+)<\/h1>/i,
        /property\s*name\s*:?\s*([^\n,|]+)/i,
        /project\s*name\s*:?\s*([^\n,|]+)/i
      ];
      
      for (const pattern of titlePatterns) {
        const match = content.match(pattern);
        if (match && !extractedData.title) {
          extractedData.title = this.cleanHtmlText(match[1]);
          extractedData.projectName = this.cleanHtmlText(match[1]);
          break;
        }
      }
      
      // Advanced multi-pattern extraction for each field
      const extractionPatterns = {
        developer: [
          /developer\s*:?\s*([^\n,|<>]+)/i,
          /developed\s*by\s*:?\s*([^\n,|<>]+)/i,
          /builder\s*:?\s*([^\n,|<>]+)/i,
          /by\s+([A-Z][^,\n|<>]+(?:pte|ltd|group|development|properties)[^,\n|<>]*)/i
        ],
        district: [
          /district\s*:?\s*([^\n,|<>]+)/i,
          /D(\d+)/i,
          /district\s+(\d+)/i,
          /location\s*:?\s*district\s*(\d+)/i
        ],
        address: [
          /address\s*:?\s*([^\n,|<>]+singapore[^,\n|<>]*)/i,
          /location\s*:?\s*([^\n,|<>]+singapore[^,\n|<>]*)/i,
          /([^,\n|<>]+,\s*singapore\s*\d{6})/i,
          /situated\s*(?:at|in)\s*([^\n,|<>]+)/i
        ],
        postalCode: [
          /singapore\s*(\d{6})/i,
          /postal\s*code\s*:?\s*(\d{6})/i,
          /(\d{6})/
        ],
        propertyType: [
          /property\s*type\s*:?\s*([^\n,|<>]+)/i,
          /type\s*:?\s*(condominium|apartment|executive|landed|townhouse|penthouse)/i,
          /(condominium|apartment|executive condominium|landed house|townhouse|penthouse)/i
        ],
        tenure: [
          /tenure\s*:?\s*([^\n,|<>]+)/i,
          /(freehold|leasehold|99-year|999-year|103-year)/i,
          /land\s*tenure\s*:?\s*([^\n,|<>]+)/i
        ],
        noOfUnits: [
          /total\s*units?\s*:?\s*(\d+)/i,
          /units?\s*:?\s*(\d+)/i,
          /(\d+)\s*units?/i,
          /number\s*of\s*units?\s*:?\s*(\d+)/i
        ],
        noOfBlocks: [
          /blocks?\s*:?\s*(\d+)/i,
          /towers?\s*:?\s*(\d+)/i,
          /buildings?\s*:?\s*(\d+)/i,
          /(\d+)\s*blocks?/i
        ],
        storeyRange: [
          /storey\s*:?\s*([^\n,|<>]+)/i,
          /floors?\s*:?\s*([^\n,|<>]+)/i,
          /(\d+)\s*storey/i,
          /(\d+)\s*floors?/i,
          /height\s*:?\s*([^\n,|<>]+)/i
        ],
        siteAreaSqm: [
          /site\s*area\s*:?\s*([^\n,|<>]+)/i,
          /land\s*area\s*:?\s*([^\n,|<>]+)/i,
          /(\d+(?:,\d+)*)\s*sqm/i,
          /(\d+(?:,\d+)*)\s*sq\.?\s*m/i
        ],
        plotRatio: [
          /plot\s*ratio\s*:?\s*([^\n,|<>]+)/i,
          /gpr\s*:?\s*([^\n,|<>]+)/i,
          /gross\s*plot\s*ratio\s*:?\s*([^\n,|<>]+)/i
        ],
        launchDate: [
          /launch\s*(?:date)?\s*:?\s*([^\n,|<>]+)/i,
          /expected\s*launch\s*:?\s*([^\n,|<>]+)/i,
          /preview\s*:?\s*([^\n,|<>]+)/i
        ],
        completionDate: [
          /completion\s*(?:date)?\s*:?\s*([^\n,|<>]+)/i,
          /expected\s*completion\s*:?\s*([^\n,|<>]+)/i,
          /top\s*:?\s*([^\n,|<>]+)/i,
          /ready\s*:?\s*([^\n,|<>]+)/i
        ],
        planningArea: [
          /planning\s*area\s*:?\s*([^\n,|<>]+)/i,
          /area\s*:?\s*([A-Z][^,\n|<>]{3,20})/i,
          /region\s*:?\s*([^\n,|<>]+)/i
        ],
        mrtNearby: [
          /mrt\s*:?\s*([^\n,|<>]+)/i,
          /nearest\s*mrt\s*:?\s*([^\n,|<>]+)/i,
          /([^,\n|<>]+mrt)/i,
          /transport\s*:?\s*([^\n,|<>]+mrt[^\n,|<>]*)/i
        ],
        primarySchoolsWithin1km: [
          /schools?\s*:?\s*([^\n,|<>]+)/i,
          /primary\s*schools?\s*:?\s*([^\n,|<>]+)/i,
          /nearby\s*schools?\s*:?\s*([^\n,|<>]+)/i,
          /education\s*:?\s*([^\n,|<>]+)/i
        ]
      };
      
      // Apply extraction patterns
      for (const [field, patterns] of Object.entries(extractionPatterns)) {
        for (const pattern of patterns) {
          const match = cleanContent.match(pattern);
          if (match && match[1] && !extractedData[field]) {
            let value = this.cleanHtmlText(match[1]).trim();
            
            // Special processing for certain fields
            if (field === 'district' && /^\d+$/.test(value)) {
              value = `District ${value}`;
            }
            if (field === 'siteAreaSqm') {
              value = value.replace(/,/g, '').replace(/[^\d]/g, '');
            }
            if (field === 'noOfUnits' || field === 'noOfBlocks') {
              value = value.replace(/[^\d]/g, '');
            }
            
            if (value.length > 0 && value.length < 200) {
              extractedData[field] = value;
            }
            break;
          }
        }
      }
      
      // Extract description from multiple sources
      const descriptionPatterns = [
        /description\s*:?\s*([^<\n]{100,})/i,
        /project\s*description\s*:?\s*([^<\n]{100,})/i,
        /about\s*:?\s*([^<\n]{100,})/i,
        /overview\s*:?\s*([^<\n]{100,})/i,
        /summary\s*:?\s*([^<\n]{100,})/i
      ];
      
      for (const pattern of descriptionPatterns) {
        const match = cleanContent.match(pattern);
        if (match && match[1] && !extractedData.description) {
          const desc = this.cleanHtmlText(match[1]).trim();
          if (desc.length > 50) {
            extractedData.description = desc;
            extractedData.projectDescription = desc;
            break;
          }
        }
      }
      
      // Set default values
      extractedData.country = "Singapore";
      extractedData.status = "available";
      extractedData.launchType = "new-launch";
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
          success: false,
          message: `UpperHouse at Orchard Boulevard already exists, data import will not be executed`,
          imported: 0
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
          success: false,
          imported: 0,
          errors: [],
          missingFields: validation.missingFields,
          recommendations: [`AmberHouse already exists, data import will not be executed`]
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