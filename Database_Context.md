# Database System Context

## Overview
PostgreSQL database with Supabase backend, managing user profiles, relationships, and content for the IYA Networking Tool.

## Database Schema

### Core Tables

#### `profiles` - User Profile Data
```sql
- id (UUID, PK) - References auth.users
- full_name (TEXT) - User's full name
- email (TEXT, UNIQUE) - User email
- avatar_url (TEXT) - Profile picture URL
- bio (TEXT) - User biography
- graduation_year (INTEGER) - Graduation year
- major (TEXT) - Academic major
- location (TEXT) - Current location
- hometown (TEXT) - Hometown
- cohort (TEXT) - IYA cohort
- modality (TEXT) - in-person, online, hybrid
- degree (TEXT) - Degree type
- links (JSONB) - All user data: organizations, favoriteTools, contentIngestion, hobbiesAndSports, wantToLearn, canTeach
- status (ENUM) - pending, active, suspended (SECURITY: Controls app access)
- role (ENUM) - user, admin (SECURITY: Controls admin privileges)
- visibility (ENUM) - public, private, unlisted (SECURITY: Controls profile visibility)
- created_at, updated_at (TIMESTAMP)
```

#### User Status System (CRITICAL SECURITY FEATURE)
```sql
-- User Status Definitions:
- 'pending' - New registrations awaiting admin approval
  * CAN ACCESS: /auth, /pending-approval only
  * CANNOT ACCESS: Directory, profile pages, any other app features
  * NOT VISIBLE: In directory, search results, recommendations
  
- 'active' - Approved users with full platform access
  * CAN ACCESS: All app features (directory, profile, etc.)
  * VISIBLE: In directory, search results, recommendations
  * FULL PERMISSIONS: Standard user capabilities
  
- 'suspended' - Temporarily disabled accounts
  * CAN ACCESS: /auth only (forced logout)
  * CANNOT ACCESS: Any app features
  * NOT VISIBLE: In directory, search results, recommendations
```

#### `skills` - Available Skills
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE) - Skill name
- description (TEXT) - Skill description
- created_at (TIMESTAMP)
```

#### `classes` - IYA Course Catalog
```sql
- id (UUID, PK)
- school (TEXT) - 'USC'
- code (TEXT) - Course code (e.g., 'IDSN 515')
- title (TEXT) - Course title
- description (TEXT) - Course description
- instructors (TEXT) - Comma-separated instructor names
- created_at (TIMESTAMP)
```

#### `projects` - User Projects
```sql
- id (UUID, PK)
- owner_id (UUID, FK) - References profiles
- title (TEXT) - Project title
- summary (TEXT) - Short description
- description (TEXT) - Detailed description
- links (JSONB) - URLs, technologies, status
- visibility (ENUM) - public, private, unlisted
- created_at, updated_at (TIMESTAMP)
```

### Relationship Tables

#### `profile_skills` - User Skills with Proficiency
```sql
- profile_id (UUID, FK) - References profiles
- skill_id (UUID, FK) - References skills
- level (INTEGER) - Proficiency level (1-5)
- created_at (TIMESTAMP)
- PRIMARY KEY (profile_id, skill_id)
```

#### `profile_classes` - User Classes with Roles
```sql
- profile_id (UUID, FK) - References profiles
- class_id (UUID, FK) - References classes
- role (ENUM) - ta, mentor (removed 'taken' status)
- created_at (TIMESTAMP)
- PRIMARY KEY (profile_id, class_id)
```

#### `profile_tags` - User Interests
```sql
- profile_id (UUID, FK) - References profiles
- tag_id (UUID, FK) - References tags
- created_at (TIMESTAMP)
- PRIMARY KEY (profile_id, tag_id)
```

#### `tags` - Interest Categories
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE) - Tag name
- description (TEXT) - Tag description
- created_at (TIMESTAMP)
```

## Data Management

