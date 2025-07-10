import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Ruler, Heart, Eye, Phone } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  userId?: string;
  isFavorited?: boolean;
}

export default function PropertyCard({ property, userId = "guest", isFavorited = false }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(isFavorited);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/favorites", {
        userId,
        propertyId: property.id,
      });
    },
    onSuccess: () => {
      setIsLiked(true);
      toast({
        title: "Success",
        description: "Property added to favorites",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/favorites/${userId}/${property.id}`);
    },
    onSuccess: () => {
      setIsLiked(false);
      toast({
        title: "Success",
        description: "Property removed from favorites",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    if (isLiked) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const getBadgeStyle = (launchType: string) => {
    switch (launchType) {
      case "new-launch":
        return "property-badge-new";
      case "top-soon":
        return "property-badge-top";
      case "preview":
        return "property-badge-preview";
      default:
        return "property-badge-new";
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

  return (
    <Card className="property-card">
      <div className="property-card-image">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <Badge className={`property-badge ${getBadgeStyle(property.launchType)}`}>
          {getBadgeText(property.launchType)}
        </Badge>
        <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900">
          {property.district}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-full hover:bg-white transition-colors"
          onClick={handleFavoriteClick}
          disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-4">{property.location}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-teal-600">{formatPrice(property.price)}</div>
          <div className="text-sm text-gray-500">From ${parseFloat(property.psf).toFixed(0)} psf</div>
        </div>
        
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Ruler className="h-4 w-4 mr-1" />
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
        
        {property.expectedRoi && (
          <div className="mb-4 text-sm text-gray-600">
            Expected ROI: <span className="font-semibold text-green-600">{property.expectedRoi}%</span>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Link href={`/property/${property.id}`} className="flex-1">
            <Button className="w-full btn-primary">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          <Button variant="outline" className="btn-secondary">
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
