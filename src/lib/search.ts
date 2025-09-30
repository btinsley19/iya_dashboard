import { createClient } from '@/lib/supabase/server'

export interface SearchResult {
  id: string
  type: 'profile' | 'project' | 'class' | 'event'
  title: string
  description: string
  score?: number
  metadata?: any
}

export interface SearchFilters {
  skills?: string[]
  tags?: string[]
  graduation_year?: number
  major?: string
  status?: string
  visibility?: string
}

// Keyword search using PostgreSQL full-text search
export async function keywordSearch(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<SearchResult[]> {
  const supabase = await createClient()
  const results: SearchResult[] = []

  // Search profiles
  let profileQuery = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      bio,
      graduation_year,
      major,
      status
    `)
    .textSearch('full_name', query, { type: 'websearch' })
    .eq('status', 'active')

  if (filters.graduation_year) {
    profileQuery = profileQuery.eq('graduation_year', filters.graduation_year)
  }

  if (filters.major) {
    profileQuery = profileQuery.ilike('major', `%${filters.major}%`)
  }

  const { data: profiles } = await profileQuery.limit(limit)

  if (profiles) {
    results.push(...profiles.map(profile => ({
      id: profile.id,
      type: 'profile' as const,
      title: profile.full_name,
      description: profile.bio || `${profile.major} • Class of ${profile.graduation_year}`,
      metadata: {
        graduation_year: profile.graduation_year,
        major: profile.major,
        status: profile.status
      }
    })))
  }

  // Search projects
  let projectQuery = supabase
    .from('projects')
    .select(`
      id,
      title,
      summary,
      description,
      visibility
    `)
    .textSearch('title', query, { type: 'websearch' })
    .eq('archived', false)

  if (filters.visibility) {
    projectQuery = projectQuery.eq('visibility', filters.visibility)
  }

  const { data: projects } = await projectQuery.limit(limit)

  if (projects) {
    results.push(...projects.map(project => ({
      id: project.id,
      type: 'project' as const,
      title: project.title,
      description: project.summary || project.description || 'No description available',
      metadata: {
        visibility: project.visibility
      }
    })))
  }

  // Search classes
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id,
      title,
      code,
      description
    `)
    .textSearch('title', query, { type: 'websearch' })
    .limit(limit)

  if (classes) {
    results.push(...classes.map(cls => ({
      id: cls.id,
      type: 'class' as const,
      title: cls.title,
      description: `${cls.code} • ${cls.description || 'No description available'}`,
      metadata: {
        code: cls.code
      }
    })))
  }

  // Search events
  const { data: events } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      start_time,
      location
    `)
    .textSearch('title', query, { type: 'websearch' })
    .eq('archived', false)
    .gte('start_time', new Date().toISOString())
    .limit(limit)

  if (events) {
    results.push(...events.map(event => ({
      id: event.id,
      type: 'event' as const,
      title: event.title,
      description: event.description || `${event.location} • ${new Date(event.start_time).toLocaleDateString()}`,
      metadata: {
        start_time: event.start_time,
        location: event.location
      }
    })))
  }

  return results
}

// Semantic search using pgvector embeddings
export async function semanticSearch(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<SearchResult[]> {
  const supabase = await createClient()

  // For now, we'll use a simple keyword search as a fallback
  // In a real implementation, you would:
  // 1. Generate an embedding for the query using OpenAI or similar
  // 2. Use pgvector to find similar documents
  // 3. Return ranked results based on cosine similarity

  // This is a placeholder implementation
  return keywordSearch(query, filters, limit)
}

// Hybrid search combining keyword and semantic results
export async function hybridSearch(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<SearchResult[]> {
  const [keywordResults, semanticResults] = await Promise.all([
    keywordSearch(query, filters, limit),
    semanticSearch(query, filters, limit)
  ])

  // Combine and deduplicate results
  const combined = new Map<string, SearchResult>()

  // Add keyword results with higher weight
  keywordResults.forEach(result => {
    combined.set(result.id, { ...result, score: (result.score || 0) + 1 })
  })

  // Add semantic results
  semanticResults.forEach(result => {
    const existing = combined.get(result.id)
    if (existing) {
      existing.score = (existing.score || 0) + 0.5
    } else {
      combined.set(result.id, { ...result, score: 0.5 })
    }
  })

  // Sort by score and return top results
  return Array.from(combined.values())
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit)
}

// Search with filters for the directory page
export async function searchDirectory(
  query: string = '',
  filters: SearchFilters = {},
  limit: number = 50
) {
  const supabase = await createClient()

  let query_builder = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      bio,
      graduation_year,
      major,
      avatar_url,
      status,
      created_at
    `)
    .eq('status', 'active')

  // Apply text search if query provided
  if (query.trim()) {
    query_builder = query_builder.textSearch('full_name', query, { type: 'websearch' })
  }

  // Apply filters
  if (filters.graduation_year) {
    query_builder = query_builder.eq('graduation_year', filters.graduation_year)
  }

  if (filters.major) {
    query_builder = query_builder.ilike('major', `%${filters.major}%`)
  }

  // Apply skill filters if provided
  if (filters.skills && filters.skills.length > 0) {
    query_builder = query_builder
      .select(`
        id,
        full_name,
        bio,
        graduation_year,
        major,
        avatar_url,
        status,
        created_at,
        profile_skills!inner(skill_id, skills!inner(name))
      `)
      .in('profile_skills.skills.name', filters.skills)
  }

  const { data: profiles, error } = await query_builder
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching directory:', error)
    return []
  }

  return profiles || []
}
