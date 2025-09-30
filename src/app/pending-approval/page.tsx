"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Clock, Mail, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  status: string
  role: string
}

export default function PendingApproval() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', user.id)
        .single()

      setUser(user)
      setProfile(profile)

      // If user is active, redirect to main app
      if (profile?.status === 'active') {
        router.push('/')
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cardinal mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-cardinal" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is awaiting administrator approval
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Review Process</h3>
                <p className="text-sm text-gray-600">
                  Our administrators will review your account within 24-48 hours.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Email Notification</h3>
                <p className="text-sm text-gray-600">
                  You&apos;ll receive an email once your account is approved.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <GraduationCap className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Full Access</h3>
                <p className="text-sm text-gray-600">
                  Once approved, you&apos;ll have access to all features including the directory and profile management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <p className="text-xs text-gray-500">
            Questions? Contact us at support@iyadashboard.com
          </p>
        </div>
      </div>
    </div>
  )
}
