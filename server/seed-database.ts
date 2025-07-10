import { db } from "./db";
import { properties, marketAnalytics } from "@shared/schema";
import type { InsertProperty, InsertMarketAnalytics } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  // Sample properties
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

  // Sample market analytics
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

  try {
    // Insert properties
    console.log("Inserting properties...");
    await db.insert(properties).values(sampleProperties);
    console.log(`Inserted ${sampleProperties.length} properties`);

    // Insert market analytics
    console.log("Inserting market analytics...");
    await db.insert(marketAnalytics).values(sampleAnalytics);
    console.log(`Inserted ${sampleAnalytics.length} market analytics`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };