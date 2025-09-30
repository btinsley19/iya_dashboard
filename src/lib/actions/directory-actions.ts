"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database"

type Profile = Database['public']['Tables']['profiles']['Row']
type Skill = Database['public']['Tables']['skills']['Row']
type Class = Database['public']['Tables']['classes']['Row']
type Project = Database['public']['Tables']['projects']['Row']

export interface DirectoryProfile extends Profile {
  skills: Array<{
    id: string
    name: string
    level: number
  }>
  classes: Array<{
    id: string
    code: string
    title: string
    role: 'ta' | 'mentor'
  }>
  projects: Array<{
    id: string
    title: string
    summary: string | null
    description: string | null
    links: any
    visibility: 'public' | 'private' | 'unlisted'
  }>
  tags: Array<{
    id: string
    name: string
  }>
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
    category?: string
    link?: string
  }>
  wantToLearn: string[]
  hobbiesAndSports: string[]
}

export interface DirectoryFilters {
  search?: string
  skills?: string[]
  graduationYear?: number
  major?: string
  cohort?: string
  modality?: 'in-person' | 'online' | 'hybrid'
  location?: string
  hometown?: string
}

export interface SearchFilters extends DirectoryFilters {
  limit?: number
  offset?: number
}

export interface Recommendation {
  profile: DirectoryProfile
  reason: string
  matchScore: number
  connectionPoints: string[]
}

/**
 * Get all profiles for the directory with enhanced data
 */
export async function getDirectoryProfiles(filters: DirectoryFilters = {}): Promise<DirectoryProfile[]> {
  try {
    const supabase = await createClient()
    
    // Build the base query with all necessary joins
    // CRITICAL: Only show active users in directory
    let query = supabase
      .from('profiles')
      .select(`
        *,
        profile_skills(
          level,
          skills(id, name)
        ),
        profile_classes(
          role,
          classes(id, code, title)
        ),
        profile_tags(
          tags(id, name)
        )
      `)
      .eq('status', 'active')  // Only show active users
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.graduationYear) {
      query = query.eq('graduation_year', filters.graduationYear)
    }
    
    if (filters.major) {
      query = query.eq('major', filters.major)
    }
    
    if (filters.cohort) {
      query = query.eq('cohort', filters.cohort)
    }
    
    
    if (filters.modality) {
      query = query.eq('modality', filters.modality)
    }
    
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    
    if (filters.hometown) {
      query = query.ilike('hometown', `%${filters.hometown}%`)
    }

    const { data: profiles, error } = await query

    if (error) {
      console.error('Error fetching directory profiles:', error)
      return []
    }

    if (!profiles) return []

    // Transform the data to match our interface
    const transformedProfiles: DirectoryProfile[] = profiles.map(profile => ({
      ...profile,
      skills: profile.profile_skills?.map(ps => ({
        id: ps.skills.id,
        name: ps.skills.name,
        level: ps.level
      })) || [],
      classes: profile.profile_classes?.map(pc => ({
        id: pc.classes.id,
        code: pc.classes.code,
        title: pc.classes.title,
        role: pc.role
      })) || [],
      tags: profile.profile_tags?.map(pt => ({
        id: pt.tags.id,
        name: pt.tags.name
      })) || [],
      projects: [], // Will be populated separately if needed
      organizations: profile.links?.organizations || [],
      contentIngestion: profile.links?.contentIngestion || {
        podcasts: [],
        youtubeChannels: [],
        influencers: [],
        newsSources: []
      },
      favoriteTools: profile.links?.favoriteTools || [],
      wantToLearn: profile.links?.wantToLearn || [],
      hobbiesAndSports: profile.links?.hobbiesAndSports || []
    }))

    // Apply search filter if provided
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return transformedProfiles.filter(profile => {
        const searchableFields = [
          profile.full_name,
          profile.bio,
          profile.major,
          profile.location,
          profile.hometown,
          ...profile.skills.map(s => s.name),
          ...profile.tags.map(t => t.name),
          ...profile.classes.map(c => `${c.code} ${c.title}`)
        ]
        
        return searchableFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        )
      })
    }

    // Apply skills filter if provided
    if (filters.skills && filters.skills.length > 0) {
      return transformedProfiles.filter(profile => 
        filters.skills!.every(skill => 
          profile.skills.some(s => s.name === skill)
        )
      )
    }

    return transformedProfiles
  } catch (error) {
    console.error('Error in getDirectoryProfiles:', error)
    return []
  }
}

