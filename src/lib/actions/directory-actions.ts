"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Profile = Database['public']['Tables']['profiles']['Row']
type Class = Database['public']['Tables']['classes']['Row']
type Project = Database['public']['Tables']['projects']['Row']

export interface DirectoryProfile extends Profile {
  skills: string[]
      classes: Array<{
        id: string
        code: string
        title: string
      }>
  projects: Array<{
    id: string
    title: string
    summary: string | null
    description: string | null
    links: Record<string, unknown> | null
    visibility: 'public' | 'private' | 'unlisted'
  }>
  interests: string[]
  tags: string[] // Backward compatibility alias for interests
  organizations: Array<{
    id: string
    name: string
    description: string
    role: 'admin' | 'member'
    status: 'active' | 'past'
    type: 'usc' | 'non-usc'
  }>
  contentIngestion: {
    podcasts: string[]
    youtubeChannels: string[]
    influencers: string[]
    newsSources: string[]
  }
  favoriteTools: Array<{
    id: string
    name: string
    description?: string
    categories: string[]
    link?: string
  }>
  hobbiesAndSports: string[]
  canTeach: string[]
  wantToLearn: string[]
  major?: string | null // Backward compatibility
  degree?: string | null // Backward compatibility
}

// Get all profiles for directory (simplified structure)
export async function getDirectoryProfiles(filters?: DirectoryFilters): Promise<DirectoryProfile[]> {
  const supabase = await createClient()

  // Start with base query
  let query = supabase
    .from('profiles')
    .select(`
      *,
      profile_classes (
        classes (
          id,
          code,
          title
        )
      ),
      projects (
        id,
        title,
        summary,
        description,
        links,
        visibility
      )
    `)
    .eq('status', 'active')

  // Don't apply server-side search filter - we'll handle all search client-side

  // Apply hometown filter
  if (filters?.hometown) {
    query = query.ilike('hometown', `%${filters.hometown}%`)
  }

  // Apply location filter
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }

  // Apply cohort filter
  if (filters?.cohort && filters.cohort.length > 0) {
    query = query.in('cohort', filters.cohort)
  }

  // Apply skills filter (search in JSONB links field)
  if (filters?.skills && filters.skills.length > 0) {
    // Use JSONB contains operator to check if any of the skills are in the skills array
    const skillsCondition = filters.skills.map(skill => `links->'skills' ? '${skill}'`).join(' OR ')
    query = query.or(skillsCondition)
  }

  // Apply interests filter (search in JSONB links field)
  if (filters?.interests && filters.interests.length > 0) {
    // Use JSONB contains operator to check if any of the interests are in the interests array
    const interestsCondition = filters.interests.map(interest => `links->'interests' ? '${interest}'`).join(' OR ')
    query = query.or(interestsCondition)
  }

  // Apply year filter
  if (filters?.year && filters.year.length > 0) {
    const years = filters.year.map(y => parseInt(y)).filter(y => !isNaN(y))
    if (years.length > 0) {
      query = query.in('graduation_year', years)
    }
  }

  // Apply modality filter
  if (filters?.modality && filters.modality.length > 0) {
    query = query.in('modality', filters.modality)
  }

  // Execute query
  const { data: profiles, error: profilesError } = await query.order('created_at', { ascending: false })

  // TEMPORARY: If no active users found, get all users for debugging
  if (!profiles || profiles.length === 0) {
    console.log('No active users found, checking all users...')
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_classes (
          classes (
            id,
            code,
            title
          )
        ),
        projects (
          id,
          title,
          summary,
          description,
          links,
          visibility
        )
      `)
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('Error fetching all profiles:', allError)
    } else {
      console.log(`Found ${allProfiles?.length || 0} total profiles`)
      allProfiles?.forEach(profile => {
        console.log(`- ${profile.full_name} (status: ${profile.status})`)
      })
    }
  }

  if (profilesError) {
    console.error('Directory query error:', profilesError)
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
  }

  // Log for debugging
  console.log(`Directory query returned ${profiles?.length || 0} active profiles`)

  // Transform profiles to match DirectoryProfile interface
  let transformedProfiles: DirectoryProfile[] = profiles.map(profile => {
    const links = (profile.links as Record<string, unknown>) || {}
    
    return {
      ...profile,
      skills: links.skills || [],
      classes: (profile.profile_classes || []).map((pc: any) => ({
        id: pc.classes.id,
        code: pc.classes.code,
        title: pc.classes.title
      })),
      projects: (profile.projects || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        summary: project.summary,
        description: project.description,
        links: project.links,
        visibility: project.visibility
      })),
      interests: links.interests || [],
      tags: links.interests || [], // Backward compatibility
      organizations: links.organizations || [],
      contentIngestion: links.contentIngestion || {
        podcasts: [],
        youtubeChannels: [],
        influencers: [],
        newsSources: []
      },
      favoriteTools: links.favoriteTools || [],
      hobbiesAndSports: links.hobbiesAndSports || [],
      canTeach: links.canTeach || [],
      wantToLearn: links.wantToLearn || [],
      major: null, // Backward compatibility
      degree: null // Backward compatibility
    }
  })

  // Apply client-side search filter for all fields if search term exists
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    transformedProfiles = transformedProfiles.filter(profile => {
      // Check basic text fields
      const nameMatch = profile.full_name?.toLowerCase().includes(searchTerm) || false
      const bioMatch = profile.bio?.toLowerCase().includes(searchTerm) || false
      const majorMatch = profile.major?.toLowerCase().includes(searchTerm) || false
      const hometownMatch = profile.hometown?.toLowerCase().includes(searchTerm) || false
      const locationMatch = profile.location?.toLowerCase().includes(searchTerm) || false
      const cohortMatch = profile.cohort?.toLowerCase().includes(searchTerm) || false
      
      // Check JSONB array fields
      const skillsMatch = (profile.skills as string[]).some(skill => 
        skill.toLowerCase().includes(searchTerm)
      )
      const interestsMatch = (profile.interests as string[]).some(interest => 
        interest.toLowerCase().includes(searchTerm)
      )
      const wantToLearnMatch = (profile.wantToLearn as string[]).some(want => 
        want.toLowerCase().includes(searchTerm)
      )
      const hobbiesMatch = (profile.hobbiesAndSports as string[]).some(hobby => 
        hobby.toLowerCase().includes(searchTerm)
      )
      const canTeachMatch = (profile.canTeach as string[]).some(teach => 
        teach.toLowerCase().includes(searchTerm)
      )
      
      // Return true if any field contains the search term
      return nameMatch || bioMatch || majorMatch || hometownMatch || locationMatch || cohortMatch ||
             skillsMatch || interestsMatch || wantToLearnMatch || hobbiesMatch || canTeachMatch
    })
  }

  return transformedProfiles
}

// Get profile by ID for public profile page
export async function getProfileById(profileId: string): Promise<DirectoryProfile | null> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_classes (
        classes (
          id,
          code,
          title
        )
      ),
      projects (
        id,
        title,
        summary,
        description,
        links,
        visibility
      )
    `)
    .eq('id', profileId)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Profile not found
    }
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  const links = (profile.links as Record<string, unknown>) || {}
  
  return {
    ...profile,
    skills: links.skills || [],
    classes: (profile.profile_classes || []).map((pc: any) => ({
      id: pc.classes.id,
      code: pc.classes.code,
      title: pc.classes.title
    })),
    projects: (profile.projects || []).map((project: any) => ({
      id: project.id,
      title: project.title,
      summary: project.summary,
      description: project.description,
      links: project.links,
      visibility: project.visibility
    })),
    interests: links.interests || [],
    tags: links.interests || [], // Backward compatibility
    organizations: links.organizations || [],
    contentIngestion: links.contentIngestion || {
      podcasts: [],
      youtubeChannels: [],
      influencers: [],
      newsSources: []
    },
    favoriteTools: links.favoriteTools || [],
    hobbiesAndSports: links.hobbiesAndSports || [],
    canTeach: links.canTeach || [],
    wantToLearn: links.wantToLearn || [],
    major: null, // Backward compatibility
    degree: null // Backward compatibility
  }
}

