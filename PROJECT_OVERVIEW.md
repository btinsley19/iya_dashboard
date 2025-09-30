# IYA Networking Tool - Project Overview

## Vision & Purpose

The IYA Networking Tool is a comprehensive dashboard and networking platform designed exclusively for USC Iovine & Young Academy students. The platform aims to create a living network map of the IYA community, enabling students to discover collaborators, mentors, and opportunities through intelligent connections based on shared classes, skills, projects, and interests. By fostering meaningful relationships and facilitating knowledge sharing, the tool transforms the IYA experience from individual learning to collaborative growth.

## Core Features

### Authentication & User Management
- **Supabase Authentication**: Secure login with email/password
- **User Approval System**: Admin-controlled user registration with pending/active/suspended status
- **Role-based Access**: User and admin roles with appropriate permissions
- **Profile Management**: Comprehensive user profiles with skills, classes, projects, and interests

### Profile System
- **Rich User Profiles**: Bio, graduation year, major, avatar, links (LinkedIn, resume)
- **Skills Management**: Add/remove skills with proficiency levels (1-5 scale)
- **Class Tracking**: Track classes taken, currently taking, or planning to take
- **Project Portfolio**: Showcase personal and collaborative projects
- **Interest Tags**: Categorize interests and areas of expertise
- **File Uploads**: Resume and avatar upload via Supabase Storage

### Content & Collaboration
- **Projects**: Create, manage, and showcase projects with team members
- **Events**: Organize and attend community events with RSVP functionality
- **Notes/Posts**: Share ideas, insights, and knowledge with the community
- **Visibility Controls**: Public, private, or unlisted content options

### Search & Discovery
- **AI-Powered Search**: Semantic search across profiles, projects, classes, and content
- **Skill-based Matching**: Find collaborators based on complementary skills
- **Class-based Connections**: Connect with classmates and course alumni
- **Project Discovery**: Find relevant projects and potential team members

### Admin Dashboard
- **User Management**: Approve, suspend, or manage user accounts
- **Content Moderation**: Review and moderate community content
- **Analytics**: Track platform usage and engagement metrics
- **System Configuration**: Manage skills, classes, and platform settings

## Tech Stack

### Frontend
- **Next.js 15.5.3**: React framework with App Router
- **React 19.1.0**: UI library with latest features
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling with USC theme
- **Headless UI 2.2.7**: Accessible UI components
- **Lucide React 0.544.0**: Icon library

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Supabase Auth**: Authentication and user management
- **Supabase Storage**: File uploads (resumes, avatars)
- **PostgreSQL**: Relational database with RLS policies
- **Row Level Security**: Data access control and privacy

### Development Tools
- **ESLint 9**: Code linting and quality
- **PostCSS**: CSS processing
- **Geist Fonts**: Modern typography (Sans & Mono)

## Design Principles

