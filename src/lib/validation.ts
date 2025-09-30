// Validation utilities for the profile system

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Validate email format
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email.trim()) {
    errors.push('Email is required')
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate LinkedIn URL
export function validateLinkedInUrl(url: string): ValidationResult {
  const errors: string[] = []
  
  if (url.trim()) {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    if (!linkedinRegex.test(url)) {
      errors.push('Please enter a valid LinkedIn profile URL')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate project data
export function validateProject(project: {
  title: string
  description?: string
  url?: string
  technologies?: string[]
}): ValidationResult {
  const errors: string[] = []
  
  if (!project.title.trim()) {
    errors.push('Project title is required')
  } else if (project.title.length > 100) {
    errors.push('Project title must be less than 100 characters')
  }
  
  if (project.description && project.description.length > 1000) {
    errors.push('Project description must be less than 1000 characters')
  }
  
  if (project.technologies && project.technologies.length > 20) {
    errors.push('Maximum 20 technologies allowed')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate project URL separately
export function validateProjectUrl(url: string): ValidationResult {
  const errors: string[] = []
  
  if (url && url.trim()) {
    try {
      new URL(url)
    } catch {
      errors.push('Please enter a valid project URL')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate skill name
export function validateSkill(skill: string): ValidationResult {
  const errors: string[] = []
  
  if (!skill.trim()) {
    errors.push('Skill name is required')
  } else if (skill.length > 50) {
    errors.push('Skill name must be less than 50 characters')
  } else if (skill.length < 2) {
    errors.push('Skill name must be at least 2 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate interest/tag name
export function validateInterest(interest: string): ValidationResult {
  const errors: string[] = []
  
  if (!interest.trim()) {
    errors.push('Interest name is required')
  } else if (interest.length > 50) {
    errors.push('Interest name must be less than 50 characters')
  } else if (interest.length < 2) {
    errors.push('Interest name must be at least 2 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate graduation year
export function validateGraduationYear(year: string): ValidationResult {
  const errors: string[] = []
  
  if (year.trim()) {
    const yearNum = parseInt(year)
    const currentYear = new Date().getFullYear()
    
    if (isNaN(yearNum)) {
      errors.push('Please enter a valid year')
    } else if (yearNum < 1900 || yearNum > currentYear + 10) {
      errors.push(`Year must be between 1900 and ${currentYear + 10}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate profile basic info
export function validateProfileInfo(profile: {
  name: string
  location?: string
  hometown?: string
  year?: string
  cohort?: string
}): ValidationResult {
  const errors: string[] = []
  
  if (!profile.name.trim()) {
    errors.push('Name is required')
  } else if (profile.name.length > 100) {
    errors.push('Name must be less than 100 characters')
  }
  
  if (profile.location && profile.location.length > 100) {
    errors.push('Location must be less than 100 characters')
  }
  
  if (profile.hometown && profile.hometown.length > 100) {
    errors.push('Hometown must be less than 100 characters')
  }
  
  if (profile.cohort && profile.cohort.length > 50) {
    errors.push('Cohort must be less than 50 characters')
  }
  
  const yearValidation = validateGraduationYear(profile.year || '')
  if (!yearValidation.isValid) {
    errors.push(...yearValidation.errors)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Sanitize input text
export function sanitizeText(text: string): string {
  return text.trim().replace(/[<>]/g, '')
}

// Format error message for display
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}
