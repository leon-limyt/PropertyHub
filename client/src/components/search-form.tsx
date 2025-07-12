import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Building, Bed, Ruler, DollarSign, Search } from "lucide-react";
import { useLocation } from "wouter";

interface SearchFormProps {
  onSearch?: (params: any) => void;
  className?: string;
}

export default function SearchForm({ onSearch, className = "" }: SearchFormProps) {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    location: "any",
    propertyType: "any",
    bedrooms: "any",
    priceRange: "any",
    sqftRange: "any",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams = new URLSearchParams();
    
    // Transform form data to match backend expectations
    const transformedData: any = {};
    
    if (formData.location && formData.location !== "any") {
      transformedData.location = formData.location;
      searchParams.append("location", formData.location);
    }
    
    if (formData.propertyType && formData.propertyType !== "any") {
      transformedData.propertyType = formData.propertyType;
      searchParams.append("propertyType", formData.propertyType);
    }
    
    if (formData.bedrooms && formData.bedrooms !== "any") {
      transformedData.bedrooms = formData.bedrooms;
      searchParams.append("bedrooms", formData.bedrooms);
    }
    
    // Transform price range into min/max price
    if (formData.priceRange && formData.priceRange !== "any") {
      const priceRange = formData.priceRange;
      if (priceRange === "500000-800000") {
        transformedData.minPrice = 500000;
        transformedData.maxPrice = 800000;
      } else if (priceRange === "800000-1200000") {
        transformedData.minPrice = 800000;
        transformedData.maxPrice = 1200000;
      } else if (priceRange === "1200000-2000000") {
        transformedData.minPrice = 1200000;
        transformedData.maxPrice = 2000000;
      } else if (priceRange === "2000000+") {
        transformedData.minPrice = 2000000;
      }
      searchParams.append("priceRange", priceRange);
    }
    
    // Transform sqft range into min/max sqft
    if (formData.sqftRange && formData.sqftRange !== "any") {
      const sqftRange = formData.sqftRange;
      if (sqftRange === "400-600") {
        transformedData.minSqft = 400;
        transformedData.maxSqft = 600;
      } else if (sqftRange === "600-800") {
        transformedData.minSqft = 600;
        transformedData.maxSqft = 800;
      } else if (sqftRange === "800-1000") {
        transformedData.minSqft = 800;
        transformedData.maxSqft = 1000;
      } else if (sqftRange === "1000+") {
        transformedData.minSqft = 1000;
      }
      searchParams.append("sqftRange", sqftRange);
    }
    
    if (onSearch) {
      onSearch(transformedData);
    } else {
      setLocation(`/properties?${searchParams.toString()}`);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`search-form ${className}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Find Your Dream Property</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
            <Select value={formData.location} onValueChange={(value) => handleChange('location', value)}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Location</SelectItem>
                <SelectItem value="District 1">District 1 - Boat Quay/Raffles Place</SelectItem>
                <SelectItem value="District 9">District 9 - Orchard Road</SelectItem>
                <SelectItem value="District 10">District 10 - Tanglin/Holland</SelectItem>
                <SelectItem value="District 11">District 11 - Novena/Thomson</SelectItem>
                <SelectItem value="Sentosa">Sentosa</SelectItem>
                <SelectItem value="Malaysia">Malaysia</SelectItem>
                <SelectItem value="Thailand">Thailand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
            <Select value={formData.propertyType} onValueChange={(value) => handleChange('propertyType', value)}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Select property type" />
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </Label>
            <div className="relative">
              <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
              <Select value={formData.bedrooms} onValueChange={(value) => handleChange('bedrooms', value)}>
                <SelectTrigger className="search-input">
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
            <Label htmlFor="sqftRange" className="block text-sm font-medium text-gray-700 mb-2">
              Size (sqft)
            </Label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
              <Select value={formData.sqftRange} onValueChange={(value) => handleChange('sqftRange', value)}>
                <SelectTrigger className="search-input">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="400-600">400-600</SelectItem>
                  <SelectItem value="600-800">600-800</SelectItem>
                  <SelectItem value="800-1000">800-1000</SelectItem>
                  <SelectItem value="1000+">1000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-2">
            Price Range (SGD)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
            <Select value={formData.priceRange} onValueChange={(value) => handleChange('priceRange', value)}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Any Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Budget</SelectItem>
                <SelectItem value="500000-800000">$500K - $800K</SelectItem>
                <SelectItem value="800000-1200000">$800K - $1.2M</SelectItem>
                <SelectItem value="1200000-2000000">$1.2M - $2M</SelectItem>
                <SelectItem value="2000000+">$2M+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full btn-primary">
          <Search className="h-4 w-4 mr-2" />
          Search Properties
        </Button>
      </form>
    </div>
  );
}
