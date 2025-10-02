'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Organization, FavoriteTool, Project, Class } from '@/types'

// Get user profile with all related data (simplified structure)
export async function getUserProfile(): Promise<{
  id: string
  name: string
  email: string
  location?: string | null
  hometown?: string | null
  year?: string | null
  cohort?: string | null
  modality?: string | null
  bio?: string | null
  skills: string[]
  organizations: Organization[]
  interests: string[]
  hobbiesAndSports: string[]
  canTeach: string[]
  wantToLearn: string[]
  favoriteTools: FavoriteTool[]
  contentIngestion: {
    podcasts: string[]
    youtubeChannels: string[]
    influencers: string[]
    newsSources: string[]
  }
  projects: Project[]
  classes: Class[]
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

  // Get user classes (simplified - no roles)
  const { data: userClasses, error: classesError } = await supabase
    .from('profile_classes')
    .select(`
      classes (
        id,
        code,
        title,
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

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
  }

  // Extract data from links JSONB
  const links = profile.links as any || {}
  
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
    bio: profile.bio || null,
    skills: links.skills || [],
    organizations: links.organizations || [],
    interests: links.interests || [],
    hobbiesAndSports: links.hobbiesAndSports || [],
    canTeach: links.canTeach || [],
    wantToLearn: links.wantToLearn || [],
    favoriteTools: links.favoriteTools || [],
    contentIngestion: links.contentIngestion || {
      podcasts: [],
      youtubeChannels: [],
      influencers: [],
      newsSources: []
    },
    projects: (userProjects || []).map(project => ({
      id: project.id,
      title: project.title,
      description: project.description || '',
      url: project.links?.url || '',
      technologies: project.links?.technologies || [],
      status: project.links?.status || 'completed'
    })),
    classes: (userClasses || []).map((userClass: any) => ({
      id: userClass.classes.id,
      title: userClass.classes.title,
      code: userClass.classes.code,
      description: userClass.classes.description,
      term: null, // Not used in new structure
      year: null, // Not used in new structure
      semester: null, // Not used in new structure
      instructor: null // Not used in new structure
    })),
    linkedinUrl: links.linkedin || null,
    resumeUrl: links.resume || null,
    personalWebsite: links.personalWebsite || null,
    github: links.github || null,
    avatar: profile.avatar_url || null,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at)
  }

  return transformedProfile
}

// Update skills in links JSONB
export async function updateSkills(skills: string[]): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update skills in links
  const updatedLinks = {
    ...currentLinks,
    skills: skills
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update skills: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update interests in links JSONB
export async function updateInterests(interests: string[]): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update interests in links
  const updatedLinks = {
    ...currentLinks,
    interests: interests
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update interests: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update hobbies and sports in links JSONB
export async function updateHobbiesAndSports(hobbiesAndSports: string[]): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update hobbies and sports in links
  const updatedLinks = {
    ...currentLinks,
    hobbiesAndSports: hobbiesAndSports
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update hobbies and sports: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update want to learn in links JSONB
export async function updateWantToLearn(wantToLearn: string[]): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update want to learn in links
  const updatedLinks = {
    ...currentLinks,
    wantToLearn: wantToLearn
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update want to learn: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update can teach in links JSONB
export async function updateCanTeach(canTeach: string[]): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update can teach in links
  const updatedLinks = {
    ...currentLinks,
    canTeach: canTeach
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update can teach: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update organizations in links JSONB
export async function updateOrganizations(organizations: Organization[]): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update organizations in links
  const updatedLinks = {
    ...currentLinks,
    organizations: organizations
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update organizations: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update favorite tools in links JSONB
export async function updateFavoriteTools(favoriteTools: FavoriteTool[]): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update favorite tools in links
  const updatedLinks = {
    ...currentLinks,
    favoriteTools: favoriteTools
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update favorite tools: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update content ingestion in links JSONB
export async function updateContentIngestion(contentIngestion: {
  podcasts: string[]
  youtubeChannels: string[]
  influencers: string[]
  newsSources: string[]
}): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update content ingestion in links
  const updatedLinks = {
    ...currentLinks,
    contentIngestion: contentIngestion
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update content ingestion: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update basic profile info
export async function updateProfileInfo(data: {
  full_name?: string
  bio?: string | null
  location?: string | null
  hometown?: string | null
  cohort?: string
  modality?: 'in-person' | 'online' | 'hybrid' | null
  graduation_year?: number
}): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Filter out undefined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { error } = await supabase
    .from('profiles')
    .update({ 
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Update links (social media, etc.)
export async function updateLinks(links: {
  linkedin?: string
  github?: string
  personalWebsite?: string
  resume?: string
}): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current links
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  
  // Update links
  const updatedLinks = {
    ...currentLinks,
    ...links
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      links: updatedLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update links: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Add/remove classes (simplified - no roles)
export async function addClass(classId: string): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profile_classes')
    .insert({
      profile_id: user.id,
      class_id: classId
    })

  if (error) {
    throw new Error(`Failed to add class: ${error.message}`)
  }

  revalidatePath('/profile')
}

export async function removeClass(classId: string): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profile_classes')
    .delete()
    .eq('profile_id', user.id)
    .eq('class_id', classId)

  if (error) {
    throw new Error(`Failed to remove class: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Project management (unchanged)
export async function createProject(project: {
  title: string
  summary?: string
  description?: string
  links?: any
}): Promise<Project> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,
      title: project.title,
      summary: project.summary,
      description: project.description,
      links: project.links || {}
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }

  // Transform database project to frontend Project interface
  const result: Project = {
    id: data.id,
    title: data.title,
    description: data.description || '',
    url: data.links?.url || undefined,
    technologies: data.links?.technologies || [],
    status: data.links?.status || 'planned'
  }

  revalidatePath('/profile')
  return result
}

