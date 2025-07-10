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
import { Search, Filter, MapPin, Building, DollarSign, Bed, Bath, Ruler } from "lucide-react";
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
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newParams = { ...searchParams };
    
    urlParams.forEach((value, key) => {
      if (key in newParams) {
        if (key === 'isOverseas') {
          newParams[key] = value === 'true';
        } else {
          newParams[key] = value;
        }
      }
    });
    
    setSearchParams(newParams);
  }, [location]);

  const { data: properties, isLoading, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties/search", searchParams],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/properties/search", {
        location: searchParams.location === "any" ? undefined : searchParams.location || undefined,
        propertyType: searchParams.propertyType === "any" ? undefined : searchParams.propertyType || undefined,
        bedrooms: searchParams.bedrooms === "any" ? undefined : searchParams.bedrooms ? parseInt(searchParams.bedrooms) : undefined,
        bathrooms: searchParams.bathrooms === "any" ? undefined : searchParams.bathrooms ? parseInt(searchParams.bathrooms) : undefined,
        minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
        maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
        minSqft: searchParams.minSqft ? parseInt(searchParams.minSqft) : undefined,
        maxSqft: searchParams.maxSqft ? parseInt(searchParams.maxSqft) : undefined,
        isOverseas: searchParams.isOverseas,
        launchType: searchParams.launchType === "any" ? undefined : searchParams.launchType || undefined,
      });
      return response.json();
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

        {/* Search and Filter Bar */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search Properties
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={searchParams.location} onValueChange={(value) => handleParamChange('location', value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Location</SelectItem>
                        <SelectItem value="District 1">District 1</SelectItem>
                        <SelectItem value="District 9">District 9</SelectItem>
                        <SelectItem value="District 10">District 10</SelectItem>
                        <SelectItem value="Sentosa">Sentosa</SelectItem>
                        <SelectItem value="Malaysia">Malaysia</SelectItem>
                        <SelectItem value="Thailand">Thailand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="propertyType" className="text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={searchParams.propertyType} onValueChange={(value) => handleParamChange('propertyType', value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Type</SelectItem>
                        <SelectItem value="New Launch Condo">New Launch Condo</SelectItem>
                        <SelectItem value="Resale Condo">Resale Condo</SelectItem>
                        <SelectItem value="Executive Condo">Executive Condo</SelectItem>
                        <SelectItem value="Landed Property">Landed Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="launchType" className="text-sm font-medium text-gray-700 mb-2">
                    Launch Type
                  </Label>
                  <Select value={searchParams.launchType} onValueChange={(value) => handleParamChange('launchType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any launch type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Launch Type</SelectItem>
                      <SelectItem value="new-launch">New Launch</SelectItem>
                      <SelectItem value="top-soon">TOP Soon</SelectItem>
                      <SelectItem value="preview">Preview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </Label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={searchParams.bedrooms} onValueChange={(value) => handleParamChange('bedrooms', value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </Label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={searchParams.bathrooms} onValueChange={(value) => handleParamChange('bathrooms', value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="isOverseas" className="text-sm font-medium text-gray-700 mb-2">
                    Market
                  </Label>
                  <Select value={searchParams.isOverseas ? "true" : "false"} onValueChange={(value) => handleParamChange('isOverseas', value === "true")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Singapore</SelectItem>
                      <SelectItem value="true">Overseas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minPrice" className="text-sm font-medium text-gray-700 mb-2">
                    Min Price (SGD)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={searchParams.minPrice}
                      onChange={(e) => handleParamChange('minPrice', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxPrice" className="text-sm font-medium text-gray-700 mb-2">
                    Max Price (SGD)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={searchParams.maxPrice}
                      onChange={(e) => handleParamChange('maxPrice', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="minSqft" className="text-sm font-medium text-gray-700 mb-2">
                    Min Size (sqft)
                  </Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      type="number"
                      placeholder="Min sqft"
                      value={searchParams.minSqft}
                      onChange={(e) => handleParamChange('minSqft', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleSearch} className="btn-primary">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Results */}
        <div className="mb-6">
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <p className="text-gray-600">
              {properties?.length || 0} properties found
            </p>
          )}
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No properties found</div>
            <p className="text-gray-600 mb-6">Try adjusting your search filters</p>
            <Button onClick={handleReset} variant="outline">
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
