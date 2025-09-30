# Profile System Context

## Overview
The profile system manages user data, authentication, and profile management for the IYA Networking Tool. Users can edit their profiles, add skills, classes, projects, and other information.

## Key Files
- **Main Profile Page**: `src/app/profile/page.tsx` - User's own profile with edit capabilities
- **Public Profile Page**: `src/app/profile/[id]/page.tsx` - View other users' profiles
- **Profile Actions**: `src/lib/actions/profile-actions.ts` - Server actions for profile CRUD
- **Types**: `src/types/index.ts` - TypeScript interfaces

## Current Status ✅ COMPLETED

### Authentication & Data Integration
- ✅ Real user data integration (no more mock data)
- ✅ Supabase authentication with user approval system
- ✅ Graceful demo mode fallback for development
- ✅ Complete database integration for all profile features

### Core Features
- ✅ **Skills Management**: Add/remove skills with proficiency levels
- ✅ **Classes Management**: Search-based class selection with IYA courses
- ✅ **Projects Management**: Full CRUD operations with technologies
- ✅ **File Uploads**: Resume and avatar upload via Supabase Storage
- ✅ **Organizations**: USC and non-USC organization management
- ✅ **Interests & Tags**: Tag-based interest system
- ✅ **Content Ingestion**: Podcasts, YouTube, influencers, news sources

### Classes System (Recently Completed)
- ✅ **145 IYA Classes Imported**: IDSN and ACAD courses from CSV data
- ✅ **Search Interface**: Real-time search by course code or title
- ✅ **Public Display**: Classes shown on public profiles and directory
- ✅ **Database Integration**: Full CRUD operations with optimistic updates
- ✅ **Role System**: TA and Mentor roles (removed 'taken' status)
- ✅ **Profile Picture Upload**: Professional image cropping with react-easy-crop

## Technical Implementation

### State Management
- Uses React hooks for local state management
- Optimistic updates for better UX
- Error handling with rollback on failures
- Loading states for all operations

### Server Actions
- `getUserProfile()` - Fetch authenticated user's profile with all relations
- `updateProfile()` - Update basic profile information
- `addSkill()`, `removeSkill()` - Manage skills in profile_skills table
- `addClass()`, `removeClass()` - Manage classes in profile_classes table
- `addProject()`, `updateProject()`, `deleteProject()` - Manage projects in projects table
- `addOrganization()`, `updateOrganization()`, `removeOrganization()` - Manage organizations in profiles.links.organizations
- `addFavoriteTool()`, `updateTool()`, `removeFavoriteTool()` - Manage tools in profiles.links.favoriteTools
- File upload actions for resume and avatar via Supabase Storage

### UI Components
- **Edit Mode**: Toggle editing for different sections
- **Search Interface**: Class selection with real-time filtering
- **File Upload**: Drag-and-drop file upload components with professional cropping
- **Avatar Cropper**: react-easy-crop integration for profile picture editing
- **Validation**: Real-time form validation with error messages

## Data Flow
1. **Authentication**: User logs in via Supabase Auth
2. **Profile Loading**: `getUserProfile()` fetches user data with all relations from database tables
3. **Editing**: Users can edit different sections (skills, classes, projects, organizations, tools, etc.)
4. **Database Updates**: All changes use proper database functions (updateProject, updateOrganization, updateTool)
5. **Optimistic Updates**: UI updates immediately, then syncs with database
6. **Public Profiles**: Other users can view profiles via `/profile/[id]` using `getProfileById()`
7. **Data Consistency**: Both personal and public profiles read from same database tables

## Recent Improvements
- **Class Search**: Replaced dropdown with search interface
- **IYA Classes**: Imported real USC IYA course data
- **Public Display**: Classes now show on public profiles
- **Error Handling**: Comprehensive error handling and validation
- **Demo Mode**: Graceful fallback when database isn't configured
- **Profile Picture Upload**: Fixed cropping issues with react-easy-crop library
- **Class Roles**: Removed 'taken' status, now only TA and Mentor roles
- **UI Improvements**: Cleaner file upload interface, removed double dropdown arrows
- **Skills Section**: Light red pill format for better visibility
- **Organizations Section**: 
  - Title changed to "Organizations and Clubs"
  - USC tag moved next to name with USC yellow color
  - Individual editing for each organization
  - Button-first approach with modal forms
  - Simplified role options (Admin/Member only)
  - Status mapping: active/inactive/alumni/past with proper color coding
- **Projects Section**: Individual editing with modal forms
- **Tools Section**: 
  - Enhanced with description and multiple categories
  - Button-first approach with modal forms
  - Individual editing capabilities
- **Want to Learn Section**: Light orange pill format
- **Hobbies and Sports Section**: Light yellow pill format
- **Edit UI**: Consistent "Add" buttons next to "Done" for all sections
- **Data Consistency**: Fixed hobbies and sports data flow between personal and public profiles
- **Organization Status**: Proper mapping of active/inactive/alumni/past status between profiles
- **News Sources**: Consistent light green styling across both profile types
- **Tool Editing**: Added individual edit functionality for favorite tools with proper database updates
- **Database Integration**: All profile sections now use proper database functions for updates
- **Public Profile Sync**: Changes in personal profile immediately reflect in public profile
- **HEIC Image Support**: Fixed SSR issues with HEIC image conversion using dynamic imports
- **Font Optimization**: Improved font loading performance with display: swap

## Next Steps (Future Development)
- **Instructor Selection**: Add professor selection for classes
- **Class Prerequisites**: Show course prerequisites and dependencies
- **Advanced Filtering**: More sophisticated class filtering options
- **Bulk Operations**: Add/remove multiple classes at once
- **Class Recommendations**: Suggest classes based on user's skills/interests

## Dependencies
- **Database**: Supabase PostgreSQL with RLS policies
- **Storage**: Supabase Storage for file uploads
- **Authentication**: Supabase Auth with user approval system
- **UI**: Tailwind CSS with USC theme (cardinal red, gold)

## Development Notes
- All profile data is stored in PostgreSQL with proper relationships
- File uploads use Supabase Storage with proper cleanup
- Optimistic updates provide immediate feedback
- Demo mode allows development without database setup
- TypeScript interfaces ensure type safety across the system
- **HEIC Conversion**: Uses dynamic import to avoid SSR issues: `const heic2any = (await import('heic2any')).default`
- **Font Loading**: Optimized with `display: "swap"` to improve performance and reduce warnings
