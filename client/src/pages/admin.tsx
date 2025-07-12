import { useState } from "react";
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
import { apiRequest } from "@/lib/queryClient";
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
  district: { label: "District", type: "text", category: "Core", required: true },
  country: { label: "Country", type: "text", category: "Core", required: true },
  propertyType: { label: "Property Type", type: "text", category: "Core", required: true },
  bedrooms: { label: "Bedrooms", type: "number", category: "Core", required: true },
  bathrooms: { label: "Bathrooms", type: "number", category: "Core", required: true },
  sqft: { label: "Square Feet", type: "number", category: "Core", required: true },
  status: { label: "Status", type: "text", category: "Core", required: true },
  launchType: { label: "Launch Type", type: "text", category: "Core", required: true },
  imageUrl: { label: "Image URL", type: "text", category: "Core", required: true },
  
  // Contact Information
  agentName: { label: "Agent Name", type: "text", category: "Contact", required: true },
  agentPhone: { label: "Agent Phone", type: "text", category: "Contact", required: true },
  agentEmail: { label: "Agent Email", type: "email", category: "Contact", required: true },
  expectedRoi: { label: "Expected ROI (%)", type: "number", category: "Investment", required: false },
  
  // Project Details
  projectId: { label: "Project ID", type: "text", category: "Project", required: false },
  projectName: { label: "Project Name", type: "text", category: "Project", required: false },
  developerName: { label: "Developer Name", type: "text", category: "Project", required: false },
  projectType: { label: "Project Type", type: "text", category: "Project", required: false },
  tenure: { label: "Tenure", type: "text", category: "Project", required: false },
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
  projectStatus: { label: "Project Status", type: "text", category: "Project", required: false },
  
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
  const [importStatus, setImportStatus] = useState<ImportResult | null>(null);
  const [manualData, setManualData] = useState<ManualEntryData>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Core");

  // Helper functions
  const updateManualData = (field: string, value: string | boolean) => {
    setManualData(prev => ({ ...prev, [field]: value.toString() }));
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
            placeholder={`Enter ${field.label.toLowerCase()}...`}
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
      default:
        return (
          <Input
            id={fieldKey}
            type={field.type}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            value={value}
            onChange={(e) => updateManualData(fieldKey, e.target.value)}
            className="mt-1"
            step={field.type === "number" ? "0.01" : undefined}
          />
        );
    }
  };

  // Validate AmberHouse data
  const { data: validation, isLoading: validationLoading } = useQuery<ValidationResult>({
    queryKey: ["/api/admin/validate/amberhouse"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/validate/amberhouse");
      return await response.json();
    },
  });

  // Import AmberHouse data
  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/import/amberhouse", {
        manualData: manualData,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setImportStatus(data);
    },
    onError: (error) => {
      setImportStatus({
        success: false,
        message: "Failed to import data",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    },
  });

  const handleImport = () => {
    importMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Import Administration</h1>
          <p className="text-gray-600">Manage property data imports and validate scraped information</p>
        </div>

        {/* AmberHouse Data Import Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              AmberHouse Data Import
            </CardTitle>
            <CardDescription>
              Import real property data scraped from propertyreviewsg.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            {validationLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Validating data...</span>
              </div>
            ) : validation ? (
              <div className="space-y-6">
                {/* Project Overview */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Project Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Project Name</p>
                      <p className="font-medium text-blue-900">{validation.projectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Developer</p>
                      <p className="font-medium text-blue-900">{validation.developer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Address</p>
                      <p className="font-medium text-blue-900">{validation.previewData.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">District</p>
                      <p className="font-medium text-blue-900">{validation.previewData.district}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Tenure</p>
                      <p className="font-medium text-blue-900">{validation.previewData.tenure}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Total Units</p>
                      <p className="font-medium text-blue-900">{validation.previewData.totalUnits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Price Range</p>
                      <p className="font-medium text-blue-900">{validation.previewData.priceRange}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">PSF Range</p>
                      <p className="font-medium text-blue-900">{validation.previewData.psfRange}</p>
                    </div>
                  </div>
                </div>

                {/* Unit Variants */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unit Variants</h3>
                  <Badge variant="secondary" className="text-sm">
                    {validation.unitVariants} different unit types will be imported
                  </Badge>
                </div>

                <Separator />

                {/* Validation Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Validation</h3>
                  
                  {validation.validation.isValid ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        All required fields are present. Ready for import.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        Some fields are missing but import can proceed. See missing fields below.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Missing Fields */}
                {validation.validation.missingFields.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Missing Fields</h4>
                    <div className="space-y-1">
                      {validation.validation.missingFields.map((field, index) => (
                        <Badge key={index} variant="outline" className="text-orange-700 border-orange-200">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {validation.validation.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {validation.validation.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Universal Property Data Editor */}
                <div className="border rounded-lg p-6 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-500" />
                    Property Data Editor
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Fill in or override property fields. This universal editor can handle any property data source and missing fields will be marked for manual entry.
                  </p>
                  
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
                </div>

                {/* Import Button */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    This will create {validation.unitVariants} property entries in your database
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
                        Import AmberHouse Data
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