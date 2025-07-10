import { CheckCircle } from "lucide-react";
import SearchForm from "./search-form";

export default function HeroSection() {
  return (
    <section className="relative gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" 
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
           }}>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Discover Your Perfect<br />
              <span className="text-teal-100">Singapore Property</span>
            </h1>
            <p className="text-xl text-teal-100 mb-8 max-w-lg">
              Explore new launch condos and investment opportunities in Singapore and overseas. 
              Get expert insights and data-driven analytics.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-teal-200 mr-2" />
                <span>Curated Listings</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-teal-200 mr-2" />
                <span>Smart Analytics</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-teal-200 mr-2" />
                <span>Expert Agents</span>
              </div>
            </div>
          </div>

          <SearchForm />
        </div>
      </div>
    </section>
  );
}
