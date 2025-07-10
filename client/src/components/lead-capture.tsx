import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertLead } from "@shared/schema";

interface LeadCaptureProps {
  propertyId?: number;
  title?: string;
  description?: string;
  className?: string;
}

export default function LeadCapture({ 
  propertyId, 
  title = "Get Personalized Property Recommendations",
  description = "Join thousands of satisfied investors who trust our expertise",
  className = ""
}: LeadCaptureProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    budgetRange: "",
    preferences: "",
  });
  const { toast } = useToast();

  const submitLeadMutation = useMutation({
    mutationFn: async (leadData: InsertLead) => {
      return await apiRequest("POST", "/api/leads", leadData);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your inquiry has been submitted. Our expert agents will contact you within 24 hours.",
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        budgetRange: "",
        preferences: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitLeadMutation.mutate({
      ...formData,
      propertyId: propertyId || null,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className={`py-16 gradient-hero ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          {propertyId ? "Interested in This Property?" : "Ready to Find Your Dream Property?"}
        </h2>
        <p className="text-xl text-teal-100 mb-8">{description}</p>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="budgetRange">Budget Range</Label>
                  <Select value={formData.budgetRange} onValueChange={(value) => handleChange("budgetRange", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500000-1000000">$500K - $1M</SelectItem>
                      <SelectItem value="1000000-2000000">$1M - $2M</SelectItem>
                      <SelectItem value="2000000-5000000">$2M - $5M</SelectItem>
                      <SelectItem value="5000000+">$5M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="preferences">Property Preferences</Label>
                <Textarea
                  id="preferences"
                  placeholder="Tell us about your property preferences..."
                  rows={4}
                  value={formData.preferences}
                  onChange={(e) => handleChange("preferences", e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={submitLeadMutation.isPending}
              >
                {submitLeadMutation.isPending ? "Submitting..." : "Get Free Consultation"}
              </Button>
            </form>
            <p className="text-sm text-gray-600 mt-4">
              Our expert agents will contact you within 24 hours
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
