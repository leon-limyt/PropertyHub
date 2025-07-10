import { db } from "./db";
import { properties } from "@shared/schema";
import type { InsertProperty } from "@shared/schema";

async function seedEnhancedDatabase() {
  console.log("Seeding database with enhanced property data...");

  // Enhanced sample properties with new fields
  const enhancedProperties: InsertProperty[] = [
    {
      // Legacy fields
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
      expectedRoi: "7.5",
      isFeatured: true,
      isOverseas: false,
      
      // New enhanced fields
      projectId: "MBR-2024-001",
      projectName: "Marina Bay Residences",
      developerName: "Marina Bay Development Pte Ltd",
      projectType: "Condo",
      tenure: "99-year",
      planningArea: "Downtown Core",
      address: "1 Shenton Way",
      postalCode: "068803",
      launchDate: "2024-03-15",
      completionDate: "2027-12-31",
      noOfUnits: 280,
      noOfBlocks: 2,
      storeyRange: "1-45",
      siteAreaSqm: "8500.00",
      plotRatio: "14.00",
      primarySchoolsWithin1km: ["Raffles Girls' Primary School", "Boat Quay Primary School"],
      mrtNearby: ["Raffles Place MRT", "Tanjong Pagar MRT"],
      lat: "1.2792",
      lng: "103.8480",
      projectDescription: "An iconic development featuring luxury residences with breathtaking marina views, premium amenities including infinity pool, sky gardens, and concierge services.",
      developerSalesTeamContact: {
        email: "sales@marinabayresidences.sg",
        phone: "+65 6123 4567",
        whatsapp: "+65 9123 4567"
      },
      featured: true,
      projectStatus: "Open for Booking"
    },
    {
      // Legacy fields
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
      expectedRoi: "6.8",
      isFeatured: true,
      isOverseas: false,
      
      // New enhanced fields
      projectId: "OH-2024-002",
      projectName: "Orchard Heights",
      developerName: "Orchard Development Group",
      projectType: "Condo",
      tenure: "Freehold",
      planningArea: "Orchard",
      address: "15 Orchard Road",
      postalCode: "238841",
      launchDate: "2024-01-20",
      completionDate: "2027-06-30",
      noOfUnits: 156,
      noOfBlocks: 1,
      storeyRange: "1-38",
      siteAreaSqm: "4200.00",
      plotRatio: "12.60",
      primarySchoolsWithin1km: ["Anglo-Chinese School (Primary)", "Emerald Hill Primary School"],
      mrtNearby: ["Orchard MRT", "Somerset MRT"],
      lat: "1.3048",
      lng: "103.8318",
      projectDescription: "Luxury living in the heart of Orchard Road with unparalleled access to shopping, dining, and entertainment. Features premium finishes and world-class amenities.",
      developerSalesTeamContact: {
        email: "sales@orchardheights.sg",
        phone: "+65 6234 5678",
        whatsapp: "+65 9234 5678"
      },
      featured: true,
      projectStatus: "Preview"
    },
    {
      // Legacy fields
      title: "East Coast Garden Residences",
      description: "Tranquil beachside living with modern amenities and easy access to the East Coast Park.",
      price: "1800000",
      psf: "1600",
      location: "30 Marine Parade Road, Singapore 449290",
      district: "District 15",
      country: "Singapore",
      propertyType: "New Launch Condo",
      bedrooms: 3,
      bathrooms: 3,
      sqft: 1125,
      status: "available",
      launchType: "new-launch",
      imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      agentName: "Jennifer Wong",
      agentPhone: "+65 9345 6789",
      agentEmail: "jennifer@propertyhub.sg",
      expectedRoi: "7.2",
      isFeatured: false,
      isOverseas: false,
      
      // New enhanced fields
      projectId: "ECGR-2024-003",
      projectName: "East Coast Garden Residences",
      developerName: "East Coast Properties Pte Ltd",
      projectType: "Condo",
      tenure: "99-year",
      planningArea: "Marine Parade",
      address: "30 Marine Parade Road",
      postalCode: "449290",
      launchDate: "2024-05-10",
      completionDate: "2028-03-31",
      noOfUnits: 320,
      noOfBlocks: 4,
      storeyRange: "1-25",
      siteAreaSqm: "12000.00",
      plotRatio: "2.80",
      primarySchoolsWithin1km: ["Tanjong Katong Primary School", "Haig Girls' School"],
      mrtNearby: ["Marine Parade MRT", "Katong Park MRT"],
      lat: "1.3020",
      lng: "103.9067",
      projectDescription: "Beachside luxury with panoramic sea views, resort-style amenities, and direct access to East Coast Park. Perfect for families seeking tranquil coastal living.",
      developerSalesTeamContact: {
        email: "sales@eastcoastgarden.sg",
        phone: "+65 6345 6789",
        whatsapp: "+65 9345 6789"
      },
      featured: false,
      projectStatus: "Coming Soon"
    }
  ];

  try {
    // Update existing properties with enhanced data
    for (const property of enhancedProperties) {
      await db.insert(properties).values(property).onConflictDoNothing();
    }

    console.log(`Updated/inserted ${enhancedProperties.length} enhanced properties`);
    console.log("Enhanced database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding enhanced database:", error);
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEnhancedDatabase();
}

export { seedEnhancedDatabase };