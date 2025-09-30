'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

/**
 * Debug action to check if an email is still blocked in Supabase Auth
 * Only accessible by admins
 */
export async function checkEmailStatus(email: string) {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  try {
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, status, role, created_at')
      .eq('email', email)
      .single()

    const profileExists = !profileError && !!profile

    // Check if auth user exists (this requires admin access)
    let authUserExists = false
    let authUserData: { id?: string; created_at?: string; last_sign_in_at?: string | null } | null = null
    
    try {
      const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers()
      
      if (!authError && authUsers) {
        const authUser = authUsers.users.find(user => user.email === email)
        authUserExists = !!authUser
        authUserData = authUser ? { id: authUser.id, created_at: authUser.created_at, last_sign_in_at: authUser.last_sign_in_at } : null
      }
    } catch (authError) {
      console.error('Error checking auth users:', authError)
    }

    // Check activity log for deletion record
    const { data: activityLog, error: logError } = await supabase
      .from('activity_log')
      .select('*')
      .eq('action', 'delete_user')
      .ilike('metadata->deleted_user->email', email)
      .order('created_at', { ascending: false })
      .limit(1)

    return {
      email,
      profileExists,
      profileData: profile,
      authUserExists,
      authUserData,
      deletionLogged: !logError && activityLog && activityLog.length > 0,
      deletionLog: activityLog?.[0] || null,
      canSignup: !authUserExists && !profileExists
    }
  } catch (error) {
    console.error('Error checking email status:', error)
    throw new Error(`Failed to check email status: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Force cleanup of an email from Supabase Auth
 * Only accessible by admins
 */
export async function forceCleanupEmail(email: string) {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  try {
    // First check current status
    const status = await checkEmailStatus(email)
    
    if (!status.authUserExists) {
      return {
        success: true,
        message: 'Email is already clean - no auth user found',
        status
      }
    }

    // Get the auth user ID
    const authUserId = status.authUserData?.id
    if (!authUserId) {
      throw new Error('Could not find auth user ID')
    }

    // Delete the auth user
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(authUserId)
    
    if (deleteError) {
      throw new Error(`Failed to delete auth user: ${deleteError.message}`)
    }

    // Log the cleanup action
    await supabase
      .from('activity_log')
      .insert({
        entity_type: 'profile',
        entity_id: authUserId,
        actor_id: admin.id,
        action: 'force_cleanup_email',
        metadata: { 
          email,
          reason: 'Manual cleanup of blocked email',
          previous_status: status
        }
      })

    // Check status again
    const newStatus = await checkEmailStatus(email)

    return {
      success: true,
      message: 'Email cleanup completed successfully',
      previousStatus: status,
      newStatus
    }
  } catch (error) {
    console.error('Error during email cleanup:', error)
    throw new Error(`Failed to cleanup email: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
