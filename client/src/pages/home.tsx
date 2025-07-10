import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, Globe, BarChart3 } from "lucide-react";
import HeroSection from "@/components/hero-section";
import PropertyCard from "@/components/property-card";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import LeadCapture from "@/components/lead-capture";
import type { Property } from "@shared/schema";

export default function Home() {
  const { data: featuredProperties, isLoading: featuredLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  const { data: overseasProperties, isLoading: overseasLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/overseas"],
  });

  return (
    <div className="min-h-screen">
      <title>PropertyHub Singapore - New Launch Condos & Investment Properties</title>
      <meta name="description" content="Discover new launch condos and investment opportunities in Singapore and overseas. Expert insights, data-driven analytics, and curated property listings." />
      
      <HeroSection />

      {/* Featured Properties Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured New Launch Properties</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the latest premium developments in Singapore's most sought-after locations
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/properties">
              <Button className="btn-primary">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />

      {/* Overseas Properties Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Overseas Investment Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diversify your portfolio with premium properties in key markets
            </p>
          </div>

          {overseasLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {overseasProperties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose PropertyHub?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your trusted partner in Singapore property investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-teal-600 mb-4" />
                <CardTitle>Data-Driven Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access real-time market analytics, price trends, and investment insights to make informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-12 w-12 text-teal-600 mb-4" />
                <CardTitle>Global Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Explore investment opportunities in Singapore and overseas markets including Malaysia, Thailand, and UK.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-teal-600 mb-4" />
                <CardTitle>Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with experienced property consultants who understand the local market and investment strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <LeadCapture />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-teal-600 rounded mr-2"></div>
                <span className="text-xl font-bold">PropertyHub</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner in Singapore property investment and overseas opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Properties</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/properties?type=new-launch" className="hover:text-white transition-colors">New Launch</Link></li>
                <li><Link href="/properties?type=resale" className="hover:text-white transition-colors">Resale</Link></li>
                <li><Link href="/properties?overseas=true" className="hover:text-white transition-colors">Overseas</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Property Valuation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investment Advice</a></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Market Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>+65 6123 4567</p>
                <p>info@propertyhub.sg</p>
                <p>1 Raffles Place, Singapore</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PropertyHub Singapore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