/**
 * Get AI-recommended profiles for a specific user
 */
export async function getUserRecommendations(userId: string): Promise<Recommendation[]> {
  try {
    // Validate userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!userId || !uuidRegex.test(userId)) {
      console.log('Invalid userId for recommendations:', userId)
      return []
    }

    const supabase = await createClient()
    
    // Get the current user's profile with all related data
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_skills(
          level,
          skills(id, name)
        ),
        profile_classes(
          role,
          classes(id, code, title)
        ),
        profile_tags(
          tags(id, name)
        )
      `)
      .eq('id', userId)
      .single()

    if (userError || !currentUser) {
      console.error('Error fetching current user:', userError)
      return []
    }

    // Get all other active profiles (exclude pending/suspended users)
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_skills(
          level,
          skills(id, name)
        ),
        profile_classes(
          role,
          classes(id, code, title)
        ),
        profile_tags(
          tags(id, name)
        )
      `)
      .eq('status', 'active')  // Only show active users
      .neq('id', userId)

    if (profilesError || !allProfiles) {
      console.error('Error fetching profiles for recommendations:', profilesError)
      return []
    }

    // Transform profiles
    const transformedProfiles: DirectoryProfile[] = allProfiles.map(profile => ({
      ...profile,
      skills: profile.profile_skills?.map(ps => ({
        id: ps.skills.id,
        name: ps.skills.name,
        level: ps.level
      })) || [],
      classes: profile.profile_classes?.map(pc => ({
        id: pc.classes.id,
        code: pc.classes.code,
        title: pc.classes.title,
        role: pc.role
      })) || [],
      tags: profile.profile_tags?.map(pt => ({
        id: pt.tags.id,
        name: pt.tags.name
      })) || [],
      projects: [],
      organizations: profile.links?.organizations || [],
      contentIngestion: profile.links?.contentIngestion || {
        podcasts: [],
        youtubeChannels: [],
        influencers: [],
        newsSources: []
      },
      favoriteTools: profile.links?.favoriteTools || [],
      wantToLearn: profile.links?.wantToLearn || [],
      hobbiesAndSports: profile.links?.hobbiesAndSports || []
    }))

    // Calculate recommendations
    const recommendations: Recommendation[] = transformedProfiles.map(profile => {
      const connectionPoints: string[] = []
      let matchScore = 0

      // Check for shared skills
      const currentUserSkills = currentUser.profile_skills?.map(ps => ps.skills.name) || []
      const profileSkills = profile.skills.map(s => s.name)
      const sharedSkills = currentUserSkills.filter(skill => profileSkills.includes(skill))
      
      if (sharedSkills.length > 0) {
        connectionPoints.push(`Shared skills: ${sharedSkills.join(', ')}`)
        matchScore += sharedSkills.length * 10
      }

      // Check for complementary skills (skills the current user doesn't have)
      const complementarySkills = profileSkills.filter(skill => !currentUserSkills.includes(skill))
      if (complementarySkills.length > 0) {
        connectionPoints.push(`Complementary skills: ${complementarySkills.slice(0, 3).join(', ')}`)
        matchScore += complementarySkills.length * 5
      }

      // Check for same cohort
      if (currentUser.cohort && profile.cohort && currentUser.cohort === profile.cohort) {
        connectionPoints.push(`Same cohort: ${profile.cohort}`)
        matchScore += 20
      }

      // Check for same graduation year
      if (currentUser.graduation_year && profile.graduation_year && 
          currentUser.graduation_year === profile.graduation_year) {
        connectionPoints.push(`Same graduation year: ${profile.graduation_year}`)
        matchScore += 15
      }

      // Check for shared classes
      const currentUserClasses = currentUser.profile_classes?.map(pc => pc.classes.code) || []
      const profileClasses = profile.classes.map(c => c.code)
      const sharedClasses = currentUserClasses.filter(classCode => profileClasses.includes(classCode))
      
      if (sharedClasses.length > 0) {
        connectionPoints.push(`Shared classes: ${sharedClasses.join(', ')}`)
        matchScore += sharedClasses.length * 8
      }

      // Check for shared interests/tags
      const currentUserTags = currentUser.profile_tags?.map(pt => pt.tags.name) || []
      const profileTags = profile.tags.map(t => t.name)
      const sharedTags = currentUserTags.filter(tag => profileTags.includes(tag))
      
      if (sharedTags.length > 0) {
        connectionPoints.push(`Shared interests: ${sharedTags.join(', ')}`)
        matchScore += sharedTags.length * 6
      }

      // Determine primary reason
      let reason = "Potential connection"
      if (sharedSkills.length > 0) {
        reason = `Shared skills: ${sharedSkills[0]}`
      } else if (currentUser.cohort && profile.cohort && currentUser.cohort === profile.cohort) {
        reason = `Same cohort: ${profile.cohort}`
      } else if (complementarySkills.length > 0) {
        reason = `Complementary skills: ${complementarySkills[0]}`
      } else if (sharedClasses.length > 0) {
        reason = `Shared class: ${sharedClasses[0]}`
      }

      return {
        profile,
        reason,
        matchScore,
        connectionPoints
      }
    })

    // Sort by match score and return top recommendations
    return recommendations
      .filter(rec => rec.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20) // Return top 20 recommendations

  } catch (error) {
    console.error('Error in getUserRecommendations:', error)
    return []
  }
}

