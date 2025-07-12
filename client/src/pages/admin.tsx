import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { Download, Database, AlertTriangle, CheckCircle, Info, ArrowRight } from "lucide-react";

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

export default function Admin() {
  const [importStatus, setImportStatus] = useState<ImportResult | null>(null);

  // Validate AmberHouse data
  const { data: validation, isLoading: validationLoading } = useQuery<ValidationResult>({
    queryKey: ["/api/admin/validate/amberhouse"],
    queryFn: async () => {
      return await apiRequest("/api/admin/validate/amberhouse");
    },
  });

  // Import AmberHouse data
  const importMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/import/amberhouse", {
        method: "POST",
      });
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