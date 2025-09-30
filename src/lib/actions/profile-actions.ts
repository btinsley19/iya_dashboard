'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Get user profile with all related data
export async function getUserProfile(): Promise<{
  id: string
  name: string
  email: string
  location?: string | null
  hometown?: string | null
  year?: string | null
  cohort?: string | null
  modality?: string | null
  degree?: string | null
  bio?: string | null
  skills: string[]
  organizations: any[]
  interests: string[]
  hobbiesAndSports: string[]
  canTeach: string[]
  wantToLearn: string[]
  favoriteTools: any[]
  contentIngestion: {
    podcasts: string[]
    youtubeChannels: string[]
    influencers: string[]
    newsSources: string[]
  }
  projects: any[]
  classes: any[]
  linkedinUrl?: string | null
  resumeUrl?: string | null
  personalWebsite?: string | null
  github?: string | null
  avatar?: string | null
  createdAt: Date
  updatedAt: Date
}> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get basic profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  // Get user skills with proficiency levels
  const { data: userSkills, error: skillsError } = await supabase
    .from('profile_skills')
    .select(`
      level,
      skills (
        name,
        description
      )
    `)
    .eq('profile_id', user.id)

  if (skillsError) {
    console.error('Error fetching skills:', skillsError)
  }

  // Get user tags (interests)
  const { data: userTags, error: tagsError } = await supabase
    .from('profile_tags')
    .select(`
      tags (
        name,
        description
      )
    `)
    .eq('profile_id', user.id)

  if (tagsError) {
    console.error('Error fetching tags:', tagsError)
  }

  // Get user classes
  const { data: userClasses, error: classesError } = await supabase
    .from('profile_classes')
    .select(`
      role,
      classes (
        id,
        code,
        title,
        term,
        year,
        description
      )
    `)
    .eq('profile_id', user.id)

  if (classesError) {
    console.error('Error fetching classes:', classesError)
  }

  // Get user projects
  const { data: userProjects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      summary,
      description,
      links,
      created_at,
      updated_at
    `)
    .eq('owner_id', user.id)
    .eq('archived', false)

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
  }

  // Transform data to match frontend interface
  const transformedProfile = {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    location: profile.location || null,
    hometown: profile.hometown || null,
    year: profile.graduation_year?.toString() || null,
    cohort: profile.cohort || null,
    modality: profile.modality || null,
    degree: profile.degree || null,
    bio: profile.bio || null,
    skills: userSkills?.map(us => (us.skills as any)?.name).filter(Boolean) || [],
    organizations: profile.links?.organizations || [],
    interests: userTags?.map(ut => (ut.tags as any)?.name).filter(Boolean) || [],
    hobbiesAndSports: profile.links?.hobbiesAndSports || 
      // Backward compatibility: combine old separate fields if they exist
      [
        ...(profile.links?.activities || []),
        ...(profile.links?.hobbies || []),
        ...(profile.links?.sports || []),
        ...(profile.links?.freetime || [])
      ].filter((item, index, array) => array.indexOf(item) === index), // Remove duplicates
    canTeach: profile.links?.canTeach || [],
    wantToLearn: profile.links?.wantToLearn || [],
    favoriteTools: profile.links?.favoriteTools || [],
    contentIngestion: {
      podcasts: profile.links?.contentIngestion?.podcasts || [],
      youtubeChannels: profile.links?.contentIngestion?.youtubeChannels || [],
      influencers: profile.links?.contentIngestion?.influencers || [],
      newsSources: profile.links?.contentIngestion?.newsSources || []
    },
    projects: userProjects?.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description || project.summary || '',
      url: project.links?.url || null,
      technologies: project.links?.technologies || [],
      status: project.links?.status || 'planned'
    })) || [],
    classes: userClasses?.map(uc => ({
      id: (uc.classes as any)?.id || '',
      name: (uc.classes as any)?.title || '',
      code: (uc.classes as any)?.code || '',
      semester: (uc.classes as any)?.term ? `${(uc.classes as any).term} ${(uc.classes as any).year}` : null,
      year: (uc.classes as any)?.year
    })) || [],
    linkedinUrl: profile.links?.linkedin || null,
    resumeUrl: profile.links?.resume || null,
    personalWebsite: profile.links?.personalWebsite || null,
    github: profile.links?.github || null,
    avatar: profile.avatar_url,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at)
  }

  return transformedProfile
}

// Update basic profile information
export async function updateProfile(updates: {
  name?: string
  location?: string
  hometown?: string
  year?: string
  cohort?: string
  modality?: string
  degree?: string
  bio?: string
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}

  // Prepare update data
  const updateData: Record<string, string | number | Record<string, unknown>> = {}
  
  if (updates.name) {
    updateData.full_name = updates.name
  }
  
  if (updates.year) {
    updateData.graduation_year = parseInt(updates.year)
  }

  // Update direct columns (not in links JSONB)
  if (updates.location !== undefined) {
    updateData.location = updates.location
  }
  
  if (updates.hometown !== undefined) {
    updateData.hometown = updates.hometown
  }
  
  if (updates.cohort !== undefined) {
    updateData.cohort = updates.cohort
  }
  
  
  if (updates.modality !== undefined) {
    updateData.modality = updates.modality
  }
  
  if (updates.degree !== undefined) {
    updateData.degree = updates.degree
  }
  
  if (updates.bio !== undefined) {
    updateData.bio = updates.bio
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Add a skill to user profile
export async function addSkill(skillName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // First, get or create the skill
  const { data: existingSkill, error: skillError } = await supabase
    .from('skills')
    .select('id')
    .eq('name', skillName)
    .single()

  let skill = existingSkill

  if (skillError && skillError.code === 'PGRST116') {
    // Skill doesn't exist, create it
    const { data: newSkill, error: createError } = await supabase
      .from('skills')
      .insert({ name: skillName })
      .select('id')
      .single()

    if (createError) {
      throw new Error(`Failed to create skill: ${createError.message}`)
    }
    skill = newSkill
  } else if (skillError) {
    throw new Error(`Failed to fetch skill: ${skillError.message}`)
  }

  // Add skill to user profile
  const { error: profileSkillError } = await supabase
    .from('profile_skills')
    .insert({
      profile_id: user.id,
      skill_id: skill?.id,
      level: 1 // Default level
    })

  if (profileSkillError) {
    if (profileSkillError.code === '23505') {
      // Skill already exists for user
      return
    }
    throw new Error(`Failed to add skill to profile: ${profileSkillError.message}`)
  }

  revalidatePath('/profile')
}

// Remove a skill from user profile
export async function removeSkill(skillName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get skill ID
  const { data: skill, error: skillError } = await supabase
    .from('skills')
    .select('id')
    .eq('name', skillName)
    .single()

  if (skillError) {
    throw new Error(`Failed to fetch skill: ${skillError.message}`)
  }

  // Remove skill from user profile
  const { error } = await supabase
    .from('profile_skills')
    .delete()
    .eq('profile_id', user.id)
    .eq('skill_id', skill.id)

  if (error) {
    throw new Error(`Failed to remove skill from profile: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Add an interest (tag) to user profile
export async function addInterest(interestName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // First, get or create the tag
  const { data: existingTag, error: tagError } = await supabase
    .from('tags')
    .select('id')
    .eq('name', interestName)
    .single()

  let tag = existingTag

  if (tagError && tagError.code === 'PGRST116') {
    // Tag doesn't exist, create it
    const { data: newTag, error: createError } = await supabase
      .from('tags')
      .insert({ name: interestName })
      .select('id')
      .single()

    if (createError) {
      throw new Error(`Failed to create tag: ${createError.message}`)
    }
    tag = newTag
  } else if (tagError) {
    throw new Error(`Failed to fetch tag: ${tagError.message}`)
  }

  // Add tag to user profile
  const { error: profileTagError } = await supabase
    .from('profile_tags')
    .insert({
      profile_id: user.id,
      tag_id: tag?.id
    })

  if (profileTagError) {
    if (profileTagError.code === '23505') {
      // Tag already exists for user
      return
    }
    throw new Error(`Failed to add interest to profile: ${profileTagError.message}`)
  }

  revalidatePath('/profile')
}

// Remove an interest (tag) from user profile
export async function removeInterest(interestName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get tag ID
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('id')
    .eq('name', interestName)
    .single()

  if (tagError) {
    throw new Error(`Failed to fetch tag: ${tagError.message}`)
  }

  // Remove tag from user profile
  const { error } = await supabase
    .from('profile_tags')
    .delete()
    .eq('profile_id', user.id)
    .eq('tag_id', tag.id)

  if (error) {
    throw new Error(`Failed to remove interest from profile: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update LinkedIn URL
export async function updateLinkedInUrl(url: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const newLinks = {
    ...currentLinks,
    linkedin: url
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update LinkedIn URL: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update resume URL
export async function updateResumeUrl(url: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const newLinks = {
    ...currentLinks,
    resume: url
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update resume URL: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Project management functions

// Add a new project
export async function addProject(projectData: {
  title: string
  description?: string
  url?: string
  technologies?: string[]
  status?: 'completed' | 'in-progress' | 'planned'
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: projectData.title,
      summary: projectData.description,
      description: projectData.description,
      owner_id: user.id,
      visibility: 'public',
      links: {
        url: projectData.url,
        technologies: projectData.technologies || [],
        status: projectData.status || 'completed'
      }
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }

  // Return the created project in the format expected by the frontend
  return {
    id: data.id,
    title: data.title,
    description: data.description || data.summary || '',
    url: data.links?.url || null,
    technologies: data.links?.technologies || [],
    status: data.links?.status || 'completed'
  }

  // Note: Removed revalidatePath to prevent page refresh - using optimistic updates instead
}

// Update an existing project
export async function updateProject(projectId: string, updates: {
  title?: string
  description?: string
  url?: string
  technologies?: string[]
  status?: 'completed' | 'in-progress' | 'planned'
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current project to merge with existing links
  const { data: currentProject, error: currentError } = await supabase
    .from('projects')
    .select('links')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current project: ${currentError.message}`)
  }

  const currentLinks = currentProject.links || {}

  // Prepare update data
  const updateData: Record<string, string | Record<string, unknown>> = {}
  
  if (updates.title) {
    updateData.title = updates.title
  }
  
  if (updates.description) {
    updateData.summary = updates.description
    updateData.description = updates.description
  }

  // Update links with new values
  const newLinks = {
    ...currentLinks,
    ...(updates.url && { url: updates.url }),
    ...(updates.technologies && { technologies: updates.technologies }),
    ...(updates.status && { status: updates.status })
  }

  updateData.links = newLinks

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)
    .eq('owner_id', user.id)

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Delete a project
export async function deleteProject(projectId: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Check if this is a demo/temp project ID that shouldn't be deleted from database
  if (projectId.startsWith('demo-project-') || projectId.startsWith('temp-project-')) {
    // This is a demo/temp project, just return success (it's only in the UI)
    return
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(projectId)) {
    throw new Error('Invalid project ID format')
  }

  // Try to delete the project directly - RLS policies will handle authorization
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('owner_id', user.id)

  if (error) {
    // If RLS is causing issues, provide a more helpful error message
    if (error.message.includes('infinite recursion') || error.message.includes('policy')) {
      throw new Error('Database policy error. Please contact an administrator to fix the database policies.')
    }
    throw new Error(`Failed to delete project: ${error.message}`)
  }

  // Note: Removed revalidatePath to prevent page refresh - using optimistic updates instead
}

// Class management functions

// Add a class to user profile
export async function addClass(classData: {
  classId: string
  role: 'ta' | 'mentor'
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profile_classes')
    .insert({
      profile_id: user.id,
      class_id: classData.classId,
      role: classData.role
    })

  if (error) {
    if (error.code === '23505') {
      // Class already exists for user
      return
    }
    throw new Error(`Failed to add class to profile: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Remove a class from user profile
export async function removeClass(classId: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profile_classes')
    .delete()
    .eq('profile_id', user.id)
    .eq('class_id', classId)

  if (error) {
    throw new Error(`Failed to remove class from profile: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Get available classes for selection
export async function getAvailableClasses() {
  const supabase = await createClient()

  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .order('code')

  if (error) {
    throw new Error(`Failed to fetch classes: ${error.message}`)
  }

  return classes
}

// Can Teach / Want to Learn functions

// Add a skill to canTeach
export async function addCanTeach(skillName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const canTeach = currentLinks.canTeach || []

  if (!canTeach.includes(skillName)) {
    const newLinks = {
      ...currentLinks,
      canTeach: [...canTeach, skillName]
    }

    const { error } = await supabase
      .from('profiles')
      .update({ links: newLinks })
      .eq('id', user.id)

    if (error) {
      throw new Error(`Failed to update canTeach: ${error.message}`)
    }
  }

  // Note: Removed revalidatePath to prevent page refresh - using optimistic updates instead
}

// Remove a skill from canTeach
export async function removeCanTeach(skillName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const canTeach = currentLinks.canTeach || []

  const newLinks = {
    ...currentLinks,
    canTeach: canTeach.filter((skill: string) => skill !== skillName)
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update canTeach: ${error.message}`)
  }

  // Note: Removed revalidatePath to prevent page refresh - using optimistic updates instead
}

// Add a skill to wantToLearn
export async function addWantToLearn(skillName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const wantToLearn = currentLinks.wantToLearn || []

  if (!wantToLearn.includes(skillName)) {
    const newLinks = {
      ...currentLinks,
      wantToLearn: [...wantToLearn, skillName]
    }

    const { error } = await supabase
      .from('profiles')
      .update({ links: newLinks })
      .eq('id', user.id)

    if (error) {
      throw new Error(`Failed to update wantToLearn: ${error.message}`)
    }
  }

  // Note: Removed revalidatePath to prevent page refresh - using optimistic updates instead
}

// Remove a skill from wantToLearn
export async function removeWantToLearn(skillName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const wantToLearn = currentLinks.wantToLearn || []

  const newLinks = {
    ...currentLinks,
    wantToLearn: wantToLearn.filter((skill: string) => skill !== skillName)
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update wantToLearn: ${error.message}`)
  }

  // Note: Removed revalidatePath to prevent page refresh - using optimistic updates instead
}

// Hobbies and Sports management functions

// Add a hobby or sport
export async function addHobbyOrSport(itemName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  
  // Check if we need to migrate old data structure
  const hasOldStructure = currentLinks.activities || currentLinks.hobbies || currentLinks.sports || currentLinks.freetime
  const hasNewStructure = currentLinks.hobbiesAndSports
  
  let hobbiesAndSports = currentLinks.hobbiesAndSports || []
  
  // Migrate old data if it exists and we don't have new structure
  if (hasOldStructure && !hasNewStructure) {
    hobbiesAndSports = [
      ...(currentLinks.activities || []),
      ...(currentLinks.hobbies || []),
      ...(currentLinks.sports || []),
      ...(currentLinks.freetime || [])
    ].filter((item, index, array) => array.indexOf(item) === index) // Remove duplicates
  }

  if (!hobbiesAndSports.includes(itemName)) {
    const newLinks = {
      ...currentLinks,
      hobbiesAndSports: [...hobbiesAndSports, itemName],
      // Remove old fields if they existed (migration cleanup)
      ...(hasOldStructure && !hasNewStructure ? {
        activities: undefined,
        hobbies: undefined,
        sports: undefined,
        freetime: undefined
      } : {})
    }

    const { error } = await supabase
      .from('profiles')
      .update({ links: newLinks })
      .eq('id', user.id)

    if (error) {
      throw new Error(`Failed to update hobbies and sports: ${error.message}`)
    }
  }
}

// Remove a hobby or sport
export async function removeHobbyOrSport(itemName: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const hobbiesAndSports = currentLinks.hobbiesAndSports || []

  const newLinks = {
    ...currentLinks,
    hobbiesAndSports: hobbiesAndSports.filter((item: string) => item !== itemName)
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update hobbies and sports: ${error.message}`)
  }
}

// Favorite Tools management functions

// Add a favorite tool
export async function addFavoriteTool(tool: { 
  name: string; 
  description?: string; 
  categories: string[]; 
  link?: string 
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const favoriteTools = currentLinks.favoriteTools || []

  const newTool = {
    id: `tool-${Date.now()}`,
    name: tool.name,
    description: tool.description || '',
    categories: tool.categories || [],
    link: tool.link || ''
  }

  const newLinks = {
    ...currentLinks,
    favoriteTools: [...favoriteTools, newTool]
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update favorite tools: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update favorite tool
export async function updateFavoriteTool(toolId: string, tool: {
  name: string
  description?: string
  categories: string[]
  link?: string
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const favoriteTools = currentLinks.favoriteTools || []

  const updatedTools = favoriteTools.map((t: any) => 
    t.id === toolId 
      ? { ...t, ...tool }
      : t
  )

  const newLinks = {
    ...currentLinks,
    favoriteTools: updatedTools
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update favorite tool: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Remove a favorite tool
export async function removeFavoriteTool(toolId: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const favoriteTools = currentLinks.favoriteTools || []

  const newLinks = {
    ...currentLinks,
    favoriteTools: favoriteTools.filter((tool: any) => tool.id !== toolId)
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update favorite tools: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Content Ingestion management functions

// Update content ingestion
export async function updateContentIngestion(contentIngestion: {
  podcasts?: string[]
  youtubeChannels?: string[]
  influencers?: string[]
  newsSources?: string[]
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const currentContentIngestion = currentLinks.contentIngestion || {
    podcasts: [],
    youtubeChannels: [],
    influencers: [],
    newsSources: []
  }

  const newContentIngestion = {
    ...currentContentIngestion,
    ...contentIngestion
  }

  const newLinks = {
    ...currentLinks,
    contentIngestion: newContentIngestion
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update content ingestion: ${error.message}`)
  }
}

// Organization management functions

// Add organization
export async function addOrganization(organization: {
  name: string
  description: string
  role: 'admin' | 'member'
  status: 'active' | 'past'
  type: 'usc' | 'non-usc'
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const organizations = currentLinks.organizations || []

  const newOrganization = {
    id: `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: organization.name,
    description: organization.description,
    role: organization.role,
    status: organization.status,
    type: organization.type
  }

  const newLinks = {
    ...currentLinks,
    organizations: [...organizations, newOrganization]
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to add organization: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Remove organization
export async function removeOrganization(organizationId: string) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const organizations = currentLinks.organizations || []

  const newLinks = {
    ...currentLinks,
    organizations: organizations.filter((org: any) => org.id !== organizationId)
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to remove organization: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update organization
export async function updateOrganization(organizationId: string, organization: {
  name: string
  description: string
  role: 'admin' | 'member'
  status: 'active' | 'past'
  type: 'usc' | 'non-usc'
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const organizations = currentLinks.organizations || []

  const updatedOrganizations = organizations.map((org: any) => 
    org.id === organizationId 
      ? { ...org, ...organization }
      : org
  )

  const newLinks = {
    ...currentLinks,
    organizations: updatedOrganizations
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update organization: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update favorite tool
export async function updateTool(toolId: string, tool: {
  name: string
  description: string
  categories: string[]
  link: string
}) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to merge with existing links
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const favoriteTools = currentLinks.favoriteTools || []

  const updatedTools = favoriteTools.map((t: any) => 
    t.id === toolId 
      ? { ...t, ...tool }
      : t
  )

  const newLinks = {
    ...currentLinks,
    favoriteTools: updatedTools
  }

  const { error } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update tool: ${error.message}`)
  }

  revalidatePath('/profile')
}