// Get user recommendations (simplified)
export async function getUserRecommendations(userId: string): Promise<DirectoryProfile[]> {
  const supabase = await createClient()

  // Get current user's profile to find matches
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links, cohort, graduation_year')
    .eq('id', userId)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current user profile: ${currentError.message}`)
  }

  const currentLinks = (currentProfile.links as Record<string, unknown>) || {}
  const currentSkills = currentLinks.skills || []
  const currentInterests = currentLinks.interests || []
  const currentCohort = currentProfile.cohort
  const currentYear = currentProfile.graduation_year

  // Get all other active profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_classes (
        classes (
          id,
          code,
          title
        )
      ),
      projects (
        id,
        title,
        summary,
        description,
        links,
        visibility
      )
    `)
    .eq('status', 'active')
    .neq('id', userId)
    .order('created_at', { ascending: false })

  if (profilesError) {
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
  }

  // Transform and score profiles
  const scoredProfiles = profiles.map(profile => {
    const links = (profile.links as Record<string, unknown>) || {}
    const profileSkills = (links.skills as string[]) || []
    const profileInterests = (links.interests as string[]) || []
    
    // Calculate match score
    let score = 0
    
    // Skills match (2 points per match)
    const skillMatches = (currentSkills as string[]).filter((skill: string) => 
      profileSkills.includes(skill)
    ).length
    score += skillMatches * 2
    
    // Interests match (1 point per match)
    const interestMatches = (currentInterests as string[]).filter((interest: string) => 
      profileInterests.includes(interest)
    ).length
    score += interestMatches
    
    // Cohort match (3 points)
    if (currentCohort && profile.cohort === currentCohort) {
      score += 3
    }
    
    // Year match (1 point)
    if (currentYear && profile.graduation_year === currentYear) {
      score += 1
    }
    
    return {
      ...profile,
      skills: profileSkills,
      classes: (profile.profile_classes || []).map((pc: any) => ({
        id: pc.classes.id,
        code: pc.classes.code,
        title: pc.classes.title
      })),
      projects: (profile.projects || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        summary: project.summary,
        description: project.description,
        links: project.links,
        visibility: project.visibility
      })),
      interests: profileInterests,
      organizations: links.organizations || [],
      contentIngestion: links.contentIngestion || {
        podcasts: [],
        youtubeChannels: [],
        influencers: [],
        newsSources: []
      },
      favoriteTools: links.favoriteTools || [],
      hobbiesAndSports: links.hobbiesAndSports || [],
      canTeach: links.canTeach || [],
      wantToLearn: links.wantToLearn || [],
      major: null, // Backward compatibility
      degree: null, // Backward compatibility
      matchScore: score
    }
  })

  // Sort by match score and return top 20
  return scoredProfiles
    .sort((a, b) => ((b as { matchScore: number }).matchScore) - ((a as { matchScore: number }).matchScore))
    .slice(0, 20)
    .map(({ matchScore, ...profile }) => profile) // Remove matchScore from final result
}