### Current Data Status
- ✅ **145 IYA Classes**: IDSN and ACAD courses imported from CSV
- ✅ **Skills System**: User-defined skills with proficiency levels (stored in profile_skills table)
- ✅ **Projects**: User portfolio with technologies, links, and status (stored in projects table)
- ✅ **Organizations**: Stored in profiles.links.organizations JSONB with description, roles (admin/member), status (active/inactive/alumni/past), type (usc/non-usc)
- ✅ **Favorite Tools**: Stored in profiles.links.favoriteTools JSONB with name, description, categories, link
- ✅ **Interests**: Tag-based system stored in profile_tags junction table
- ✅ **Hobbies and Sports**: Stored in profiles.links.hobbiesAndSports JSONB array
- ✅ **Want to Learn**: Stored in profiles.links.wantToLearn JSONB array
- ✅ **Can Teach**: Stored in profiles.links.canTeach JSONB array
- ✅ **Content Ingestion**: Stored in profiles.links.contentIngestion JSONB with podcasts, youtubeChannels, influencers, newsSources

### Data Import Scripts
- **Classes Import**: `scripts/import-iya-classes.js` - Import IYA courses
- **Test Scripts**: Various debugging and testing utilities
- **Migration Scripts**: Database schema updates

### File Storage
- **Supabase Storage**: Resume and avatar uploads
- **Bucket Structure**: Organized by file type and user
- **Cleanup**: Automatic cleanup of orphaned files
- **Security**: RLS policies for file access

## Database Features

### Row Level Security (RLS)
- **Profile Access**: Users can only edit their own profiles
- **Public Profiles**: Read-only access to other users' profiles
- **Admin Access**: Admins can access all data
- **File Access**: Secure file upload and download

### Relationships
- **One-to-Many**: Profile → Projects, Profile → Skills, Profile → Classes
- **Many-to-Many**: Skills, Classes, Tags through junction tables
- **JSONB Fields**: Flexible data storage for links and preferences

### Indexing
- **Performance**: Proper indexes on frequently queried fields
- **Search**: Full-text search capabilities
- **Filtering**: Optimized queries for directory filtering

## Migration History
1. **001_initial_schema.sql** - Core database structure
2. **002_rls_policies.sql** - Row Level Security policies
3. **003_fix_projects_delete_policies.sql** - Project deletion fixes
4. **004_add_profile_fields.sql** - Additional profile fields
5. **005_update_hobbies_sports_schema.sql** - Hobbies and sports
6. **006_add_instructors_to_classes.sql** - Class instructor support
7. **007_add_instructor_to_profile_classes.sql** - Profile class instructors
8. **008_create_storage_buckets.sql** - File storage buckets
9. **009_remove_taken_role.sql** - Removed 'taken' from class_role enum
10. **011_remove_student_type.sql** - Removed student_type column and related index

## Data Types

### Enums
- `user_status`: pending, active, suspended
- `user_role`: user, admin
- `project_role`: owner, member, mentor
- `class_role`: ta, mentor (removed 'taken' in migration 009)
- `rsvp_status`: going, maybe, not_going

### JSONB Fields
- **profiles.links**: Complete user data storage including:
  - `organizations`: Array of organization objects with name, description, role, status, type
  - `favoriteTools`: Array of tool objects with name, description, categories, link
  - `contentIngestion`: Object with podcasts, youtubeChannels, influencers, newsSources arrays
  - `hobbiesAndSports`: Array of hobby/sport strings
  - `wantToLearn`: Array of skills to learn strings
  - `canTeach`: Array of skills user can teach strings
- **projects.links**: Project-specific data with URLs, technologies, status
- **Flexible Storage**: Dynamic data without schema changes

## Performance Considerations
- **Query Optimization**: Efficient joins and filtering
- **Caching**: Frequently accessed data cached
- **Pagination**: Large result sets paginated
- **Indexing**: Proper indexes for search and filtering

## Security
- **RLS Policies**: Row-level security for data access
- **Authentication**: Supabase Auth integration
- **File Security**: Secure file upload and access
- **Data Validation**: Server-side validation for all inputs

## User Registration and Approval Workflow

### User Registration Process
1. **Signup**: User creates account via `/auth` page with cohort and graduation year
2. **Email Validation**: System checks if email already exists
   - If exists and `status = 'pending'`: Show "pending approval" message
   - If exists and `status = 'active'`: Show "please sign in" message
   - If doesn't exist: Proceed with registration
