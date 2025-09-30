# Directory System Context

## Overview
The directory system provides an Instagram-style carousel interface for discovering and connecting with other IYA students. Features AI-powered recommendations, advanced search, and public profile viewing.

## Key Files
- **Directory Page**: `src/app/directory/page.tsx` - Main discovery interface
- **Public Profile**: `src/app/profile/[id]/page.tsx` - Individual profile viewing
- **Directory Actions**: `src/lib/actions/directory-actions.ts` - Data fetching and search
- **Search Logic**: `src/lib/search.ts` - Search and filtering algorithms

## Current Status ✅ COMPLETED

### Core Features
- ✅ **Instagram-Style Carousel**: Swipeable profile cards with photos
- ✅ **AI-Powered Recommendations**: Match scoring based on skills, classes, interests
- ✅ **Advanced Search**: Filter by skills, classes, year, cohort, location
- ✅ **Public Profiles**: Detailed profile pages with all user information
- ✅ **Classes Display**: Shows user's classes with proper role badges
- ✅ **Real-time Filtering**: Dynamic search and filter updates

### Classes Integration
- ✅ **Class Display**: Shows user's classes on public profiles
- ✅ **Role Badges**: TA (blue) and Mentor (purple) role indicators
- ✅ **Class Search**: Filter directory by specific classes
- ✅ **Instructor Support**: Display class instructors when available

## Technical Implementation

### Data Flow
1. **Profile Loading**: `getDirectoryProfiles()` fetches all public profiles with relationships from database
2. **Data Transformation**: Raw database data transformed to `DirectoryProfile` interface
3. **AI Matching**: Calculate compatibility scores based on multiple factors
4. **Filtering**: Apply search filters and sorting
5. **Display**: Render carousel with profile cards
6. **Navigation**: Handle profile viewing and interactions
7. **Public Profile**: `getProfileById()` fetches individual profile with same data transformation

### Search & Filtering
- **Skills Matching**: Find users with similar skills
- **Class Connections**: Connect through shared classes
- **Location Filtering**: Filter by geographic location
- **Year/Cohort**: Academic year and cohort filtering
- **Interest Matching**: Tag-based interest connections

### AI Recommendations
- **Match Scoring**: Algorithm considers skills, classes, interests, location
- **Compatibility**: Weighted scoring for better matches
- **Personalization**: Adapts to user preferences over time
- **Diversity**: Ensures variety in recommendations

## UI Components

### Directory Interface
- **Profile Cards**: Instagram-style swipeable cards
- **Search Bar**: Real-time search with suggestions
- **Filter Panel**: Advanced filtering options
- **Navigation**: Smooth transitions between profiles

### Public Profile View
- **Profile Header**: Photo, name, basic info
- **Classes Section**: User's classes with role badges
- **Skills Display**: User's skills and proficiency levels
- **Projects Showcase**: Portfolio of user projects
- **Contact Info**: Social links and contact methods

## Recent Improvements
- **Classes Integration**: Full classes display on public profiles
- **Role System**: Updated to show TA and Mentor roles only
- **Data Consistency**: Fixed hobbies and sports data flow between personal and public profiles
- **Organization Status**: Proper status mapping (active/inactive/alumni/past) between profiles
- **Tool Updates**: Individual tool editing with proper database updates
- **Profile Sync**: Changes in personal profile immediately reflect in public profile
- **Search Enhancement**: Improved filtering and search algorithms
- **UI Polish**: Better styling and user experience
- **Performance**: Optimized queries and rendering

## Data Structure

### Profile Data
```typescript
interface Profile {
  id: string
  name: string
  avatar_url: string
  bio: string
  location: string
  year: string
  cohort: string
  skills: Array<{name: string, level: number}>
  classes: Array<{name: string, code: string, role: 'ta' | 'mentor'}>
  projects: Array<{title: string, summary: string}>
}
```

### Search Filters
- **Skills**: Filter by specific skills
- **Classes**: Filter by classes taken/teaching
- **Location**: Geographic filtering
- **Year**: Academic year filtering
- **Cohort**: IYA cohort filtering
- **Student Type**: Undergraduate, graduate, faculty, staff

## Performance Considerations
- **Lazy Loading**: Load profiles as needed
- **Caching**: Cache frequently accessed data
- **Pagination**: Handle large user bases efficiently
- **Search Optimization**: Fast search and filtering

## Future Enhancements
- **Messaging**: Direct messaging between users
- **Connections**: Friend/connection system
- **Events**: Event discovery and RSVP
- **Advanced AI**: Machine learning recommendations
- **Social Features**: Like, follow, interaction systems

## Dependencies
- **Database**: Supabase PostgreSQL with optimized queries
- **Search**: Custom search algorithms and filtering
- **UI**: Tailwind CSS with responsive design
- **Authentication**: Supabase Auth for user management

## Development Notes
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized for large user bases
- **Security**: Proper data access controls and privacy
- **Authentication Integration**: Fixed hardcoded user ID issues - now properly gets authenticated user ID from Supabase Auth
- **User Recommendations**: AI recommendations now work correctly with real user authentication