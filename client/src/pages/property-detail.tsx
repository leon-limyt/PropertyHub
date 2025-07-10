import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Bed, Bath, Ruler, DollarSign, Heart, Phone, Mail, Share2 } from "lucide-react";
import { Link } from "wouter";
import LeadCapture from "@/components/lead-capture";
import type { Property } from "@shared/schema";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id) : 0;

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
    enabled: !!propertyId,
  });

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Property Image */}
          <div className="relative">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-96 object-cover rounded-xl"
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
          </div>

          {/* Property Details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-6">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{property.location}</span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="text-3xl font-bold text-teal-600">{formatPrice(property.price)}</div>
              <div className="text-lg text-gray-500">From ${parseFloat(property.psf).toFixed(0)} psf</div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg">
                <Bed className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">{property.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedroom{property.bedrooms > 1 ? 's' : ''}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Bath className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">{property.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathroom{property.bathrooms > 1 ? 's' : ''}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Ruler className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">{property.sqft.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Sqft</div>
              </div>
            </div>

            {property.expectedRoi && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600 mr-2">Expected ROI:</span>
                  <span className="text-lg font-semibold text-green-600">{property.expectedRoi}%</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Property Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Property Type:</span>
                  <span className="ml-2 font-medium">{property.propertyType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium capitalize">{property.status}</span>
                </div>
                <div>
                  <span className="text-gray-600">District:</span>
                  <span className="ml-2 font-medium">{property.district}</span>
                </div>
                <div>
                  <span className="text-gray-600">Country:</span>
                  <span className="ml-2 font-medium">{property.country}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Information */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Contact Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">{property.agentName}</h4>
                <p className="text-gray-600 mb-4">Property Consultant</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-teal-600 mr-2" />
                    <span>{property.agentPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-teal-600 mr-2" />
                    <span>{property.agentEmail}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-2">
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
          </CardContent>
        </Card>

        {/* Lead Capture */}
        <LeadCapture 
          propertyId={property.id}
          title="Interested in This Property?"
          description="Get more information and schedule a viewing"
        />
      </div>
    </div>
  );
}
