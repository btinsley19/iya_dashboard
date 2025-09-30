# Admin Dashboard Context

## Overview
The Admin Dashboard is a comprehensive management system for the IYA Networking Tool, providing administrators with tools to manage users, content, and system settings. It implements a secure, role-based access control system with audit logging and comprehensive user management capabilities.

## System Architecture

### Authentication & Authorization
- **Admin Access**: Requires `role = 'admin'` in user profile
- **Status Check**: Users must be `status = 'active'` to access admin features
- **Middleware Protection**: `requireAdmin()` function enforces admin-only access
- **Database Functions**: `is_admin(user_id)` and `is_active_user(user_id)` helper functions
- **Row Level Security**: Comprehensive RLS policies for all admin operations

### Key Components
- **Main Dashboard**: Overview with navigation cards and quick stats
- **User Management**: Complete user lifecycle management
- **Content Management**: Projects, events, and classes administration
- **Taxonomy Management**: Skills, tags, and categories
- **System Settings**: Platform configuration
- **Activity Logging**: Audit trail for all admin actions

## Admin Dashboard Pages

### 1. Main Dashboard (`/admin/page.tsx`)
**Purpose**: Central hub with navigation to all admin features

**Features**:
- **User Management Card**: Links to user management and pending approvals
- **Content Management Card**: Links to projects, events, and classes
- **Taxonomy Card**: Links to skills and tags management
- **System Settings Card**: Links to general settings
- **Activity Log Card**: Links to audit trail
- **Quick Stats Card**: Real-time metrics display

**Navigation Structure**:
```
/admin/
├── users/          # User management
├── approvals/      # Pending user approvals
├── projects/       # Project management
├── events/         # Event management
├── classes/        # Class management
├── skills/         # Skills management
├── tags/           # Tags management
├── settings/       # System settings
└── activity/       # Activity log
```

### 2. User Management (`/admin/users/page.tsx`)
**Purpose**: Comprehensive user account management

**Features**:
- **User Listing**: Table view of all users with key information
- **Search & Filtering**: Search by name/email, filter by status/role/year
- **User Actions**: Approve, suspend, promote to admin, demote from admin
- **User Information Display**: Name, email, status, role, graduation year, join date
- **Status Management**: Pending → Active → Suspended workflow
- **Role Management**: User ↔ Admin role switching

**User States**:
- **Pending**: New registrations awaiting approval
- **Active**: Approved users with full platform access
- **Suspended**: Temporarily disabled accounts

**User Roles**:
- **User**: Standard platform access
- **Admin**: Full administrative privileges

**Available Actions**:
- **Approve**: Move user from pending to active status
- **Suspend**: Move user from active to suspended status
- **Promote to Admin**: Grant administrative privileges
- **Remove Admin**: Revoke administrative privileges
- **Delete User**: Permanently remove user and all associated data

## Database Integration

### User Management Functions (`src/lib/actions/user-actions.ts`)
**Server Actions for User Operations**:

```typescript
// User Status Management
approveUser(userId: string)           // pending → active
suspendUser(userId: string)           // active → suspended  
activateUser(userId: string)          // suspended → active

// Role Management
promoteToAdmin(userId: string)        // user → admin
demoteFromAdmin(userId: string)       // admin → user

// Profile Management
updateUserProfile(userId: string, updates) // Admin profile updates

// User Deletion (CRITICAL)
deleteUser(userId: string)            // Complete user removal
```

**Security Features**:
- **Admin Verification**: All actions require admin authentication
- **Audit Logging**: Every action logged to `activity_log` table
- **Path Revalidation**: Automatic cache invalidation after changes
- **Error Handling**: Comprehensive error messages and rollback

### Activity Logging System
**Purpose**: Complete audit trail for all administrative actions

**Logged Actions**:
- `approve_user`: User approval with previous status
- `suspend_user`: User suspension with previous status
- `activate_user`: User reactivation with previous status
- `promote_to_admin`: Role elevation with previous role
- `demote_from_admin`: Role reduction with previous role
- `update_profile`: Profile modifications with update details
- `delete_user`: Complete user deletion with user details

**Log Structure**:
```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,        -- 'profile', 'project', etc.
  entity_id UUID NOT NULL,          -- ID of affected entity
  actor_id UUID NOT NULL,           -- Admin who performed action
  action TEXT NOT NULL,             -- Action performed
  metadata JSONB,                   -- Additional context
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Row Level Security (RLS)

### Admin Privileges
**Database Functions**:
```sql
-- Check if user is admin
CREATE FUNCTION is_admin(user_id UUID) RETURNS BOOLEAN

