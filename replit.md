# YouTube Content Creation App

## Overview

This is a full-stack YouTube content creation application that uses AI to help creators generate complete video packages. The app provides two main workflows: AI-powered content generation from topics and custom script upload for content enhancement. It generates comprehensive video packages including scripts, SEO optimization, thumbnail concepts, and production assets.

The application is built as a monorepo with a React frontend, Express backend, and PostgreSQL database, designed to streamline the YouTube content creation process through intelligent automation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: Express sessions with PostgreSQL store (fallback to memory store)
- **API Design**: RESTful endpoints with comprehensive error handling
- **Password Security**: Node.js crypto module with scrypt hashing

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Users and projects tables with JSON fields for generated content
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling

### AI Integration
- **Provider**: OpenAI GPT models for content generation
- **Content Types**: Script generation, SEO packages, thumbnail concepts, production assets
- **Processing**: Structured content generation with human-like writing optimization
- **Quality Control**: Built-in filters to avoid AI-typical phrases and maintain natural tone

### Authentication & Authorization
- **Strategy**: Session-based authentication with secure password hashing
- **Security**: CSRF protection, secure session cookies, password complexity requirements
- **Route Protection**: Server-side authentication middleware and client-side route guards

### Development Environment
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Development**: Hot module replacement, runtime error overlay
- **Code Quality**: TypeScript strict mode, path aliases for clean imports
- **Deployment**: Production builds with optimized static assets

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI API for content generation (GPT models)
- **Session Store**: PostgreSQL-backed sessions with memory fallback

### UI and Styling
- **Component Library**: Radix UI primitives for accessibility
- **Design System**: shadcn/ui components with Tailwind CSS
- **Icons**: Lucide React icon library
- **Fonts**: Google Fonts integration (multiple font families)

### Development Tools
- **Replit Integration**: Vite plugins for cartographer and dev banner
- **Error Handling**: Runtime error modal for development
- **Build Tools**: PostCSS with Autoprefixer for CSS processing

### Authentication & Security
- **Password Hashing**: Node.js crypto with scrypt algorithm
- **Session Management**: Express sessions with PostgreSQL persistence
- **Form Validation**: Zod schema validation with React Hook Form

The application architecture emphasizes type safety, developer experience, and scalable AI-powered content generation while maintaining clean separation of concerns between frontend, backend, and data layers.