/**
 * Search profiles with advanced criteria
 */
export async function searchProfiles(query: string, filters: SearchFilters = {}): Promise<DirectoryProfile[]> {
  try {
    const supabase = await createClient()
    
    // Use the directory profiles function with search filter
    const profiles = await getDirectoryProfiles({
      ...filters,
      search: query
    })

    // Apply additional search criteria
    let results = profiles

    // Apply limit and offset for pagination
    if (filters.limit) {
      const offset = filters.offset || 0
      results = results.slice(offset, offset + filters.limit)
    }

    return results
  } catch (error) {
    console.error('Error in searchProfiles:', error)
    return []
  }
}

/**
 * Get a single profile by ID with all related data
 */
export async function getProfileById(id: string): Promise<DirectoryProfile | null> {
  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_skills(
          level,
          skills(id, name)
        ),
        profile_classes(
          role,
          classes(id, code, title)
        ),
        profile_tags(
          tags(id, name)
        ),
        projects!owner_id(
          id,
          title,
          summary,
          description,
          links,
          visibility
        )
      `)
      .eq('id', id)
      .single()

    if (error || !profile) {
      console.error('Error fetching profile by ID:', error)
      return null
    }

    // Transform the data
    return {
      ...profile,
      skills: profile.profile_skills?.map(ps => ({
        id: ps.skills.id,
        name: ps.skills.name,
        level: ps.level
      })) || [],
      classes: profile.profile_classes?.map(pc => ({
        id: pc.classes.id,
        code: pc.classes.code,
        title: pc.classes.title,
        role: pc.role
      })) || [],
      tags: profile.profile_tags?.map(pt => ({
        id: pt.tags.id,
        name: pt.tags.name
      })) || [],
      projects: profile.projects?.map(p => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        description: p.description,
        links: p.links,
        visibility: p.visibility
      })) || [],
      organizations: profile.links?.organizations || [],
      contentIngestion: profile.links?.contentIngestion || {
        podcasts: [],
        youtubeChannels: [],
        influencers: [],
        newsSources: []
      },
      favoriteTools: profile.links?.favoriteTools || [],
      wantToLearn: profile.links?.wantToLearn || [],
      hobbiesAndSports: profile.links?.hobbiesAndSports || []
    }
  } catch (error) {
    console.error('Error in getProfileById:', error)
    return null
  }
}

/**
 * Get all available skills for filtering
 */
export async function getAllSkills(): Promise<Skill[]> {
  try {
    const supabase = await createClient()
    
    const { data: skills, error } = await supabase
      .from('skills')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching skills:', error)
      return []
    }

    return skills || []
  } catch (error) {
    console.error('Error in getAllSkills:', error)
    return []
  }
}

/**
 * Get all available classes for filtering
 */
export async function getAllClasses(): Promise<Class[]> {
  try {
    const supabase = await createClient()
    
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('code')

    if (error) {
      console.error('Error fetching classes:', error)
      return []
    }

    return classes || []
  } catch (error) {
    console.error('Error in getAllClasses:', error)
    return []
  }
}
