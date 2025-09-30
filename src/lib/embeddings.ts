import { createClient } from '@/lib/supabase/server'

// This is a placeholder for the embedding generation
// In a real implementation, you would integrate with OpenAI, Cohere, or another embedding service
export async function generateEmbedding(_text: string): Promise<number[]> {
  // Placeholder: return a random vector for demonstration
  // In production, you would call an embedding API like:
  // const response = await fetch('https://api.openai.com/v1/embeddings', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     input: text,
  //     model: 'text-embedding-ada-002',
  //   }),
  // })
  // const data = await response.json()
  // return data.data[0].embedding

  // For now, return a mock 1536-dimensional vector
  return Array.from({ length: 1536 }, () => Math.random() - 0.5)
}

export async function createDocumentEmbedding(
  entityType: 'profile' | 'project' | 'class' | 'event' | 'note' | 'post',
  entityId: string,
  title: string,
  content: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient()

  // Create or update the document
  const { data: document, error: docError } = await supabase
    .from('documents')
    .upsert({
      entity_type: entityType,
      entity_id: entityId,
      title,
      content_text: content,
      metadata,
    })
    .select()
    .single()

  if (docError) {
    throw new Error(`Failed to create document: ${docError.message}`)
  }

  // Generate embedding
  const embedding = await generateEmbedding(`${title}\n\n${content}`)

  // Store the embedding
  const { error: embedError } = await supabase
    .from('document_embeddings')
    .upsert({
      doc_id: document.id,
      embedding,
      provider: 'openai',
      model: 'text-embedding-ada-002',
    })

  if (embedError) {
    throw new Error(`Failed to store embedding: ${embedError.message}`)
  }

  return document
}

export async function updateProfileEmbedding(profileId: string) {
  const supabase = await createClient()

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      bio,
      graduation_year,
      major,
      profile_skills(skills(name)),
      profile_tags(tags(name))
    `)
    .eq('id', profileId)
    .single()

  if (profileError || !profile) {
    throw new Error(`Failed to fetch profile: ${profileError?.message}`)
  }

  // Build content for embedding
  const skills = profile.profile_skills?.map((ps: { skills: { name: unknown }[] }) => (ps.skills[0] as { name: string })?.name).filter(Boolean).join(', ') || ''
  const tags = profile.profile_tags?.map((pt: { tags: { name: unknown }[] }) => (pt.tags[0] as { name: string })?.name).filter(Boolean).join(', ') || ''
  
  const content = [
    profile.full_name,
    profile.bio || '',
    `Graduation year: ${profile.graduation_year || 'Not specified'}`,
    `Major: ${profile.major || 'Not specified'}`,
    `Skills: ${skills}`,
    `Interests: ${tags}`
  ].filter(Boolean).join('\n')

  return createDocumentEmbedding(
    'profile',
    profileId,
    profile.full_name,
    content,
    {
      graduation_year: profile.graduation_year,
      major: profile.major,
      skills: skills.split(', ').filter(Boolean),
      tags: tags.split(', ').filter(Boolean)
    }
  )
}

export async function updateProjectEmbedding(projectId: string) {
  const supabase = await createClient()

  // Get project data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      summary,
      description,
      project_tags(tags(name))
    `)
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    throw new Error(`Failed to fetch project: ${projectError?.message}`)
  }

  // Build content for embedding
  const tags = project.project_tags?.map((pt: { tags: { name: unknown }[] }) => (pt.tags[0] as { name: string })?.name).filter(Boolean).join(', ') || ''
  
  const content = [
    project.title,
    project.summary || '',
    project.description || '',
    `Tags: ${tags}`
  ].filter(Boolean).join('\n')

  return createDocumentEmbedding(
    'project',
    projectId,
    project.title,
    content,
    {
      tags: tags.split(', ').filter(Boolean)
    }
  )
}

export async function updateClassEmbedding(classId: string) {
  const supabase = await createClient()

  // Get class data
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single()

  if (classError || !classData) {
    throw new Error(`Failed to fetch class: ${classError?.message}`)
  }

  // Build content for embedding
  const content = [
    classData.title,
    classData.code,
    classData.description || '',
    `School: ${classData.school}`,
    `Term: ${classData.term || 'Not specified'}`,
    `Year: ${classData.year || 'Not specified'}`
  ].filter(Boolean).join('\n')

  return createDocumentEmbedding(
    'class',
    classId,
    classData.title,
    content,
    {
      code: classData.code,
      school: classData.school,
      term: classData.term,
      year: classData.year
    }
  )
}

export async function updateEventEmbedding(eventId: string) {
  const supabase = await createClient()

  // Get event data
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    throw new Error(`Failed to fetch event: ${eventError?.message}`)
  }

  // Build content for embedding
  const content = [
    event.title,
    event.description || '',
    `Location: ${event.location || 'Not specified'}`,
    `Start time: ${new Date(event.start_time).toLocaleString()}`,
    event.end_time ? `End time: ${new Date(event.end_time).toLocaleString()}` : ''
  ].filter(Boolean).join('\n')

  return createDocumentEmbedding(
    'event',
    eventId,
    event.title,
    content,
    {
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location
    }
  )
}

// Semantic search using vector similarity
export async function semanticVectorSearch(
  query: string,
  limit: number = 20
): Promise<Array<Record<string, unknown>>> {
  const supabase = await createClient()

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query)

  // Search for similar documents using vector similarity
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit
  })

  if (error) {
    console.error('Error in semantic search:', error)
    return []
  }

  return data || []
}

// Create the match_documents function in the database
export const createMatchDocumentsFunction = `
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  entity_type entity_type,
  entity_id uuid,
  title text,
  content_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.entity_type,
    d.entity_id,
    d.title,
    d.content_text,
    1 - (de.embedding <=> query_embedding) as similarity
  FROM documents d
  JOIN document_embeddings de ON d.id = de.doc_id
  WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
`