3. **Auth User Creation**: Supabase Auth user created with metadata
4. **Profile Creation**: New profile created with `status = 'pending'` including:
   - `cohort` (TEXT): IYA cohort selection (e.g., "Cohort 10", "MSIDBT")
   - `graduation_year` (INTEGER): Graduation year (e.g., 2026, 2027)
   - All other profile fields
5. **Duplicate Handling**: If profile already exists, updates missing cohort/year data
6. **Admin Notification**: User appears in admin dashboard for approval
7. **Approval**: Admin approves user, `status` changed to `'active'`
8. **Access Granted**: User gains full platform access

### Signup Process Error Handling
- **Database Schema Validation**: Checks for required columns (cohort, graduation_year)
- **Duplicate Key Prevention**: Handles existing profiles gracefully
- **Data Persistence**: Ensures cohort and year are stored and displayed
- **User Feedback**: Clear error messages for configuration issues

### User Data Flow and Security

#### Personal Profile Data Retrieval
- **Function**: `getUserProfile()` in `src/lib/actions/profile-actions.ts`
- **Data Source**: Direct database queries with joins
- **Security**: Only accessible by profile owner or admins
- **Skills**: Retrieved from `profile_skills` table with proficiency levels
- **Classes**: Retrieved from `profile_classes` table with roles (ta/mentor)
- **Projects**: Retrieved from `projects` table with full details
- **Organizations**: Retrieved from `profiles.links.organizations` JSONB
- **Tools**: Retrieved from `profiles.links.favoriteTools` JSONB
- **Hobbies/Sports**: Retrieved from `profiles.links.hobbiesAndSports` JSONB
- **Interests**: Retrieved from `profile_tags` junction table

#### Public Profile Data Retrieval
- **Function**: `getProfileById()` in `src/lib/actions/directory-actions.ts`
- **Data Source**: Same database tables, transformed for public display
- **Security**: Only shows users with `status = 'active'`
- **Skills**: Transformed to include name and level only
- **Classes**: Transformed to include code, title, and role only
- **Projects**: Transformed to include title, description, links, visibility
- **Organizations**: Direct from `profiles.links.organizations` JSONB
- **Tools**: Direct from `profiles.links.favoriteTools` JSONB
- **Hobbies/Sports**: Direct from `profiles.links.hobbiesAndSports` JSONB
- **Interests**: Transformed from `profile_tags` junction table

#### Directory and Search Security
- **Directory Query**: `getDirectoryProfiles()` filters with `.eq('status', 'active')`
- **Recommendations**: `getUserRecommendations()` filters with `.eq('status', 'active')`
- **Search Results**: All search functions exclude pending/suspended users
- **Profile Visibility**: Pending users are completely invisible to other users

### Data Consistency
- **Same Source**: Both profiles read from identical database tables
- **Real-time Updates**: Changes in personal profile immediately reflect in public profile
- **Database Functions**: All updates use proper database functions (updateProject, updateOrganization, updateTool)
- **JSONB Updates**: Profile.links updates properly merge with existing data
- **Status Enforcement**: All queries respect user status for data visibility

## Development Notes
- **Local Development**: Demo mode when database not configured
- **Testing**: Comprehensive test scripts for data validation
- **Backup**: Regular database backups recommended
- **Monitoring**: Query performance and error tracking

## Admin Tools and Debugging

### Database Schema Testing
- **Schema Test Page**: `/admin/test-schema` - Verifies database columns exist
- **Signup Test Page**: `/admin/test-signup` - Tests complete signup process
- **Profile Fix Tool**: `/admin/fix-profiles` - Fixes missing cohort/year data

### User Deletion System
- **Admin Client**: Uses service role key for auth user deletion
- **Complete Cleanup**: Removes auth user, profile, and all related data
- **Email Debug Tool**: `/admin/debug` - Checks and cleans blocked emails
- **Safety Features**: Prevents self-deletion and last admin deletion

### Key Infrastructure Files
- **Admin Client**: `src/lib/supabase/admin.ts` - Service role client for admin operations
- **User Actions**: `src/lib/actions/user-actions.ts` - User management with proper auth
- **Debug Actions**: `src/lib/actions/debug-actions.ts` - Email cleanup and debugging
- **Enhanced Auth**: `src/app/auth/page.tsx` - Improved signup with error handling
