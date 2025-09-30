#!/usr/bin/env node

/**
 * Test script to check if the profile schema includes cohort and graduation_year fields
 * Usage: node scripts/test-profile-schema.js
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

async function testProfileSchema() {
  console.log('🔍 Testing profile schema...')
  console.log('=' .repeat(50))

  try {
    // Try to insert a test profile with cohort and graduation_year
    const testProfile = {
      id: 'test-schema-check-' + Date.now(),
      full_name: 'Test User',
      email: 'test-schema@example.com',
      graduation_year: 2026,
      cohort: 'Cohort 10',
      status: 'pending'
    }

    console.log('📝 Attempting to insert test profile with:')
    console.log('   - graduation_year:', testProfile.graduation_year)
    console.log('   - cohort:', testProfile.cohort)

    const { data, error } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select()

    if (error) {
      console.error('❌ Error inserting test profile:', error.message)
      console.error('   Code:', error.code)
      console.error('   Details:', error.details)
      console.error('   Hint:', error.hint)
      
      if (error.message.includes('column "cohort" does not exist')) {
        console.log('\n🔧 SOLUTION: The cohort column is missing from the profiles table.')
        console.log('   Run the migration: supabase/migrations/004_add_profile_fields.sql')
      }
      
      if (error.message.includes('column "graduation_year" does not exist')) {
        console.log('\n🔧 SOLUTION: The graduation_year column is missing from the profiles table.')
        console.log('   This should exist in the base schema. Check your database setup.')
      }
    } else {
      console.log('✅ Successfully inserted test profile!')
      console.log('   Profile data:', data[0])
      
      // Clean up the test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testProfile.id)
      
      console.log('🧹 Cleaned up test profile')
    }

    // Also check the current schema
    console.log('\n📋 Checking current profiles table structure...')
    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (selectError) {
      console.error('❌ Error querying profiles table:', selectError.message)
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profiles table exists and is accessible')
      console.log('   Available columns:', Object.keys(profiles[0]))
      
      const hasCohort = 'cohort' in profiles[0]
      const hasGraduationYear = 'graduation_year' in profiles[0]
      
      console.log('   Has cohort column:', hasCohort ? '✅' : '❌')
      console.log('   Has graduation_year column:', hasGraduationYear ? '✅' : '❌')
    } else {
      console.log('⚠️  Profiles table exists but is empty')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }

  console.log('\n' + '=' .repeat(50))
}

testProfileSchema()
  .then(() => {
    console.log('\n✅ Schema test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Schema test failed:', error.message)
    process.exit(1)
  })
