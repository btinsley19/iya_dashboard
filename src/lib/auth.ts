import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getUserProfile() {
  const user = await getUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth')
  }
  return user
}

export async function requireActiveUser() {
  const user = await getUser()
  if (!user) {
    redirect('/auth')
  }
  
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    redirect('/auth')
  }
  
  if (profile.status === 'pending') {
    redirect('/pending-approval')
  }
  
  if (profile.status === 'suspended') {
    redirect('/suspended')
  }
  
  return profile
}

export async function requireAdmin() {
  const profile = await requireActiveUser()
  if (profile.role !== 'admin') {
    redirect('/')
  }
  return profile
}

export async function isAdmin() {
  const profile = await getUserProfile()
  return profile?.role === 'admin'
}