// Search profiles (simplified)
export async function searchProfiles(query: string): Promise<DirectoryProfile[]> {
  const supabase = await createClient()

  // Simple text search on name, bio, and skills
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_classes (
        classes (
          id,
          code,
          title
        )
      ),
      projects (
        id,
        title,
        summary,
        description,
        links,
        visibility
      )
    `)
    .eq('status', 'active')
    .or(`full_name.ilike.%${query}%,bio.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to search profiles: ${error.message}`)
  }

  // Transform profiles
  const transformedProfiles: DirectoryProfile[] = profiles.map(profile => {
    const links = (profile.links as Record<string, unknown>) || {}
    
    return {
      ...profile,
      skills: links.skills || [],
      classes: (profile.profile_classes || []).map((pc: any) => ({
        id: pc.classes.id,
        code: pc.classes.code,
        title: pc.classes.title
      })),
      projects: (profile.projects || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        summary: project.summary,
        description: project.description,
        links: project.links,
        visibility: project.visibility
      })),
      interests: links.interests || [],
      tags: links.interests || [], // Backward compatibility
      organizations: links.organizations || [],
      contentIngestion: links.contentIngestion || {
        podcasts: [],
        youtubeChannels: [],
        influencers: [],
        newsSources: []
      },
      favoriteTools: links.favoriteTools || [],
      hobbiesAndSports: links.hobbiesAndSports || [],
      canTeach: links.canTeach || [],
      wantToLearn: links.wantToLearn || [],
      major: null, // Backward compatibility
      degree: null // Backward compatibility
    }
  })

  return transformedProfiles
}

// Get all classes for class selection
export async function getAllClasses(): Promise<Class[]> {
  const supabase = await createClient()

  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .order('code', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch classes: ${error.message}`)
  }

  return classes
}

// Directory filters interface for backward compatibility
export interface DirectoryFilters {
  search?: string
  skills?: string[]
  interests?: string[]
  cohort?: string[]
  year?: string[]
  modality?: string[]
  hometown?: string
  location?: string
}