### USC-Inspired Theme
- **Color Palette**: Cardinal red (#990000) and gold (#FFCC00) as primary colors
- **Typography**: Geist Sans for body text, Geist Mono for code
- **Accessibility**: WCAG compliant with proper contrast ratios
- **Responsive Design**: Mobile-first approach with fluid layouts

### User Experience
- **Clean Interface**: Minimal, focused design that doesn't distract from content
- **Intuitive Navigation**: Clear information architecture and user flows
- **Fast Performance**: Optimized loading and smooth interactions
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

### Content-First Approach
- **Readable Typography**: Optimized for long-form content consumption
- **Visual Hierarchy**: Clear distinction between different content types
- **Consistent Spacing**: Systematic spacing using Tailwind's design tokens

## Current Status

### ✅ Completed
- **Project Setup**: Next.js 15 with TypeScript and Tailwind CSS
- **Database Schema**: Comprehensive PostgreSQL schema with all tables and relationships
- **Authentication System**: Supabase auth integration with user management
- **Basic UI Components**: Navigation, buttons, cards, inputs with USC theme
- **Admin Pages**: Basic admin dashboard and user management pages
- **Profile System**: Fully functional profile management with real database integration
- **Public Profile Pages**: Individual profile viewing with comprehensive information display
- **Student Directory**: AI-powered directory with Instagram-style carousel and recommendations
- **AI Recommendations**: Smart matching algorithm based on skills, cohort, classes, interests
- **Advanced Search & Filtering**: Multi-criteria search and filtering system
- **Skills Integration**: Real database integration with profile_skills table
- **Classes System**: 145 IYA courses with search interface and public display
- **Server Actions**: Complete CRUD operations for profile management
- **File Upload System**: Supabase Storage integration for resumes and avatars
- **Input Validation**: Comprehensive validation system for all user inputs
- **Error Handling**: Robust error handling with graceful fallbacks
- **Demo Mode**: Graceful fallback to demo mode when database isn't configured
- **Navigation Optimization**: Streamlined navigation focusing on core features (Directory, Communities, Profile)

### ✅ Recently Completed
- **IYA Classes System**: 145 IYA courses (IDSN, ACAD) imported and integrated
- **Classes Search Interface**: Real-time search by course code or title
- **Public Profile Classes**: Classes display on public profile pages
- **Database Integration**: Complete data flow from UI to database
- **File Upload System**: Resume and avatar upload functionality
- **Context Documentation**: Clean, organized documentation system
- **Navigation Simplification**: Removed Feed and AI Chat from main navigation (code preserved)
- **Landing Page Update**: Root URL now redirects to Directory as main entry point
- **HEIC Image Support**: Fixed SSR issues with HEIC image conversion using dynamic imports
- **Authentication Fixes**: Resolved hardcoded user ID issues in directory system
- **Font Optimization**: Improved font loading performance with display: swap

### 🚧 In Progress
- **Database Configuration**: Setting up production Supabase instance
- **Storage Buckets**: Configuring Supabase Storage buckets for file uploads

### ❌ Not Started
- **AI Search Implementation**: Semantic search and embedding generation
- **Event Management**: Event creation, RSVP, and management system
- **Project Collaboration**: Team formation and project management features
- **Content Moderation**: Admin tools for content review and management
- **Connection System**: User connection requests and networking features
- **Messaging System**: Direct messaging between users
- **Communities System**: Community creation and management features

### 📦 Preserved for Future Development
- **Feed System**: Academy Feed with events and community posts (code preserved, not in navigation)
- **AI Chat**: AI-powered connector and chat interface (code preserved, not in navigation)

## Planned Milestones

### Phase 1: Core Profile System (✅ COMPLETED)
- **Complete Profile Integration**: Real user data, skills, classes, projects
- **File Uploads**: Resume and avatar upload functionality
- **Basic CRUD Operations**: Add/edit/remove profile elements
- **Data Validation**: Form validation and error handling
- **Demo Mode**: Graceful fallback for development and testing

### Phase 2: Discovery & Search (✅ COMPLETED)
- **AI-Powered Directory**: Instagram-style carousel with smart recommendations
- **Advanced Search**: Multi-criteria search across profiles, skills, classes, interests
- **Filtering System**: Filter by skills, classes, graduation year, cohort, location
- **Public Profile Pages**: Comprehensive individual profile viewing
- **Skills Integration**: Real database integration with proficiency levels
- **Classes Integration**: IYA courses display on public profiles and directory
- **Cohort Display**: Prominent academic information display

### Phase 3: Connection & Communication (🚧 NEXT PRIORITY)
- **Connection System**: User connection requests and networking features
- **Messaging System**: Direct messaging between users
- **Notification System**: Real-time notifications for connections and messages
- **Social Features**: Activity feeds and social interactions

### Phase 4: AI-Powered Features
- **Semantic Search**: Embedding-based search for intelligent discovery
- **Advanced Recommendation Engine**: Enhanced AI matching algorithms
- **Content Analysis**: AI-powered content categorization and tagging
- **Smart Matching**: Algorithm-based skill and interest matching

### Phase 5: Community Features
- **Event System**: Event creation, management, and attendance tracking
- **Discussion Forums**: Topic-based discussions and knowledge sharing
- **Mentorship Program**: Formal mentor-mentee matching and tracking
- **Achievement System**: Badges and recognition for community contributions

## AI Integration Plans

### Semantic Search Architecture
- **Embedding Generation**: Use OpenAI or local models to generate embeddings for all content
- **Vector Storage**: Store embeddings in PostgreSQL with pgvector extension
- **Search Interface**: Natural language queries that return semantically relevant results
- **Content Types**: Search across profiles, projects, classes, events, and notes

### Intelligent Features
- **Collaborator Matching**: AI-powered suggestions for project team members
- **Skill Gap Analysis**: Identify learning opportunities based on career goals
- **Content Recommendations**: Suggest relevant projects, events, and connections
- **Trend Analysis**: Identify emerging skills and interests in the community

### Implementation Strategy
- **Document Processing**: Extract and embed text from all user-generated content
- **Real-time Updates**: Generate embeddings when content is created or updated
- **Hybrid Search**: Combine semantic search with traditional filtering
- **Performance Optimization**: Caching and indexing for fast search results

## Admin Dashboard

### User Management
- **Registration Approval**: Review and approve new user registrations
- **Account Management**: Suspend, activate, or modify user accounts
- **Role Assignment**: Assign admin privileges and manage permissions
- **User Analytics**: Track user activity, engagement, and growth metrics

### Content Moderation
- **Content Review**: Review reported or flagged content
- **Community Guidelines**: Enforce platform rules and standards
- **Bulk Operations**: Mass actions for content management
- **Audit Logs**: Track all admin actions and system changes

### Platform Configuration
- **Skills Management**: Add, edit, or remove available skills
- **Class Database**: Manage USC course catalog and class information
- **System Settings**: Configure platform-wide settings and features
- **Data Export**: Export user data and analytics for reporting

### Analytics & Insights
- **Usage Metrics**: Track page views, user engagement, and feature adoption
- **Growth Analytics**: Monitor user registration and retention rates
- **Content Analytics**: Analyze popular content, skills, and projects
- **Performance Monitoring**: Track system performance and error rates

---

*This document serves as the single source of truth for the IYA Networking Tool project. It should be referenced and updated as the project evolves to maintain accurate context for all development work.*
