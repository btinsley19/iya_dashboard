import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user and session
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (user && session) {
        // Check if this is a password reset flow
        if (type === 'recovery') {
          // This is a password reset flow, redirect to reset password page
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        }

        // Check if profile exists (for OAuth flows)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!profile) {
          // Create profile for OAuth user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              avatar_url: user.user_metadata?.avatar_url,
            })
          
          if (profileError) {
            console.error('Error creating profile:', profileError)
          }
        }
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
