# Context Documents Summary

## Overview
Three concise context documents provide complete system understanding for future development.

## Context Documents

### 1. **Profile_Context.md**
- **Purpose**: Profile system overview and implementation details
- **Covers**: Authentication, user data, CRUD operations, classes system
- **Key Features**: Skills, classes, projects, file uploads, organizations
- **Status**: ✅ All major features completed

### 2. **Directory_Context.md** 
- **Purpose**: Directory and public profile system
- **Covers**: Instagram-style carousel, AI recommendations, search, filtering
- **Key Features**: Profile discovery, public profiles, match scoring, classes display
- **Status**: ✅ Fully functional with classes integration
- **Note**: Now serves as the main landing page (root redirect)

### 3. **Database_Context.md**
- **Purpose**: Database schema and data management
- **Covers**: PostgreSQL schema, relationships, migrations, data import
- **Key Features**: 145 IYA classes, RLS policies, file storage, updated class roles
- **Status**: ✅ Complete schema with all relationships

## Quick Reference

### For Profile Development
- Read `Profile_Context.md` for profile system details
- Key files: `src/app/profile/page.tsx`, `src/lib/actions/profile-actions.ts`
- Recent: Classes search interface, IYA course integration

### For Directory Development  
- Read `Directory_Context.md` for directory system details
- Key files: `src/app/directory/page.tsx`, `src/app/profile/[id]/page.tsx`
- Recent: Classes display on public profiles

### For Database Work
- Read `Database_Context.md` for schema and data management
- Key files: `supabase/migrations/`, `scripts/import-iya-classes.js`
- Recent: Classes import, instructor support, data flow architecture

## Data Flow Architecture

### Personal Profile → Database → Public Profile
1. **Personal Profile**: `getUserProfile()` fetches data from database tables
2. **Database Updates**: All changes use proper functions (updateProject, updateOrganization, updateTool)
3. **Public Profile**: `getProfileById()` fetches same data with transformation for display
4. **Real-time Sync**: Changes immediately reflect between profiles

### Database Storage
- **Skills**: `profile_skills` table with proficiency levels
- **Classes**: `profile_classes` table with roles (ta/mentor)
- **Projects**: `projects` table with full details
- **Organizations**: `profiles.links.organizations` JSONB
- **Tools**: `profiles.links.favoriteTools` JSONB
- **Hobbies/Sports**: `profiles.links.hobbiesAndSports` JSONB
- **Interests**: `profile_tags` junction table

## Development Notes
- All systems are fully functional and integrated
- Classes system recently completed with 145 IYA courses
- Public profiles display classes with proper styling
- Database has proper relationships and RLS policies
- Demo mode available for development without database setup
- **Navigation**: Feed and AI Chat removed from main navigation (code preserved)
- **Landing Page**: Root URL now redirects to Directory page
- **Recent Updates**: Profile picture cropping, class role system, faculty/staff support
- **UI Improvements**: Cleaner interfaces, better user experience
- **Profile Enhancements**: 
  - Skills: Light red pills for better visibility
  - Organizations: USC yellow tags, individual editing, simplified roles
  - Projects: Individual editing with modal forms
  - Tools: Description and multiple categories support with individual editing
  - Want to Learn: Light orange pill format
  - Hobbies and Sports: Light yellow pill format
- **Edit UI**: Consistent button-first approach with "Add" buttons next to "Done"
- **Database**: All profile data properly saved with updated structures
- **Data Consistency**: Fixed data flow between personal and public profiles
- **Database Functions**: All updates use proper database functions (updateProject, updateOrganization, updateTool)
- **Real-time Sync**: Changes in personal profile immediately reflect in public profile
- **Recent Fixes**: 
  - HEIC image conversion fixed with dynamic imports (no more SSR errors)
  - Hardcoded user ID issues resolved in directory system
  - Font loading optimized with display: swap
  - Authentication properly integrated in directory recommendations
