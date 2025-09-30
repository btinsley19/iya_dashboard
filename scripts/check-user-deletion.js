#!/usr/bin/env node

/**
 * Utility script to check if a user has been properly deleted from the system
 * Usage: node scripts/check-user-deletion.js <email>
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserDeletion(email) {
  console.log(`\n🔍 Checking deletion status for email: ${email}`)
  console.log('=' .repeat(50))

  try {
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, status, role, created_at')
      .eq('email', email)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError.message)
    } else if (profile) {
      console.log('❌ PROFILE STILL EXISTS:')
      console.log(`   ID: ${profile.id}`)
      console.log(`   Name: ${profile.full_name}`)
      console.log(`   Status: ${profile.status}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Created: ${profile.created_at}`)
    } else {
      console.log('✅ Profile deleted successfully')
    }

    // Check if auth user exists (this requires admin access)
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.error('❌ Error checking auth users:', authError.message)
      } else {
        const authUser = authUsers.users.find(user => user.email === email)
        if (authUser) {
          console.log('❌ AUTH USER STILL EXISTS:')
          console.log(`   ID: ${authUser.id}`)
          console.log(`   Email: ${authUser.email}`)
          console.log(`   Created: ${authUser.created_at}`)
          console.log(`   Last Sign In: ${authUser.last_sign_in_at}`)
        } else {
          console.log('✅ Auth user deleted successfully')
        }
      }
    } catch (authError) {
      console.error('❌ Error accessing auth users:', authError.message)
    }

    // Check activity log for deletion record
    const { data: activityLog, error: logError } = await supabase
      .from('activity_log')
      .select('*')
      .eq('action', 'delete_user')
      .ilike('metadata->deleted_user->email', email)
      .order('created_at', { ascending: false })
      .limit(1)

    if (logError) {
      console.error('❌ Error checking activity log:', logError.message)
    } else if (activityLog && activityLog.length > 0) {
      console.log('📝 Deletion logged in activity:')
      console.log(`   Deleted by: ${activityLog[0].actor_id}`)
      console.log(`   Deleted at: ${activityLog[0].created_at}`)
      console.log(`   User data: ${JSON.stringify(activityLog[0].metadata.deleted_user, null, 2)}`)
    } else {
      console.log('⚠️  No deletion record found in activity log')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }

  console.log('\n' + '=' .repeat(50))
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('Usage: node scripts/check-user-deletion.js <email>')
  console.error('Example: node scripts/check-user-deletion.js brian@123.com')
  process.exit(1)
}

checkUserDeletion(email)
  .then(() => {
    console.log('\n✅ Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error.message)
    process.exit(1)
  })