-- Check if user is active
CREATE FUNCTION is_active_user(user_id UUID) RETURNS BOOLEAN
```

**Admin Access Policies**:
- **Profiles**: Admins can view/update any profile
- **Skills/Tags/Classes**: Admins have full CRUD access
- **Projects/Events**: Admins can view/update all content
- **Activity Log**: Admin-only access to audit trail
- **Documents**: Admin-only document management

### Security Model
**Multi-Layer Protection**:
1. **Authentication**: Supabase Auth verification
2. **Authorization**: Role and status checks
3. **Database RLS**: Row-level security policies
4. **Server Actions**: Server-side admin verification
5. **UI Protection**: Admin-only route access

## User Management Workflow

### New User Registration Flow
1. **User Signs Up**: Creates account via Supabase Auth
2. **Profile Creation**: Initial profile with `status = 'pending'`
3. **Admin Notification**: Pending user appears in admin dashboard
4. **Admin Review**: Admin reviews user information
5. **Approval Decision**: Admin approves or rejects user
6. **Status Update**: User status changed to `active` or `suspended`
7. **Access Granted**: Approved users gain full platform access

### User Lifecycle Management
**Status Transitions**:
```
Registration → Pending → Active → Suspended
                    ↓        ↑        ↓
                 Rejected  Reactivate  Banned
                                     ↓
                                  Deleted
