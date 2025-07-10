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
- **Comparative Analysis Feature**: Added Investment tab with neighboring properties analysis
  - Haversine distance calculation for 1km radius property search
  - Comparative pricing analysis with percentage differences
  - Summary statistics showing market positioning
  - Detailed comparison table with current property highlighted
  - Market analysis insights and recommendations
- **Mortgage Calculator**: Singapore MAS-compliant mortgage calculator
  - Total Debt Servicing Ratio (TDSR) calculation with 55% limit
  - Mortgage Servicing Ratio (MSR) calculation for HDB/EC with 30% limit
  - Loan-to-Value (LTV) limits based on property count and borrower profile
  - Interest rate stress testing at 4% floor rate
  - Variable income haircut (30%) as per MAS guidelines
  - Comprehensive eligibility assessment with warnings
  - Real-time calculation updates and detailed loan breakdown