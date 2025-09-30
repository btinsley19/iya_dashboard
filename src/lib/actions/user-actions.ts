'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function approveUser(userId: string) {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to approve user: ${error.message}`)
  }

  // Log the action
  await supabase
    .from('activity_log')
    .insert({
      entity_type: 'profile',
      entity_id: userId,
      actor_id: admin.id,
      action: 'approve_user',
      metadata: { previous_status: 'pending' }
    })

  revalidatePath('/admin/users')
  revalidatePath('/admin/approvals')
}

export async function suspendUser(userId: string) {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'suspended' })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to suspend user: ${error.message}`)
  }

  // Log the action
  await supabase
    .from('activity_log')
    .insert({
      entity_type: 'profile',
      entity_id: userId,
      actor_id: admin.id,
      action: 'suspend_user',
      metadata: { previous_status: 'active' }
    })

  revalidatePath('/admin/users')
}

export async function activateUser(userId: string) {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to activate user: ${error.message}`)
  }

  // Log the action
  await supabase
    .from('activity_log')
    .insert({
      entity_type: 'profile',
      entity_id: userId,
      actor_id: admin.id,
      action: 'activate_user',
      metadata: { previous_status: 'suspended' }
    })

  revalidatePath('/admin/users')
}

export async function promoteToAdmin(userId: string) {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to promote user to admin: ${error.message}`)
  }

  // Log the action
  await supabase
    .from('activity_log')
    .insert({
      entity_type: 'profile',
      entity_id: userId,
      actor_id: admin.id,
      action: 'promote_to_admin',
      metadata: { previous_role: 'user' }
    })

  revalidatePath('/admin/users')
}

export async function demoteFromAdmin(userId: string) {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to demote admin to user: ${error.message}`)
  }

  // Log the action
  await supabase
    .from('activity_log')
    .insert({
      entity_type: 'profile',
      entity_id: userId,
      actor_id: admin.id,
      action: 'demote_from_admin',
      metadata: { previous_role: 'admin' }
    })

  revalidatePath('/admin/users')
}

export async function updateUserProfile(userId: string, updates: {
  full_name?: string
  email?: string
  graduation_year?: number
  major?: string
  bio?: string
}) {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  // Log the action
  await supabase
    .from('activity_log')
    .insert({
      entity_type: 'profile',
      entity_id: userId,
      actor_id: admin.id,
      action: 'update_profile',
      metadata: { updates }
    })

  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // Get user info before deletion for logging
  const { data: userProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('full_name, email, status, role')
    .eq('id', userId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch user info: ${fetchError.message}`)
  }

  if (!userProfile) {
    throw new Error('User not found')
  }

  // Prevent admin from deleting themselves
  if (userId === admin.id) {
    throw new Error('Cannot delete your own account')
  }

  // Prevent deleting the last admin
  if (userProfile.role === 'admin') {
    const { data: adminCount, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'admin')

    if (countError) {
      throw new Error(`Failed to check admin count: ${countError.message}`)
    }

    if (adminCount && adminCount.length <= 1) {
      throw new Error('Cannot delete the last admin account')
    }
  }

  // Delete user files from storage first
  try {
    // Delete avatar if exists
    const profileWithAvatar = userProfile as { avatar_url?: string | null }
    if (profileWithAvatar.avatar_url) {
      const avatarPath = profileWithAvatar.avatar_url.split('/').pop()
      if (avatarPath) {
        await supabase.storage
          .from('avatars')
          .remove([avatarPath])
      }
    }

    // Delete resume if exists (we need to check the profile data)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('links')
      .eq('id', userId)
      .single()

    if (profileData?.links?.resume_url) {
      const resumePath = profileData.links.resume_url.split('/').pop()
      if (resumePath) {
        await supabase.storage
          .from('resumes')
          .remove([resumePath])
      }
    }
  } catch (storageError) {
    console.warn('Failed to delete user files from storage:', storageError)
    // Continue with user deletion even if file cleanup fails
  }

  // Delete the auth user FIRST (this is critical for email availability)
  const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(userId)

  if (authDeleteError) {
    throw new Error(`Failed to delete auth user: ${authDeleteError.message}. Cannot proceed with profile deletion.`)
  }

  // Delete the profile (this will cascade delete most related data)
  const { error: deleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (deleteError) {
    // If profile deletion fails after auth user is deleted, we need to handle this carefully
    console.error('Profile deletion failed after auth user was deleted:', deleteError)
    // The auth user is already deleted, so the email should be available for reuse
    // We'll log this as a warning but not throw an error since the main goal (email availability) is achieved
    console.warn('Profile deletion failed, but auth user was successfully deleted. Email should be available for reuse.')
  }

  // Log the deletion action
  await supabase
    .from('activity_log')
    .insert({
      entity_type: 'profile',
      entity_id: userId,
      actor_id: admin.id,
      action: 'delete_user',
      metadata: { 
        deleted_user: {
          name: userProfile.full_name,
          email: userProfile.email,
          status: userProfile.status,
          role: userProfile.role
        }
      }
    })

  revalidatePath('/admin/users')
}
