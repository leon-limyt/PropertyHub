# replit.md

## Overview

This is a full-stack property listing application built with React, Express.js, and PostgreSQL. The app focuses on Singapore property listings, featuring new launch condos, overseas properties, and investment opportunities with market analytics. It uses a modern tech stack with TypeScript, Tailwind CSS, and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: RESTful endpoints with JSON responses
- **Development**: Hot module replacement via Vite integration

### Database Schema
- **Properties**: Main listings with details like price, location, specifications
- **Leads**: Contact form submissions from potential buyers
- **Favorites**: User property bookmarks
- **Market Analytics**: District-level market data and trends

## Key Components

### Frontend Components
- **Navigation**: Responsive navbar with mobile menu support
- **Property Cards**: Reusable listing display components
- **Search/Filter**: Property search with multiple criteria
- **Lead Capture**: Contact forms for buyer inquiries
- **Analytics Dashboard**: Market data visualization

### Backend Services
- **Storage Layer**: PostgreSQL database implementation (DatabaseStorage class)
- **API Routes**: RESTful endpoints for properties, leads, favorites, and analytics
- **Error Handling**: Centralized error middleware
- **Development Tools**: Request logging and Vite integration

### Database Models
- Properties with comprehensive metadata (price, location, specifications)
- Lead management for customer inquiries
- Favorites system for user bookmarks
- Market analytics for trend analysis

## Data Flow

1. **Client Requests**: React components make API calls via TanStack Query
2. **API Layer**: Express routes handle requests and call storage methods
3. **Storage Layer**: PostgreSQL database via Drizzle ORM
4. **Database**: PostgreSQL with full schema and sample data
5. **Response**: JSON data flows back through the API to React components

## External Dependencies

### Frontend Libraries
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React icons
- **Data Fetching**: TanStack Query for API state management
- **Styling**: Tailwind CSS with custom design tokens
- **Carousel**: Embla Carousel for image galleries

### Backend Libraries
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Session**: connect-pg-simple for PostgreSQL sessions
- **Validation**: Zod for schema validation
- **Build**: esbuild for production bundling

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database migrations via Drizzle Kit
- Replit-specific plugins for development environment

### Production
- Vite build process creates optimized static assets
- esbuild bundles the Express server
- PostgreSQL database via environment variable (DATABASE_URL)
- Static file serving for production assets

### Key Configuration
- **TypeScript**: Strict mode with ESNext modules
- **Path Aliases**: Configured for clean imports (@, @shared, @assets)
- **Database**: PostgreSQL connection via environment variable
- **Environment**: Supports both development and production modes

## Notable Architecture Decisions

1. **Monorepo Structure**: Client, server, and shared code in one repository
2. **Storage Abstraction**: IStorage interface allows switching between memory and database storage
3. **Shared Schema**: Common TypeScript types between frontend and backend
4. **Component Library**: shadcn/ui provides consistent design system
5. **Real Estate Focus**: Specialized for Singapore property market with relevant fields and features
6. **Database Integration**: PostgreSQL with Drizzle ORM for secure, scalable data management

## Recent Changes (January 2025)

- **Database Integration**: Replaced in-memory storage with PostgreSQL database
- **Search Functionality**: Fixed search form field mapping and location filtering
- **UI Improvements**: Resolved icon overlapping issues in search components
- **Data Seeding**: Added sample properties and market analytics to database
- **Performance**: Implemented database indexing and query optimization
- **Enhanced Database Schema**: Expanded properties table with 20+ new fields including:
  - Project details (project_id, project_name, developer_name)
  - Technical specifications (tenure, planning_area, site_area_sqm, plot_ratio)
  - Location data (lat/lng coordinates, postal_code, nearby amenities)
  - Development info (launch_date, completion_date, no_of_units, storey_range)
  - Enhanced search capabilities with developer, project type, and status filters
- **Google Maps Integration**: Implemented real Google Maps with API key integration
  - Custom property markers with info windows
  - Secure API key handling through server endpoint
  - Interactive map with zoom and pan capabilities
- **Comparative Analysis Feature**: Added Market Analysis tab with district-based property comparison
  - District-based property comparison instead of 1km radius search
  - Comparative pricing analysis with percentage differences
  - Summary statistics showing market positioning within district
  - Detailed comparison table with current property highlighted
  - Market analysis insights and recommendations for district performance
