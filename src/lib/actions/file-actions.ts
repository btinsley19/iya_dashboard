'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error?: string }> {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = new Uint8Array(arrayBuffer)

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${user.id}/${path}`, fileBuffer, {
      contentType: file.type,
      upsert: true // Replace existing file
    })

  if (error) {
    return { url: '', error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return { url: urlData.publicUrl }
}

// Upload resume file
export async function uploadResume(file: File) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Resume must be a PDF file')
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Resume file must be smaller than 5MB')
  }

  // Upload file
  const result = await uploadFile(file, 'resumes', `resume-${Date.now()}.pdf`)
  
  if (result.error) {
    throw new Error(`Failed to upload resume: ${result.error}`)
  }

  // Update user profile with resume URL
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
    resume: result.url
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update profile with resume URL: ${updateError.message}`)
  }

  revalidatePath('/profile')
  return { url: result.url }
}

// Upload avatar image
export async function uploadAvatar(file: File) {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Validate file type - support common image formats including HEIC
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
  
  if (!allowedTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
    throw new Error('Profile picture must be a supported image file (JPEG, PNG, GIF, WebP, HEIC)')
  }

  // Validate file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Profile picture must be smaller than 2MB')
  }

  // Upload file
  const result = await uploadFile(file, 'avatars', `avatar-${Date.now()}.${file.name.split('.').pop()}`)
  
  if (result.error) {
    throw new Error(`Failed to upload profile picture: ${result.error}`)
  }

  // Update user profile with avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: result.url })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update profile with avatar URL: ${updateError.message}`)
  }

  revalidatePath('/profile')
  return { url: result.url }
}

// Delete file from storage
export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

// Delete resume
export async function deleteResume() {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to find resume URL
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('links')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const currentLinks = currentProfile.links || {}
  const resumeUrl = currentLinks.resume

  if (resumeUrl) {
    // Extract path from URL for deletion
    const url = new URL(resumeUrl)
    const pathParts = url.pathname.split('/')
    const bucket = pathParts[pathParts.length - 2] // resumes
    const fileName = pathParts[pathParts.length - 1] // filename
    
    try {
      await deleteFile(bucket, `${user.id}/${fileName}`)
    } catch (error) {
      console.warn('Failed to delete file from storage:', error)
      // Continue with profile update even if file deletion fails
    }
  }

  // Remove resume URL from profile
  const newLinks = {
    ...currentLinks,
    resume: null
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ links: newLinks })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`)
  }

  revalidatePath('/profile')
}

// Delete avatar
export async function deleteAvatar() {
  const user = await requireActiveUser()
  const supabase = await createClient()

  // Get current profile to find avatar URL
  const { data: currentProfile, error: currentError } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (currentError) {
    throw new Error(`Failed to fetch current profile: ${currentError.message}`)
  }

  const avatarUrl = currentProfile.avatar_url

  if (avatarUrl) {
    // Extract path from URL for deletion
    const url = new URL(avatarUrl)
    const pathParts = url.pathname.split('/')
    const bucket = pathParts[pathParts.length - 2] // avatars
    const fileName = pathParts[pathParts.length - 1] // filename
    
    try {
      await deleteFile(bucket, `${user.id}/${fileName}`)
    } catch (error) {
      console.warn('Failed to delete file from storage:', error)
      // Continue with profile update even if file deletion fails
    }
  }

  // Remove avatar URL from profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`)
  }

  revalidatePath('/profile')
}
