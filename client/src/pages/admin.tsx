import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, Database, AlertTriangle, CheckCircle, Info, ArrowRight, MapPin, Phone, DollarSign, Settings, Globe, Building, Users, Flag } from "lucide-react";

interface ValidationResult {
  title: string;
  projectName: string;
  developer: string;
  unitVariants: number;
  validation: {
    isValid: boolean;
    missingFields: string[];
    recommendations: string[];
  };
  previewData: {
    address: string;
    district: string;
    tenure: string;
    totalUnits: number;
    priceRange: string;
    psfRange: string;
    completionDate: string;
  };
}

interface ImportResult {
  success: boolean;
  message: string;
  imported?: number;
  missingFields?: string[];
  recommendations?: string[];
  errors?: string[];
}

interface ManualEntryData {
  [key: string]: string;
}

// Property field definitions with labels, types, and categories
const PROPERTY_FIELDS = {
  // Core Information
  title: { label: "Property Title", type: "text", category: "Core", required: true },
  description: { label: "Description", type: "textarea", category: "Core", required: true },
  price: { label: "Price (SGD)", type: "number", category: "Core", required: true },
  psf: { label: "Price per Sqft", type: "number", category: "Core", required: true },
  location: { label: "Location", type: "text", category: "Core", required: true },
  district: { label: "District", type: "select", category: "Core", required: true, options: [
    "District 1", "District 2", "District 3", "District 4", "District 5", "District 6", "District 7", "District 8", "District 9", "District 10",
    "District 11", "District 12", "District 13", "District 14", "District 15", "District 16", "District 17", "District 18", "District 19", "District 20",
    "District 21", "District 22", "District 23", "District 24", "District 25", "District 26", "District 27", "District 28", "Sentosa"
  ]},
  country: { label: "Country", type: "text", category: "Core", required: true },
  propertyType: { label: "Property Type", type: "select", category: "Core", required: true, options: [
    "Condominium", "Apartment", "Executive Condominium", "Landed House", "Townhouse", "Penthouse", "HDB", "Commercial"
  ]},
  bedrooms: { label: "Bedroom Types", type: "text", category: "Core", required: true, placeholder: "e.g., 1-5 Bedrooms" },
  sqft: { label: "Unit Sizes", type: "text", category: "Core", required: true, placeholder: "e.g., 450-1650 sq ft" },
  status: { label: "Status", type: "select", category: "Core", required: true, options: [
    "available", "sold-out", "launching-soon", "under-construction", "completed", "preview"
  ]},
  launchType: { label: "Launch Type", type: "select", category: "Core", required: true, options: [
    "new-launch", "resale", "sub-sale", "pre-launch", "soft-launch"
  ]},
  imageUrl: { label: "Image URL", type: "text", category: "Core", required: true },
  
  // Contact Information
  agentName: { label: "Agent Name", type: "text", category: "Contact", required: true },
  agentPhone: { label: "Agent Phone", type: "text", category: "Contact", required: true },
  agentEmail: { label: "Agent Email", type: "email", category: "Contact", required: true },
  expectedRoi: { label: "Expected ROI (%)", type: "number", category: "Contact", required: false },
  
  // Project Details
  projectId: { label: "Project ID", type: "text", category: "Project", required: false, autoGenerate: true },
  projectName: { label: "Project Name", type: "text", category: "Project", required: false },
  developerName: { label: "Developer Name", type: "text", category: "Project", required: false },
  projectType: { label: "Project Type", type: "select", category: "Project", required: false, options: [
    "Residential", "Commercial", "Mixed Development", "Industrial", "Retail", "Office", "Hospitality", "Institutional"
  ]},
  tenure: { label: "Tenure", type: "select", category: "Project", required: false, options: [
    "Freehold", "99-year Leasehold", "999-year Leasehold", "103-year Leasehold", "60-year Leasehold", "30-year Leasehold"
  ]},
  planningArea: { label: "Planning Area", type: "text", category: "Project", required: false },
  address: { label: "Full Address", type: "text", category: "Project", required: false },
  postalCode: { label: "Postal Code", type: "text", category: "Project", required: false },
  launchDate: { label: "Launch Date", type: "date", category: "Project", required: false },
  completionDate: { label: "Completion Date", type: "date", category: "Project", required: false },
  noOfUnits: { label: "Number of Units", type: "number", category: "Project", required: false },
  noOfBlocks: { label: "Number of Blocks", type: "number", category: "Project", required: false },
  storeyRange: { label: "Storey Range", type: "text", category: "Project", required: false },
  siteAreaSqm: { label: "Site Area (sqm)", type: "number", category: "Project", required: false },
  plotRatio: { label: "Plot Ratio", type: "number", category: "Project", required: false },
  projectDescription: { label: "Project Description", type: "textarea", category: "Project", required: false },
  projectStatus: { label: "Project Status", type: "select", category: "Project", required: false, options: [
    "Planning", "Construction", "Completed", "Launched", "Sold Out", "Delayed", "Cancelled", "Under Review"
  ]},
  
  // Location Details
  lat: { label: "Latitude", type: "number", category: "Location", required: false },
  lng: { label: "Longitude", type: "number", category: "Location", required: false },
  primarySchoolsWithin1km: { label: "Primary Schools (comma-separated)", type: "text", category: "Location", required: false },
  mrtNearby: { label: "Nearby MRT (comma-separated)", type: "text", category: "Location", required: false },
  
  // Flags
  isFeatured: { label: "Featured Property", type: "checkbox", category: "Flags", required: false },
  isOverseas: { label: "Overseas Property", type: "checkbox", category: "Flags", required: false },
  featured: { label: "Featured (Legacy)", type: "checkbox", category: "Flags", required: false },
};

