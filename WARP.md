# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Crime Lens Chennai is a full-stack React application for crime analytics and dashboard visualization focused on Chennai districts. It provides real-time crime statistics, AI-driven insights, and interactive data visualization.

## Development Commands

### Development Server
```bash
npm run dev
```
Starts development server on http://127.0.0.1:5003 with hot reload enabled.

### Build & Production
```bash
# Full production build (both client and server)
npm run build

# Start production server
npm start

# Type checking only (no build)
npm run check
```

### Database Operations
```bash
# Push schema changes to database
npm run db:push
```

### Testing Individual Components
The project uses React with TypeScript. To test individual components during development:
- Use browser dev tools to inspect component state
- Components have data-testid attributes for testing (e.g., `data-testid="button-refresh"`)
- Mock data is available in `client/src/lib/mock-data.ts` and server storage

## Architecture Overview

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/       # Page components (dashboard, etc.)
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utilities and API client
├── server/          # Express.js backend
│   ├── index.ts     # Main server entry point
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Data layer (currently in-memory)
│   └── vite.ts      # Development server setup
├── shared/          # Shared types and schemas
│   └── schema.ts    # Database schema and TypeScript types
└── migrations/      # Database migration files (Drizzle)
```

### Data Architecture
- **Database**: PostgreSQL with Drizzle ORM
- **Current Storage**: In-memory storage (`MemStorage` class) with mock Chennai crime data
- **Schema Location**: `shared/schema.ts` defines all database tables and types
- **Key Entities**: 
  - Crime incidents by district and category
  - Crime categories (theft, burglary, robbery, violence, drugs)
  - Chennai districts with population data
  - AI insights and crime alerts

### API Architecture
- **Server**: Express.js with TypeScript on port 5003
- **Client**: React with Vite build system
- **API Routes**: RESTful endpoints under `/api/`
  - `/api/dashboard` - Main dashboard data
  - `/api/crime-stats` - Crime statistics
  - `/api/crime-incidents` - Filtered incidents
  - `/api/alerts` - Crime alerts
  - `/api/insights` - AI insights

### Frontend Architecture
- **Router**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **UI Library**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom theme
- **Charts**: Recharts for data visualization

## Key Development Patterns

### Adding New Crime Categories
1. Update `initializeData()` in `server/storage.ts`
2. Add corresponding UI handling in dashboard components
3. Update TypeScript types if needed

### Adding New API Endpoints
1. Add route handler in `server/routes.ts`
2. Add corresponding method to `IStorage` interface
3. Implement method in `MemStorage` class
4. Add client-side query using TanStack Query

### Database Schema Changes
1. Modify `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update storage implementation
4. Update TypeScript types

### Component Development
- All components should use TypeScript
- Use data-testid attributes for testing
- Follow existing naming patterns (kebab-case for files, PascalCase for components)
- Leverage existing UI components from `@/components/ui/`

## Environment Configuration
- **DATABASE_URL**: Required PostgreSQL connection string
- **NODE_ENV**: Set by cross-env package for cross-platform compatibility
- **PORT**: Server runs on port 5003 by default

## Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## Development Notes
- The application currently uses mock data through `MemStorage`
- Chennai-specific districts and crime patterns are pre-populated
- Real-time features are simulated with mock data
- The dashboard is optimized for law enforcement analytics workflows
- All timestamps and data are localized for Chennai timezone context

## Production Deployment
- Build creates optimized client bundle in `dist/public/`
- Server bundle is created in `dist/index.js`
- Both client and server are built together with `npm run build`
- Static files served from `dist/public/` in production mode
