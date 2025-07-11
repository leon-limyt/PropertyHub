import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Search, Filter, MapPin, Building, DollarSign, Bed, Bath, Ruler, Calendar, Train, School, X } from "lucide-react";
import PropertyCard from "@/components/property-card";
import { apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

export default function Properties() {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: "any",
    propertyType: "any",
    bedrooms: "any",
    bathrooms: "any",
    minPrice: "",
    maxPrice: "",
    minSqft: "",
    maxSqft: "",
    isOverseas: false,
    launchType: "any",
    // New filter fields
    district: "any",
    tenure: "any",
    topYear: "any",
    mrtDistance: "any",
    schoolDistance: "any",
  });

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newParams = { ...searchParams };
    
    urlParams.forEach((value, key) => {
      if (key === 'isOverseas') {
        newParams[key] = value === 'true';
      } else if (key === 'priceRange') {
        // Transform price range back to min/max prices
        if (value === "500000-800000") {
          newParams.minPrice = "500000";
          newParams.maxPrice = "800000";
        } else if (value === "800000-1200000") {
          newParams.minPrice = "800000";
          newParams.maxPrice = "1200000";
        } else if (value === "1200000-2000000") {
          newParams.minPrice = "1200000";
          newParams.maxPrice = "2000000";
        } else if (value === "2000000+") {
          newParams.minPrice = "2000000";
          newParams.maxPrice = "";
        }
      } else if (key === 'sqftRange') {
        // Transform sqft range back to min/max sqft
        if (value === "400-600") {
          newParams.minSqft = "400";
          newParams.maxSqft = "600";
        } else if (value === "600-800") {
          newParams.minSqft = "600";
          newParams.maxSqft = "800";
        } else if (value === "800-1000") {
          newParams.minSqft = "800";
          newParams.maxSqft = "1000";
        } else if (value === "1000+") {
          newParams.minSqft = "1000";
          newParams.maxSqft = "";
        }
      } else if (key in newParams) {
        newParams[key] = value;
      }
    });
    
    setSearchParams(newParams);
  }, [location]);

  const { data: properties, isLoading, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties/search"],
    queryFn: async () => {
      const searchData = {
        location: searchParams.location === "any" ? undefined : searchParams.location,
        propertyType: searchParams.propertyType === "any" ? undefined : searchParams.propertyType,
        bedrooms: searchParams.bedrooms === "any" ? undefined : parseInt(searchParams.bedrooms),
        bathrooms: searchParams.bathrooms === "any" ? undefined : parseInt(searchParams.bathrooms),
        minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
        maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
        minSqft: searchParams.minSqft ? parseInt(searchParams.minSqft) : undefined,
        maxSqft: searchParams.maxSqft ? parseInt(searchParams.maxSqft) : undefined,
        isOverseas: searchParams.isOverseas,
        launchType: searchParams.launchType === "any" ? undefined : searchParams.launchType,
        // New filter fields
        district: searchParams.district === "any" ? undefined : searchParams.district,
        tenure: searchParams.tenure === "any" ? undefined : searchParams.tenure,
        topYear: searchParams.topYear === "any" ? undefined : parseInt(searchParams.topYear),
        mrtDistance: searchParams.mrtDistance === "any" ? undefined : searchParams.mrtDistance,
        schoolDistance: searchParams.schoolDistance === "any" ? undefined : searchParams.schoolDistance,
      };
      
      return await apiRequest("/api/properties/search", {
        method: "POST",
        body: JSON.stringify(searchData),
      });
    },
  });

  const handleSearch = () => {
    refetch();
  };

  const handleReset = () => {
    setSearchParams({
      location: "any",
      propertyType: "any",
      bedrooms: "any",
      bathrooms: "any",
      minPrice: "",
      maxPrice: "",
      minSqft: "",
      maxSqft: "",
      isOverseas: false,
      launchType: "any",
      // New filter fields
      district: "any",
      tenure: "any",
      topYear: "any",
      mrtDistance: "any",
      schoolDistance: "any",
    });
  };

  const handleParamChange = (field: string, value: string | boolean) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(searchParams).filter(value => 
      value !== "" && value !== false && value !== "any"
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <title>Property Search - PropertyHub Singapore</title>
      <meta name="description" content="Search and filter through premium Singapore properties and overseas investments. Find your perfect home or investment opportunity." />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Search</h1>
          <p className="text-gray-600">Find your perfect property from our curated selection</p>
        </div>

        {/* Main Layout with Left Filter Panel */}
        <div className="flex gap-8">
          {/* Left Filter Panel */}
          <Card className="w-80 h-fit sticky top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Search Filters
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* District Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">District</Label>
                <Select value={searchParams.district} onValueChange={(value) => handleParamChange('district', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any District</SelectItem>
                    <SelectItem value="District 1">District 1</SelectItem>
                    <SelectItem value="District 2">District 2</SelectItem>
                    <SelectItem value="District 3">District 3</SelectItem>
                    <SelectItem value="District 4">District 4</SelectItem>
                    <SelectItem value="District 5">District 5</SelectItem>
                    <SelectItem value="District 6">District 6</SelectItem>
                    <SelectItem value="District 7">District 7</SelectItem>
                    <SelectItem value="District 8">District 8</SelectItem>
                    <SelectItem value="District 9">District 9</SelectItem>
                    <SelectItem value="District 10">District 10</SelectItem>
                    <SelectItem value="District 11">District 11</SelectItem>
                    <SelectItem value="District 12">District 12</SelectItem>
                    <SelectItem value="District 13">District 13</SelectItem>
                    <SelectItem value="District 14">District 14</SelectItem>
                    <SelectItem value="District 15">District 15</SelectItem>
                    <SelectItem value="District 16">District 16</SelectItem>
                    <SelectItem value="District 17">District 17</SelectItem>
                    <SelectItem value="District 18">District 18</SelectItem>
                    <SelectItem value="District 19">District 19</SelectItem>
                    <SelectItem value="District 20">District 20</SelectItem>
                    <SelectItem value="District 21">District 21</SelectItem>
                    <SelectItem value="District 22">District 22</SelectItem>
                    <SelectItem value="District 23">District 23</SelectItem>
                    <SelectItem value="District 24">District 24</SelectItem>
                    <SelectItem value="District 25">District 25</SelectItem>
                    <SelectItem value="District 26">District 26</SelectItem>
                    <SelectItem value="District 27">District 27</SelectItem>
                    <SelectItem value="District 28">District 28</SelectItem>
                    <SelectItem value="Sentosa">Sentosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tenure Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Tenure</Label>
                <Select value={searchParams.tenure} onValueChange={(value) => handleParamChange('tenure', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Tenure</SelectItem>
                    <SelectItem value="Freehold">Freehold</SelectItem>
                    <SelectItem value="99-year leasehold">99-year leasehold</SelectItem>
                    <SelectItem value="999-year leasehold">999-year leasehold</SelectItem>
                    <SelectItem value="103-year leasehold">103-year leasehold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Maximum Price Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Maximum Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    type="number"
                    placeholder="Max price (SGD)"
                    value={searchParams.maxPrice}
                    onChange={(e) => handleParamChange('maxPrice', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* TOP Year Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">TOP Year</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select value={searchParams.topYear} onValueChange={(value) => handleParamChange('topYear', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Any Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Year</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                      <SelectItem value="2030">2030</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* MRT Distance Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">MRT Distance</Label>
                <div className="relative">
                  <Train className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select value={searchParams.mrtDistance} onValueChange={(value) => handleParamChange('mrtDistance', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Any Distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Distance</SelectItem>
                      <SelectItem value="<100m">Less than 100m</SelectItem>
                      <SelectItem value="100-300m">100m - 300m</SelectItem>
                      <SelectItem value="300-600m">300m - 600m</SelectItem>
                      <SelectItem value="600-900m">600m - 900m</SelectItem>
                      <SelectItem value=">900m">More than 900m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Primary School Distance Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Primary School Distance</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select value={searchParams.schoolDistance} onValueChange={(value) => handleParamChange('schoolDistance', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Any Distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Distance</SelectItem>
                      <SelectItem value="<1km">Less than 1km</SelectItem>
                      <SelectItem value="1-2km">1km - 2km</SelectItem>
                      <SelectItem value=">2km">More than 2km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Property Type Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Property Type</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select value={searchParams.propertyType} onValueChange={(value) => handleParamChange('propertyType', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      <SelectItem value="Condominium">Condominium</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Executive Condominium">Executive Condominium</SelectItem>
                      <SelectItem value="Landed Property">Landed Property</SelectItem>
                      <SelectItem value="HDB">HDB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bedrooms Filter */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Bedrooms</Label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select value={searchParams.bedrooms} onValueChange={(value) => handleParamChange('bedrooms', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4 Bedrooms</SelectItem>
                      <SelectItem value="5">5+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} className="w-full btn-primary">
                <Search className="h-4 w-4 mr-2" />
                Search Properties
              </Button>
            </CardContent>
          </Card>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    {properties?.length || 0} properties found
                  </p>
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Property Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 h-64 rounded-t-xl"></div>
                    <div className="bg-white p-6 rounded-b-xl">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="h-8 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search filters to find more properties.</p>
                <Button onClick={handleReset} variant="outline">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}