```

**Role Management**:
```
User ←→ Admin
```

### User Deletion System (CRITICAL)
**Complete Data Removal**:
When a user is deleted, the following data is permanently removed:
- **Profile Data**: Full name, email, bio, graduation year, major, cohort, etc.
- **Skills & Classes**: All profile_skills and profile_classes relationships
- **Projects**: All projects owned by the user
- **Files**: Avatar and resume files from Supabase Storage
- **Auth Account**: Supabase Auth user account (using admin client with service role)
- **Activity Logs**: All activity log entries (actor_id set to NULL)

**Deletion Safety Features**:
- **Self-Protection**: Admins cannot delete their own account
- **Last Admin Protection**: Cannot delete the last remaining admin
- **Confirmation Dialog**: Requires explicit confirmation before deletion
- **Audit Trail**: Deletion action is logged with user details
- **Cascade Deletion**: Database relationships automatically clean up
- **Admin Client**: Uses service role key for proper auth user deletion
- **Email Cleanup**: Ensures email is available for reuse after deletion

**UI Confirmation Dialog**:
- **Warning Icon**: Clear visual indication of destructive action
- **Detailed List**: Shows exactly what will be deleted
- **User Context**: Displays user name being deleted
- **Loading States**: Prevents multiple deletion attempts

## Admin Interface Features

### User Management Interface
**Table View**:
- **User Avatar**: Initial-based avatar with cardinal background
- **User Info**: Full name and email with mail icon
- **Status Badge**: Color-coded status indicators
- **Role Badge**: Role display with cardinal styling for admins
- **Cohort**: IYA cohort display (e.g., "Cohort 10", "MSIDBT")
- **Graduation Year**: Academic information display
- **Join Date**: Registration timestamp with calendar icon
- **Action Buttons**: Context-sensitive action buttons

**Filtering System**:
- **Search**: Real-time search by name or email
- **Status Filter**: Filter by pending/active/suspended
- **Role Filter**: Filter by user/admin role
- **Year Filter**: Filter by graduation year

**Action Buttons**:
- **Approve** (Pending users): Green button with UserCheck icon
- **Suspend** (Active users): Red button with UserX icon
- **Make Admin** (Users): Cardinal button with Shield icon
- **Remove Admin** (Admins): Orange button with Shield icon
- **Delete User** (All users): Red button with Trash2 icon

### Visual Design
**USC Theme Integration**:
- **Cardinal Red** (#990000): Primary admin actions and accents
- **Gold** (#FFCC00): Status indicators and highlights
- **Consistent Icons**: Lucide React icons throughout
- **Card Layout**: Clean card-based interface
- **Hover Effects**: Subtle shadow transitions

## Planned Features

### Content Management Pages
**Projects Management**:
- View all projects across platform
- Moderate project content
- Manage project visibility
- Handle project reports

**Events Management**:
- Create and manage events
- Moderate event content
- Track event attendance
- Handle event reports

**Classes Management**:
- Manage IYA course catalog
- Update class information
- Add/remove instructors
- Handle class assignments

### Taxonomy Management
**Skills Management**:
- Add/remove skills from catalog
- Manage skill categories
- Update skill descriptions
- Handle skill requests

**Tags Management**:
- Manage interest tags
- Create tag categories
- Moderate tag usage
- Handle tag requests

### System Administration
**Settings Management**:
- Platform configuration
- Feature toggles
- Email templates
- System preferences

**Analytics Dashboard**:
- User growth metrics
- Platform usage statistics
- Content engagement data
- Performance monitoring

**Activity Monitoring**:
- Real-time activity feed
- Audit trail search
- Action history tracking
- Security monitoring

## Security Considerations

### Access Control
**Multi-Factor Verification**:
- Database role verification
- Session authentication
- Server-side authorization
- Route-level protection
- User status enforcement (pending/active/suspended)

### User Status Security (CRITICAL)
**Pending User Protection**:
- Pending users CANNOT access directory, profile pages, or any app features
- Pending users are COMPLETELY INVISIBLE to other users
- Directory queries filter with `.eq('status', 'active')` only
- Recommendations exclude pending/suspended users
- Middleware redirects pending users to `/pending-approval` page only

**Email Validation on Signup**:
- Prevents duplicate registrations with existing emails
- Checks database for existing profiles before allowing signup
- Shows specific messages for pending vs active users
- Blocks signup attempts for emails already in system

### Audit Trail
**Complete Logging**:
- All admin actions logged
- User identification tracked
- Timestamp recording
- Metadata preservation
- User status changes tracked

### Data Protection
**Privacy Compliance**:
- User data access controls
- Secure data handling
- Audit trail maintenance
- Data retention policies
- Status-based data visibility enforcement

## Development Notes

### Current Implementation Status
✅ **Completed**:
- Main dashboard with navigation cards
- User management with full CRUD operations
- Admin authentication and authorization
- Activity logging system
- RLS policies for admin access
- User approval workflow
- **SECURITY: Pending user access restrictions**
- **SECURITY: Directory filtering for active users only**
- **SECURITY: Email validation on signup**
- **SECURITY: Middleware protection for user status**
- **USER DELETION: Complete user removal with cascade deletion**
- **USER DELETION: Safety protections and confirmation dialog**
- **SIGNUP PROCESS: Cohort and graduation year data persistence**
- **SIGNUP PROCESS: Duplicate key error handling**
- **SIGNUP PROCESS: Enhanced error messages and validation**
- **ADMIN TOOLS: Database schema testing and debugging**
- **ADMIN TOOLS: Email cleanup and user deletion debugging**

🚧 **In Development**:
- Content management pages
- Taxonomy management interfaces
- System settings configuration
- Analytics dashboard

❌ **Planned**:
- Advanced filtering and search
- Bulk operations
- Email notifications
- Advanced analytics

### Key Files
- **Main Dashboard**: `src/app/admin/page.tsx`
- **User Management**: `src/app/admin/users/page.tsx`
- **User Actions**: `src/lib/actions/user-actions.ts`
- **Authentication**: `src/lib/auth.ts`
- **Admin Client**: `src/lib/supabase/admin.ts`
- **Debug Actions**: `src/lib/actions/debug-actions.ts`
- **Middleware Protection**: `src/lib/supabase/middleware.ts`
- **Directory Security**: `src/lib/actions/directory-actions.ts`
- **Auth Page Security**: `src/app/auth/page.tsx`
- **RLS Policies**: `supabase/migrations/002_rls_policies.sql`

### Admin Debug Tools
- **Schema Test**: `src/app/admin/test-schema/page.tsx`
- **Signup Test**: `src/app/admin/test-signup/page.tsx`
- **Profile Fix**: `src/app/admin/fix-profiles/page.tsx`
- **Email Debug**: `src/app/admin/debug/page.tsx`

### Database Schema
- **Profiles Table**: User data with role and status
- **Activity Log**: Audit trail for all actions
- **Helper Functions**: Admin and active user checks
- **RLS Policies**: Comprehensive access control

---

*This document provides complete context for the Admin Dashboard system, including architecture, features, security model, and development status. Use this as a reference for all admin-related development and maintenance.*
