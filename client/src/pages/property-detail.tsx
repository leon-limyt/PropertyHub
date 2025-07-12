import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, MapPin, Bed, Bath, Ruler, DollarSign, Heart, Phone, Mail, Share2, 
  Building, Calendar, Users, TrendingUp, School, Train, Car, Home, Clock,
  MapPinIcon, Star, Award, CheckCircle, Info, ChevronLeft, ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import LeadCapture from "@/components/lead-capture";
import GoogleMap from "@/components/google-map";
import MortgageCalculator from "@/components/mortgage-calculator";
import type { Property } from "@shared/schema";
import { useState } from "react";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id) : 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
    enabled: !!propertyId,
  });

  const { data: sameDistrictProperties, isLoading: sameDistrictLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", propertyId, "nearby"],
    enabled: !!propertyId,
  });

  // Sample gallery images - in a real app, these would come from the property data
  const galleryImages = [
    property?.imageUrl || "",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1560449752-d9bb65c1d4ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <Link href="/properties">
              <Button>Back to Properties</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (numPrice >= 1000000) {
      return `$${(numPrice / 1000000).toFixed(1)}M`;
    } else if (numPrice >= 1000) {
      return `$${(numPrice / 1000).toFixed(0)}K`;
    } else {
      return `$${numPrice.toFixed(0)}`;
    }
  };

  const getBadgeStyle = (launchType: string) => {
    switch (launchType) {
      case "new-launch":
        return "bg-teal-600 text-white";
      case "top-soon":
        return "bg-emerald-600 text-white";
      case "preview":
        return "bg-amber-600 text-white";
      default:
        return "bg-teal-600 text-white";
    }
  };

  const getBadgeText = (launchType: string) => {
    switch (launchType) {
      case "new-launch":
        return "New Launch";
      case "top-soon":
        return "TOP Soon";
      case "preview":
        return "Preview";
      default:
        return "New Launch";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <title>{property.title} - PropertyHub Singapore</title>
      <meta name="description" content={`${property.title} in ${property.location}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.sqft} sqft. Starting from ${formatPrice(property.price)}.`} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/properties">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Property Image Gallery */}
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Main Image */}
              <div className="relative h-96 rounded-xl overflow-hidden">
                <img
                  src={galleryImages[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                <Badge className={`absolute top-4 left-4 ${getBadgeStyle(property.launchType)}`}>
                  {getBadgeText(property.launchType)}
                </Badge>
                <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900">
                  {property.district}
                </Badge>
                {property.isOverseas && (
                  <Badge className="absolute bottom-4 left-4 bg-blue-600 text-white">
                    {property.country}
                  </Badge>
                )}
                
                {/* Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              {galleryImages.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? 'border-teal-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Property Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{property.location}</span>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-teal-600 mb-1">{formatPrice(property.price)}</div>
              <div className="text-sm text-gray-500">From ${parseFloat(property.psf).toFixed(0)} psf</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Bed className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                <div className="text-lg font-semibold">{property.bedroomType}</div>
                <div className="text-xs text-gray-600">Beds</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Ruler className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                <div className="text-lg font-semibold">{property.sqft.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Unit Sizes</div>
              </div>
            </div>

            {property.expectedRoi && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600 mr-2">Expected ROI:</span>
                  <span className="text-lg font-semibold text-green-600">{property.expectedRoi}%</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button className="w-full btn-primary">
                <Phone className="h-4 w-4 mr-2" />
                Call Agent
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Request Info
              </Button>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="bg-white rounded-xl shadow-sm">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-7 rounded-t-xl bg-gray-50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="investment">Market Analysis</TabsTrigger>
              <TabsTrigger value="mortgage">Mortgage</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Property Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {property.description || property.projectDescription}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span>Premium location in {property.district}</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span>{property.propertyType} development</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span>{property.bedrooms} bedroom layout</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span>{property.sqft.toLocaleString()} sqft living space</span>
                      </div>
                      {property.tenure && (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                          <span>{property.tenure} tenure</span>
                        </div>
                      )}
                      {property.expectedRoi && (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                          <span>{property.expectedRoi}% expected ROI</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Property Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property Type:</span>
                        <span className="font-medium">{property.propertyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium capitalize">{property.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">District:</span>
                        <span className="font-medium">{property.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{property.country}</span>
                      </div>
                      {property.projectName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Project Name:</span>
                          <span className="font-medium">{property.projectName}</span>
                        </div>
                      )}
                      {property.developerName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Developer:</span>
                          <span className="font-medium">{property.developerName}</span>
                        </div>
                      )}
                      {property.tenure && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tenure:</span>
                          <span className="font-medium">{property.tenure}</span>
                        </div>
                      )}
                      {property.noOfUnits && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Units:</span>
                          <span className="font-medium">{property.noOfUnits}</span>
                        </div>
                      )}
                      {property.storeyRange && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storey Range:</span>
                          <span className="font-medium">{property.storeyRange}</span>
                        </div>
                      )}
                      {property.launchDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Launch Date:</span>
                          <span className="font-medium">{new Date(property.launchDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {property.completionDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completion Date:</span>
                          <span className="font-medium">{new Date(property.completionDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Unit Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <Bed className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{property.bedrooms}</div>
                        <div className="text-sm text-gray-600">Bedrooms</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <Bath className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{property.bathrooms}</div>
                        <div className="text-sm text-gray-600">Bathrooms</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <Ruler className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{property.sqft.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Sqft</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="amenities">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Nearby Schools</h3>
                    {property.primarySchoolsWithin1km && property.primarySchoolsWithin1km.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.primarySchoolsWithin1km.map((school, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <School className="h-5 w-5 text-teal-600 mr-3" />
                            <span>{school}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">School information not available</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Transportation</h3>
                    {property.mrtNearby && property.mrtNearby.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.mrtNearby.map((mrt, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Train className="h-5 w-5 text-teal-600 mr-3" />
                            <span>{mrt}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">MRT information not available</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Development Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Home className="h-5 w-5 text-teal-600 mr-3" />
                        <span>Clubhouse</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 text-teal-600 mr-3" />
                        <span>Swimming Pool</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Car className="h-5 w-5 text-teal-600 mr-3" />
                        <span>Parking</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Building className="h-5 w-5 text-teal-600 mr-3" />
                        <span>Gym & Fitness</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Location Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MapPinIcon className="h-5 w-5 text-teal-600 mr-2" />
                        <span className="font-medium">{property.location}</span>
                      </div>
                      {property.postalCode && (
                        <div className="text-sm text-gray-600">
                          Postal Code: {property.postalCode}
                        </div>
                      )}
                      {property.planningArea && (
                        <div className="text-sm text-gray-600">
                          Planning Area: {property.planningArea}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Map Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Map Location</h3>
                    <div className="h-80 rounded-lg overflow-hidden">
                      {property.lat && property.lng ? (
                        <GoogleMap
                          lat={parseFloat(property.lat)}
                          lng={parseFloat(property.lng)}
                          title={property.title}
                          address={property.location}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <MapPinIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>Map coordinates not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Nearby Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <School className="h-4 w-4 mr-2" />
                          Schools
                        </h4>
                        {property.primarySchoolsWithin1km && property.primarySchoolsWithin1km.length > 0 ? (
                          <ul className="text-sm text-gray-600 space-y-1">
                            {property.primarySchoolsWithin1km.slice(0, 3).map((school, index) => (
                              <li key={index}>• {school}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No nearby schools listed</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Train className="h-4 w-4 mr-2" />
                          MRT Stations
                        </h4>
                        {property.mrtNearby && property.mrtNearby.length > 0 ? (
                          <ul className="text-sm text-gray-600 space-y-1">
                            {property.mrtNearby.slice(0, 3).map((mrt, index) => (
                              <li key={index}>• {mrt}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No nearby MRT stations listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="investment">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Comparative Market Analysis - Same District Properties</h3>
                    <p className="text-gray-600 mb-6">
                      Compare this property with similar properties in the same district ({property.district}) to understand its market position.
                    </p>
                    {sameDistrictLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading district properties...</p>
                      </div>
                    ) : sameDistrictProperties && sameDistrictProperties.length > 0 ? (
                      <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="font-medium">Avg. Price PSF</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${Math.round(sameDistrictProperties.reduce((sum, p) => sum + parseFloat(p.psf), 0) / sameDistrictProperties.length)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Your property: ${parseFloat(property.psf).toFixed(0)}
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                              <span className="font-medium">Price Comparison</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {parseFloat(property.psf) > (sameDistrictProperties.reduce((sum, p) => sum + parseFloat(p.psf), 0) / sameDistrictProperties.length) ? '↑' : '↓'}
                              {Math.abs(parseFloat(property.psf) - (sameDistrictProperties.reduce((sum, p) => sum + parseFloat(p.psf), 0) / sameDistrictProperties.length)).toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-600">
                              vs district avg
                            </div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Building className="h-5 w-5 text-purple-600 mr-2" />
                              <span className="font-medium">Properties Found</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {sameDistrictProperties.length}
                            </div>
                            <div className="text-sm text-gray-600">
                              comparable properties
                            </div>
                          </div>
                        </div>

                        {/* Detailed Comparison Table */}
                        <div className="bg-white rounded-lg border overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PSF</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bedroom Type</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {/* Current Property Row */}
                                <tr className="bg-teal-50 border-l-4 border-teal-500">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      <div className="font-medium text-gray-900">{property.title}</div>
                                      <Badge className="ml-2 bg-teal-100 text-teal-800">Current</Badge>
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">{property.location}</div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatPrice(property.price)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    ${parseFloat(property.psf).toFixed(0)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {property.sqft.toLocaleString()} sqft
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {property.bedroomType}
                                  </td>
                                </tr>
                                {/* Nearby Properties */}
                                {sameDistrictProperties.slice(0, 5).map((nearbyProperty, index) => (
                                  <tr key={nearbyProperty.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      <div className="font-medium text-gray-900">{nearbyProperty.title}</div>
                                      <div className="text-sm text-gray-500 truncate">{nearbyProperty.location}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {formatPrice(nearbyProperty.price)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="flex items-center">
                                        <span className="text-gray-900">${parseFloat(nearbyProperty.psf).toFixed(0)}</span>
                                        {parseFloat(nearbyProperty.psf) > parseFloat(property.psf) ? (
                                          <span className="ml-2 text-red-600 text-xs">↑{((parseFloat(nearbyProperty.psf) - parseFloat(property.psf)) / parseFloat(property.psf) * 100).toFixed(1)}%</span>
                                        ) : (
                                          <span className="ml-2 text-green-600 text-xs">↓{((parseFloat(property.psf) - parseFloat(nearbyProperty.psf)) / parseFloat(property.psf) * 100).toFixed(1)}%</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {nearbyProperty.sqft.toLocaleString()} sqft
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {nearbyProperty.bedroomType}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Market Analysis */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Market Analysis Summary</h4>
                          <div className="text-sm text-gray-600">
                            <p>
                              Your property is priced at ${parseFloat(property.psf).toFixed(0)} per sqft, which is{' '}
                              {parseFloat(property.psf) > (sameDistrictProperties.reduce((sum, p) => sum + parseFloat(p.psf), 0) / sameDistrictProperties.length) ? 
                                'above' : 'below'} the district average of ${Math.round(sameDistrictProperties.reduce((sum, p) => sum + parseFloat(p.psf), 0) / sameDistrictProperties.length)} per sqft.
                            </p>
                            <p className="mt-2">
                              Based on {sameDistrictProperties.length} comparable properties in {property.district}, your property offers {parseFloat(property.psf) > (sameDistrictProperties.reduce((sum, p) => sum + parseFloat(p.psf), 0) / sameDistrictProperties.length) ? 'premium' : 'competitive'} pricing in this prime district.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No comparable properties found in the same district</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mortgage">
                <MortgageCalculator propertyPrice={parseFloat(property.price)} />
              </TabsContent>

              <TabsContent value="contact">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Property Consultant</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                          {property.agentName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold">{property.agentName}</h4>
                          <p className="text-gray-600">Senior Property Consultant</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">4.9/5 Rating</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-teal-600 mr-3" />
                          <span>{property.agentPhone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-teal-600 mr-3" />
                          <span>{property.agentEmail}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button className="w-full btn-primary">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Agent
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Agent
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Developer Contact</h3>
                    {property.developerSalesTeamContact ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(property.developerSalesTeamContact, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-gray-500">Developer contact information not available</p>
                    )}
                  </div>

                  <Separator />

                  <LeadCapture 
                    propertyId={property.id}
                    title="Request More Information"
                    description="Get detailed property information and schedule a viewing"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