export async function updateProject(projectId: string, updates: {
  title?: string
  summary?: string
  description?: string
  links?: any
}): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .eq('owner_id', user.id)

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`)
  }

  revalidatePath('/profile')
}

export async function deleteProject(projectId: string): Promise<void> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('owner_id', user.id)

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`)
  }

  revalidatePath('/profile')
}

// Legacy function names for backward compatibility
export const updateProfile = updateProfileInfo
export const addSkill = async (skill: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current skills
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentSkills = currentLinks.skills || []
  
  // Add new skill if not already present
  if (!currentSkills.includes(skill)) {
    await updateSkills([...currentSkills, skill])
  }
}

export const removeSkill = async (skill: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current skills
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentSkills = currentLinks.skills || []
  
  // Remove skill
  await updateSkills(currentSkills.filter((s: string) => s !== skill))
}

export const addInterest = async (interest: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current interests
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentInterests = currentLinks.interests || []
  
  // Add new interest if not already present
  if (!currentInterests.includes(interest)) {
    await updateInterests([...currentInterests, interest])
  }
}

export const removeInterest = async (interest: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current interests
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentInterests = currentLinks.interests || []
  
  // Remove interest
  await updateInterests(currentInterests.filter((i: string) => i !== interest))
}

export const addHobbyOrSport = async (hobby: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current hobbies and sports
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentHobbies = currentLinks.hobbiesAndSports || []
  
  // Add new hobby if not already present
  if (!currentHobbies.includes(hobby)) {
    await updateHobbiesAndSports([...currentHobbies, hobby])
  }
}

export const removeHobbyOrSport = async (hobby: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current hobbies and sports
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentHobbies = currentLinks.hobbiesAndSports || []
  
  // Remove hobby
  await updateHobbiesAndSports(currentHobbies.filter((h: string) => h !== hobby))
}

export const addFavoriteTool = async (tool: FavoriteTool) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current tools
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentTools = currentLinks.favoriteTools || []
  
  // Add new tool
  await updateFavoriteTools([...currentTools, tool])
}

export const removeFavoriteTool = async (toolId: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current tools
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentTools = currentLinks.favoriteTools || []
  
  // Remove tool
  await updateFavoriteTools(currentTools.filter((t: FavoriteTool) => t.id !== toolId))
}
export const updateLinkedInUrl = async (url: string) => await updateLinks({ linkedin: url })
export const updateResumeUrl = async (url: string) => await updateLinks({ resume: url })
export const updatePersonalWebsite = async (url: string) => await updateLinks({ personalWebsite: url })
export const updateGithub = async (url: string) => await updateLinks({ github: url })
export const addProject = createProject
export const getAvailableClasses = getAllClasses
export const addCanTeach = async (skill: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current canTeach
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentCanTeach = currentLinks.canTeach || []
  
  // Add new skill if not already present
  if (!currentCanTeach.includes(skill)) {
    await updateCanTeach([...currentCanTeach, skill])
  }
}

export const removeCanTeach = async (skill: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current canTeach
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentCanTeach = currentLinks.canTeach || []
  
  // Remove skill
  await updateCanTeach(currentCanTeach.filter((s: string) => s !== skill))
}

export const addWantToLearn = async (skill: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current wantToLearn
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentWantToLearn = currentLinks.wantToLearn || []
  
  // Add new skill if not already present
  if (!currentWantToLearn.includes(skill)) {
    await updateWantToLearn([...currentWantToLearn, skill])
  }
}

export const removeWantToLearn = async (skill: string) => {
  const user = await requireActiveUser()
  const supabase = await createClient()
  
  // Get current wantToLearn
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  const currentLinks = (profile.links as any) || {}
  const currentWantToLearn = currentLinks.wantToLearn || []
  
  // Remove skill
  await updateWantToLearn(currentWantToLearn.filter((s: string) => s !== skill))
}
export const addOrganization = async (org: Omit<Organization, 'id'>) => {
  const newOrg: Organization = {
    ...org,
    id: crypto.randomUUID()
  }
  return await updateOrganizations([newOrg])
}
export const removeOrganization = async (orgId: string) => await updateOrganizations([]) // Will be handled by UI
export const updateOrganization = updateOrganizations
export const updateTool = updateFavoriteTools

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

  return classes.map((cls: any) => ({
    id: cls.id,
    title: cls.title,
    code: cls.code,
    description: cls.description,
    term: null,
    year: null,
    semester: null,
    instructor: null
  }))
}