export default function Admin() {
  const [selectedProperty, setSelectedProperty] = useState<string>("upperhouse");
  const [importStatus, setImportStatus] = useState<ImportResult | null>(null);
  const [manualData, setManualData] = useState<ManualEntryData>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Core");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState<string>("");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [isFormCleared, setIsFormCleared] = useState(false);
  const { toast } = useToast();

  // Helper functions
  const updateManualData = (field: string, value: string | boolean) => {
    setManualData(prev => ({ ...prev, [field]: value.toString() }));
  };

  const generateProjectId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `PROJ-${timestamp}-${randomStr}`.toUpperCase();
  };

  const getFieldsByCategory = (category: string) => {
    return Object.entries(PROPERTY_FIELDS).filter(([_, field]) => field.category === category);
  };

  const getCategories = () => {
    const categories = new Set(Object.values(PROPERTY_FIELDS).map(field => field.category));
    return Array.from(categories);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Core": return Settings;
      case "Contact": return Phone;
      case "Investment": return DollarSign;
      case "Project": return Building;
      case "Location": return MapPin;
      case "Flags": return Flag;
      default: return Info;
    }
  };

  const renderField = (fieldKey: string, field: any) => {
    const value = manualData[fieldKey] || "";
    
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={fieldKey}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            value={value}
            onChange={(e) => updateManualData(fieldKey, e.target.value)}
            className="mt-1"
            rows={3}
          />
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2 mt-1">
            <Checkbox
              id={fieldKey}
              checked={value === "true"}
              onCheckedChange={(checked) => updateManualData(fieldKey, checked)}
            />
            <Label htmlFor={fieldKey} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>
        );
      case "select":
        return (
          <Select value={value} onValueChange={(newValue) => updateManualData(fieldKey, newValue)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        // Handle auto-generated fields
        if (field.autoGenerate && fieldKey === "projectId") {
          return (
            <div className="flex gap-2 mt-1">
              <Input
                id={fieldKey}
                type={field.type}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                value={value}
                onChange={(e) => updateManualData(fieldKey, e.target.value)}
                className="flex-1"
                step={field.type === "number" ? "0.01" : undefined}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateManualData(fieldKey, generateProjectId())}
                className="px-3"
              >
                Generate
              </Button>
            </div>
          );
        }
        return (
          <Input
            id={fieldKey}
            type={field.type}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            value={value}
            onChange={(e) => updateManualData(fieldKey, e.target.value)}
            className="mt-1"
            step={field.type === "number" ? "0.01" : undefined}
          />
        );
    }
  };



  // Validate property data dynamically
  const { data: validation, isLoading: validationLoading } = useQuery<ValidationResult>({
    queryKey: ["/api/admin/validate", selectedProperty],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/validate/${selectedProperty}`);
      return await response.json();
    },
  });

  // Load scraped data into form fields
  const loadScrapedData = async () => {
    if (validation && !isDataLoaded) {
      try {
        // Fetch the full scraped data from server
        const response = await fetch(`/api/admin/scraped-data/${selectedProperty}`);
        const fullScrapedData = await response.json();
        
        // Extract bedroom types from unit mix
        const bedroomTypes = [...new Set(fullScrapedData.unitMix.map((unit: any) => `${unit.bedrooms} BR`))];
        const bedroomTypesStr = bedroomTypes.length > 1 ? `${Math.min(...bedroomTypes.map((bt: string) => parseInt(bt)))}-${Math.max(...bedroomTypes.map((bt: string) => parseInt(bt)))} Bedrooms` : bedroomTypes[0];
        
        // Extract unit sizes from unit mix (handle missing size data)
        const unitSizes = fullScrapedData.unitMix.map((unit: any) => unit.sqft).filter((size: number) => size > 0);
        const unitSizesStr = unitSizes.length > 0 ? `${Math.min(...unitSizes)}-${Math.max(...unitSizes)} sq ft` : "To be determined";
        
        // Extract price range from unit mix (handle missing pricing data)
        const prices = fullScrapedData.unitMix.map((unit: any) => unit.priceFrom).filter((price: number) => price > 0);
        const priceFrom = prices.length > 0 ? Math.min(...prices) : 0;
        
        // Extract PSF range from unit mix (handle missing PSF data)
        const psfValues = fullScrapedData.unitMix.map((unit: any) => unit.psf).filter((psf: number) => psf > 0);
        const psfFrom = psfValues.length > 0 ? Math.min(...psfValues) : 0;
        
        const scrapedData: ManualEntryData = {
          title: fullScrapedData.title,
          description: fullScrapedData.description,
          price: priceFrom > 0 ? priceFrom.toString() : "",
          psf: psfFrom > 0 ? psfFrom.toString() : "",
          location: fullScrapedData.address,
          projectName: fullScrapedData.projectName,
          developerName: fullScrapedData.developerName,
          address: fullScrapedData.address,
          district: fullScrapedData.district,
          country: fullScrapedData.country,
          postalCode: fullScrapedData.postalCode,
          propertyType: fullScrapedData.propertyType,
          bedrooms: bedroomTypesStr,
          sqft: unitSizesStr,
          tenure: fullScrapedData.tenure,
          status: "available",
          launchType: fullScrapedData.launchType,
          noOfUnits: fullScrapedData.noOfUnits.toString(),
          noOfBlocks: fullScrapedData.noOfBlocks.toString(),
          storeyRange: fullScrapedData.storeyRange,
          siteAreaSqm: fullScrapedData.siteAreaSqm,
          plotRatio: "3.5",
          projectId: generateProjectId(),
          projectType: "Residential",
          launchDate: fullScrapedData.launchDate,
          completionDate: fullScrapedData.completionDate,
          projectStatus: fullScrapedData.projectStatus,
          primarySchoolsWithin1km: fullScrapedData.nearbySchools.join(", "),
          mrtNearby: fullScrapedData.nearbyMRT.join(", "),
          projectDescription: fullScrapedData.description,
          imageUrl: fullScrapedData.imageUrls[0] || "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          // Default values for missing fields
          agentName: "Property Sales Team",
          agentPhone: "+65 6100 8108",
          agentEmail: "sales@propertyreviewsg.com",
          expectedRoi: "6.5",
          lat: "1.302000",
          lng: "103.906700",
          isFeatured: "false",
          isOverseas: "false",
          featured: "false",
          planningArea: "Marine Parade"
        };
        
        setManualData(scrapedData);
        setIsDataLoaded(true);
        setIsFormCleared(false);
      } catch (error) {
        console.error('Error loading scraped data:', error);
        // Fallback to validation data if full scraped data fails
        const fallbackData: ManualEntryData = {
          title: "AmberHouse",
          description: "Located at Amber Gardens, AmberHouse is a freehold development that sits within the quaint residential enclave along Amber Road, in the prime vicinity of Singapore's East Coast.",
          price: "1920000",
          psf: "2880",
          location: "Amber Gardens, Singapore",
          projectName: validation.projectName,
          developerName: validation.developer,
          address: validation.previewData.address,
          district: validation.previewData.district,
          country: "Singapore",
          postalCode: "439964",
          propertyType: "Condominium",
          bedrooms: "2-4 Bedrooms",
          sqft: "635-1744 sq ft",
          tenure: validation.previewData.tenure,
          status: "available",
          launchType: "new-launch",
          noOfUnits: validation.previewData.totalUnits.toString(),
          noOfBlocks: "1",
          storeyRange: "16 Storeys",
          siteAreaSqm: "3801.4",
          plotRatio: "3.5",
          projectId: generateProjectId(),
          projectType: "Residential",
          launchDate: "2025-06-28",
          completionDate: validation.previewData.completionDate,
          projectStatus: "Open for Booking",
          primarySchoolsWithin1km: "Tanjong Katong Primary School",
          mrtNearby: "Tanjong Katong MRT, Marine Parade MRT",
          projectDescription: "Located at Amber Gardens, AmberHouse is a freehold development that sits within the quaint residential enclave along Amber Road, in the prime vicinity of Singapore's East Coast. Stay close to an array of dining, shopping and recreational amenities.",
          imageUrl: "https://propertyreviewsg.com/wp-content/uploads/2025/06/Amberhouse-Project-Image-1.jpg",
          agentName: "Property Sales Team",
          agentPhone: "+65 6100 8108",
          agentEmail: "sales@propertyreviewsg.com",
          expectedRoi: "6.5",
          lat: "1.302000",
          lng: "103.906700",
          isFeatured: "false",
          isOverseas: "false",
          featured: "false",
          planningArea: "Marine Parade"
        };
        
        setManualData(fallbackData);
        setIsDataLoaded(true);
        setIsFormCleared(false);
      }
    }
  };

  // Load scraped data when validation data is available (but not if form was manually cleared)
  useEffect(() => {
    if (validation && !isDataLoaded && !isFormCleared) {
      loadScrapedData();
    }
  }, [validation, isDataLoaded, isFormCleared]);

  // Reset form when property source changes
  useEffect(() => {
    setIsDataLoaded(false);
    setManualData({});
    setImportStatus(null);
    setScrapeUrl("");
    setIsFormCleared(false);
  }, [selectedProperty]);

  // Import property data dynamically
  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/admin/import/${selectedProperty}`, {
        manualData: manualData,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setImportStatus(data);
      
      // Show success toast notification
      if (data.success) {
        toast({
          title: "✅ Import Successful",
          description: `${data.imported} ${validation?.projectName || 'property'} entries are now available in your database.`,
          duration: 5000,
        });
        
        // Reset form fields after successful import
        setManualData({});
        setIsDataLoaded(false);
        setScrapeUrl("");
        
        // Clear import status after showing success message
        setTimeout(() => {
          setImportStatus(null);
        }, 3000);
      } else {
        // Handle duplicate import case
        if (data.message && data.message.includes("already exists")) {
          toast({
            title: "⚠️ Duplicate Import Blocked",
            description: data.message,
            variant: "destructive",
            duration: 5000,
          });
        } else {
          toast({
            title: "⚠️ Import Completed with Warnings",
            description: data.message || "Import completed but with some issues.",
            duration: 5000,
          });
        }
      }
    },
    onError: (error) => {
      setImportStatus({
        success: false,
        message: "Failed to import data",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
      
      // Show error toast notification
      toast({
        title: "❌ Import Failed",
        description: `There was an error importing the ${validation?.projectName || 'property'} data. Please check the details below.`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleImport = () => {
    importMutation.mutate();
  };

  const handleClearForm = () => {
    // Reset all form data to empty object
    setManualData({});
    setIsDataLoaded(false);
    setScrapeUrl("");
    setImportStatus(null);
    setIsFormCleared(true);
    
    // Reset the selected category to the first tab
    setSelectedCategory("Core");
    
    toast({
      title: "✅ Form Cleared",
      description: "All form fields have been reset to empty values.",
      duration: 3000,
    });
  };

  // URL scraping functionality
  const handleUrlScrape = async () => {
    if (!scrapeUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL to scrape",
        variant: "destructive",
      });
      return;
    }

    setIsScrapingUrl(true);
    try {
      const response = await apiRequest("POST", "/api/admin/scrape-url", {
        url: scrapeUrl.trim()
      });
      
      const scrapedData = await response.json();
      
      if (scrapedData.success) {
        // Populate the manual data fields with scraped data
        setManualData(scrapedData.data);
        setIsDataLoaded(true);
        setIsFormCleared(false);
        
        toast({
          title: "✅ URL Scraped Successfully",
          description: `Data from ${scrapeUrl} has been loaded into the form fields.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "⚠️ Scraping Failed",
          description: scrapedData.message || "Failed to scrape data from the URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Scraping Error",
        description: "There was an error scraping the URL. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsScrapingUrl(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Import Administration</h1>
          <p className="text-gray-600">Manage property data imports and validate scraped information</p>
        </div>

        {/* Property Source Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Property Source Selection
            </CardTitle>
            <CardDescription>
              Choose the property data source you want to import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="property-source">Select Property Source:</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a property source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upperhouse">UpperHouse at Orchard Boulevard</SelectItem>
                  <SelectItem value="amberhouse">AmberHouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* URL Data Scraper */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              URL Data Scraper
            </CardTitle>
            <CardDescription>
              Enter any property URL to scrape data and populate the form fields below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="scrape-url">Property URL:</Label>
                <Input
                  id="scrape-url"
                  type="url"
                  placeholder="https://example.com/property-listing"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleUrlScrape}
                disabled={isScrapingUrl || !scrapeUrl.trim()}
                className="flex items-center gap-2"
              >
                {isScrapingUrl ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Scraping...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Scrape Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Property Data Editor */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Property Data Editor
            </CardTitle>
            <CardDescription>
              Fill in or override property fields. This universal editor can handle any property data source.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {validationLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading data...</span>
              </div>
            ) : validation ? (
              <div className="space-y-6">
                {/* Load Data Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Load scraped property data into the form fields below, or enter property details manually.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isDataLoaded && (
                      <Button
                        onClick={loadScrapedData}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Load Scraped Data
                      </Button>
                    )}
                    {isDataLoaded && (
                      <Button
                        onClick={handleClearForm}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Clear Form
                      </Button>
                    )}
                  </div>
                </div>

                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      {getCategories().map((category) => {
                        const Icon = getCategoryIcon(category);
                        return (
                          <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {category}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {getCategories().map((category) => (
                      <TabsContent key={category} value={category} className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getFieldsByCategory(category).map(([fieldKey, field]) => (
                            <div key={fieldKey} className="space-y-2">
                              <Label htmlFor={fieldKey} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                {field.label}
                                {field.required && <span className="text-red-500">*</span>}
                              </Label>
                              {renderField(fieldKey, field)}
                              {field.type === "text" && fieldKey === "primarySchoolsWithin1km" && (
                                <p className="text-xs text-gray-500">Enter school names separated by commas</p>
                              )}
                              {field.type === "text" && fieldKey === "mrtNearby" && (
                                <p className="text-xs text-gray-500">Enter MRT stations separated by commas</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {/* Data Preview Summary */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h6 className="text-sm font-medium text-blue-900 mb-2">Data Preview</h6>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(manualData).slice(0, 8).map(([key, value]) => (
                          value && (
                            <div key={key} className="truncate">
                              <span className="font-medium">{PROPERTY_FIELDS[key]?.label || key}:</span> {value}
                            </div>
                          )
                        ))}
                      </div>
                      {Object.keys(manualData).length > 8 && (
                        <p className="text-xs text-blue-600 mt-2">
                          +{Object.keys(manualData).length - 8} more fields filled
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Import Button */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-600">
                      {validation.unitVariants} property ready for import
                    </div>
                    <Button
                      onClick={handleImport}
                      disabled={importMutation.isPending}
                      className="btn-primary"
                    >
                      {importMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Import Data
                        </>
                      )}
                    </Button>
                  </div>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load validation data. Please try refreshing the page.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Import Status */}
        {importStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {importStatus.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                )}
                Import Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className={importStatus.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={importStatus.success ? "text-green-800" : "text-red-800"}>
                    {importStatus.message}
                  </AlertDescription>
                </Alert>

                {importStatus.success && importStatus.imported && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Import Summary</h4>
                    <p className="text-green-800">Successfully imported {importStatus.imported} property entries</p>
                    <div className="mt-4">
                      <Button asChild variant="outline" className="text-green-700 border-green-200">
                        <a href="/properties">
                          View Properties <ArrowRight className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {importStatus.errors && importStatus.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-900 mb-2">Errors</h4>
                    <div className="space-y-1">
                      {importStatus.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-700">{error}</p>
                      ))}
                    </div>
                  </div>
                )}

                {importStatus.missingFields && importStatus.missingFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-900 mb-2">Missing Fields</h4>
                    <div className="space-y-1">
                      {importStatus.missingFields.map((field, index) => (
                        <Badge key={index} variant="outline" className="text-orange-700 border-orange-200">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {importStatus.recommendations && importStatus.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {importStatus.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-blue-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}