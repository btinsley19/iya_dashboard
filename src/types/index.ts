export interface User {
  id: string
  name: string
  email: string
  location?: string
  hometown?: string
  year?: string
  cohort?: string
  modality?: 'in-person' | 'online' | 'hybrid'
  degree?: string
  bio?: string
  skills: string[]
  organizations: Organization[]
  interests: string[]
  hobbiesAndSports: string[]
  canTeach: string[]
  wantToLearn: string[]
  favoriteTools: FavoriteTool[]
  contentIngestion: ContentIngestion
  projects: Project[]
  classes: Class[]
  linkedinUrl?: string
  resumeUrl?: string
  personalWebsite?: string
  github?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  description: string
  role: 'admin' | 'member'
  status: 'active' | 'past'
  type: 'usc' | 'non-usc'
}

export interface FavoriteTool {
  id: string
  name: string
  description?: string
  categories: string[]
  link?: string
}

export interface ContentIngestion {
  podcasts: string[]
  youtubeChannels: string[]
  influencers: string[]
  newsSources: string[]
}

export interface Project {
  id: string
  title: string
  description: string
  url?: string
  technologies: string[]
  status: 'completed' | 'in-progress' | 'planned'
}

export interface Class {
  id: string
  name: string
  code: string
  instructor?: string | null
  semester?: string | null
  year?: number
}

export interface Community {
  id: string
  name: string
  description: string
  category: string
  members: string[]
  moderators: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  authorId: string
  author: User
  title: string
  content: string
  type: 'event' | 'collaboration' | 'update' | 'question'
  tags: string[]
  url?: string
  createdAt: Date
  updatedAt: Date
  likes: number
  comments: Comment[]
}

export interface Comment {
  id: string
  authorId: string
  author: User
  content: string
  createdAt: Date
  updatedAt: Date
  likes: number
}

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}