- **Mortgage Calculator**: Singapore MAS-compliant mortgage calculator
  - Total Debt Servicing Ratio (TDSR) calculation with 55% limit
  - Mortgage Servicing Ratio (MSR) calculation for HDB/EC with 30% limit
  - Loan-to-Value (LTV) limits based on property count and borrower profile
  - Interest rate stress testing at 4% floor rate
  - Variable income haircut (30%) as per MAS guidelines
  - Comprehensive eligibility assessment with warnings
  - Real-time calculation updates and detailed loan breakdown
- **Advanced Filter Panel**: Added comprehensive left sidebar filter panel on Properties page
  - District filter with all 28 Singapore districts plus Sentosa
  - Tenure filter (Freehold, 99-year, 999-year, 103-year leasehold)
  - Maximum price filter with SGD input
  - TOP Year filter (2024-2030)
  - MRT Distance filter (<100m, 100-300m, 300-600m, 600-900m, >900m)
  - Primary School Distance filter (<1km, 1-2km, >2km)
  - Property Type and Bedrooms filters
  - Sticky positioning for easy access while browsing
  - Active filter count badge and one-click reset functionality
- **Real Property Data Scraping System**: Implemented web scraping and data import functionality
  - PropertyDataScraper class for extracting real property data from external sources
  - Successfully imported AmberHouse property data from propertyreviewsg.com
  - Added UpperHouse at Orchard Boulevard data scraper with authentic data only
  - Admin interface at /admin for data validation and import management
  - Universal property source selector supporting multiple developments
  - Automatic data validation with missing field detection and recommendations
  - Imported 7 AmberHouse property variants with authentic pricing and specifications
  - Real estate data includes developer info, tenure, completion dates, and unit specifications
  - Strict data integrity policy: only authentic data from sources, no estimated values
  - Fixed UpperHouse import functionality with proper database queries and error handling
  - Added comprehensive form reset functionality with automatic clearing after successful imports
  - Enhanced admin interface with Project Type and Project Status dropdown menus
  - Implemented auto-generated project IDs with manual override capability
  - Corrected Plot Ratio from 2.5 to 3.5 for UpperHouse based on authentic URL data
  - Added proper project type classification (Residential) and planning area correction (Orchard)
  - Improved data accuracy verification process for all scraped properties
  - Fixed unit variant display logic to show "1 property ready for import" instead of "5 property variants"
  - Ensured single consolidated property entries to prevent duplication from multiple unit variants
  - Implemented proper duplicate import prevention with correct HTTP status codes (200 instead of 500)
  - Added specific error messaging for duplicate imports with proper frontend alert handling
  - Enhanced URL scraping system with comprehensive data extraction for 15+ property fields
  - Added HTML tag cleaning function to prevent HTML content in scraped data fields
  - Removed unwanted Investment tab by reorganizing field categories in admin interface
  - Implemented advanced multi-pattern extraction with 40+ regex patterns for robust data capture
  - Added proper HTTP headers and error handling for reliable web scraping
  - Enhanced field-specific processing for districts, units, addresses, and descriptions
  - Fixed Clear Form functionality to properly reset all form fields without automatic data reloading
  - Added form state management to prevent unwanted automatic data loading after manual form clearing
  - Implemented advanced structured data extraction from HTML tables and definition lists
  - Added comprehensive table-based data extraction for property information websites
  - Enhanced pattern matching to handle specific property data formats like "Est 2027/2028" and "2 to 4-Bedrm"
  - Improved field mapping for developer names, site areas, completion dates, and unit configurations
  - Added PDF document extraction capability with comprehensive property data parsing
  - Implemented PDF upload functionality with 50MB file size limit and proper error handling
  - Enhanced admin interface with dual data source options (URL scraping and PDF processing)
  - Added sophisticated PDF text extraction patterns for property information including pricing, specifications, and location details
  - Enhanced PDF parsing with property factsheet-specific patterns for structured data extraction
  - Fixed title extraction to properly handle "Development Name" prefix removal
  - Improved unit size extraction with comprehensive bedroom table analysis
  - Enhanced district formatting to properly convert "03" to "District 3" format
  - Added bedroom type extraction with cleaner formatting for property display
- **Database Schema Consistency Updates (January 2025)**: Major database field restructuring
  - Removed 'bathrooms' field completely from database schema and UI
  - Renamed 'bedrooms' to 'bedroomType' for better data representation
  - Updated property cards to show "Beds" and "Unit Sizes" instead of "Bathrooms" and "Square Feet"
  - Added "from" prefix to all property prices for consistency
  - Removed Contact button from property cards as requested
  - Updated search forms to remove bathroom filters
  - Consolidated duplicate AmberHouse entries into single development entry
  - Market Analysis now compares different developments within same district
  - Updated data scraper to create consolidated property entries instead of multiple unit variants