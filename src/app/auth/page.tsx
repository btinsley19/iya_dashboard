"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { GraduationCap, Mail, Lock, User, Calendar } from "lucide-react"

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    year: "",
    cohort: ""
  })
  
  const router = useRouter()
  const supabase = createClient()

  // Handle URL parameters for password reset flow
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const errorParam = urlParams.get('error')
    
    if (errorParam === 'access_denied' && urlParams.get('error_code') === 'otp_expired') {
      setError('Password reset link has expired. Please request a new one.')
      setIsForgotPassword(true)
    } else if (code) {
      // Handle password reset code
      handlePasswordResetCode(code)
    }
  }, [])

  const handlePasswordResetCode = async (code: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        setError('Invalid or expired reset link. Please request a new password reset.')
        setIsForgotPassword(true)
      } else {
        // Successfully exchanged code for session, redirect to reset password page
        router.push('/auth/reset-password')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMessage)
      setIsForgotPassword(true)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password reset email sent! Check your inbox.')
        setFormData(prev => ({ ...prev, email: '' }))
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate required fields for signup
    if (!isLogin) {
      if (!formData.year.trim()) {
        setError('Graduation year is required.')
        setLoading(false)
        return
      }
      if (!formData.cohort.trim()) {
        setError('Cohort selection is required.')
        setLoading(false)
        return
      }
    }

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        
        if (error) {
          console.log('Login error:', error)
          // Handle specific auth errors
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.')
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.')
          } else {
            setError(error.message)
          }
          return
        }
        
        if (data?.user) {
          // Check user status and redirect accordingly
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('status, role')
            .eq('id', data.user.id)
            .single()
          
          console.log('Login profile check:', { profile, profileError })
          
          if (profileError || !profile) {
            // No profile exists, redirect to signup
            console.log('No profile found, redirecting to signup')
            setError('No profile found. Please sign up first.')
            setIsLogin(false)
            return
          }
          
          // Get redirect URL from query params or default to home
          const urlParams = new URLSearchParams(window.location.search)
          const redirectTo = urlParams.get('redirectTo') || '/'
          
          if (profile?.status === 'pending') {
            router.push('/pending-approval')
          } else if (profile?.status === 'active') {
            router.push(redirectTo)
          } else {
            router.push('/pending-approval')
          }
        }
      } else {
        // Sign up - First check if email already exists in profiles table
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, status, email')
          .eq('email', formData.email)
          .single()
        
        if (existingProfile) {
          if (existingProfile.status === 'pending') {
            setError('This email is already registered and pending approval. Please wait for admin approval or contact support.')
          } else {
            setError('This email is already registered. Please sign in instead.')
          }
          return
        }
        
        // Proceed with signup if email doesn't exist
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              graduation_year: formData.year ? parseInt(formData.year) : null,
              cohort: formData.cohort,
            }
          }
        })
        
        if (error) {
          // Handle specific error cases
          if (error.message.includes('already registered') || error.message.includes('User already registered') || error.message.includes('already been registered')) {
            setError('This email is already registered in our system. Please sign in instead, or contact support if you believe this is an error.')
          } else if (error.message.includes('signup is disabled')) {
            setError('Account creation is currently disabled. Please contact support.')
          } else {
            setError(`Signup failed: ${error.message}`)
          }
          return
        }
        
        if (data.user) {
          console.log('User created:', data.user.id)
          
          // Check if profile already exists
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id, cohort, graduation_year')
            .eq('id', data.user.id)
            .single()
          
          console.log('Profile check:', { existingProfile, profileCheckError })
          
          if (!existingProfile) {
            // Create profile only if it doesn't exist
            console.log('Creating profile with data:', {
              id: data.user.id,
              full_name: formData.name,
              email: formData.email,
              graduation_year: formData.year ? parseInt(formData.year) : null,
              cohort: formData.cohort,
              status: 'pending',
              visibility: 'public'
            })
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                full_name: formData.name,
                email: formData.email,
                graduation_year: formData.year ? parseInt(formData.year) : null,
                cohort: formData.cohort,
                status: 'pending',
                visibility: 'public'
              })
            
            console.log('Profile creation result:', { insertError })
            
            if (insertError) {
              console.error('Profile creation failed:', insertError)
              console.error('Error details:', {
                message: insertError.message,
                code: insertError.code,
                details: insertError.details,
                hint: insertError.hint
              })
              
              // Show user-friendly error message
              if (insertError.message.includes('column "cohort" does not exist')) {
                setError('Database configuration error: Cohort field is missing. Please contact support.')
              } else if (insertError.message.includes('column "graduation_year" does not exist')) {
                setError('Database configuration error: Graduation year field is missing. Please contact support.')
              } else if (insertError.message.includes('duplicate key value violates unique constraint')) {
                setError('Profile already exists. Please try signing in instead.')
              } else {
                setError(`Profile creation failed: ${insertError.message}`)
              }
              return
            }
          } else {
            console.log('Profile already exists, checking if cohort/year need to be updated')
            
            // If profile exists but cohort/year are missing, update them
            if (!existingProfile.cohort || !existingProfile.graduation_year) {
              console.log('Updating missing cohort/year data')
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  cohort: formData.cohort,
                  graduation_year: formData.year ? parseInt(formData.year) : null
                })
                .eq('id', data.user.id)
              
              if (updateError) {
                console.error('Failed to update cohort/year:', updateError)
              } else {
                console.log('Successfully updated cohort/year')
              }
            }
          }
          
          console.log('Redirecting to pending approval...')
          // Use router.push instead of window.location.href for better navigation
          router.push('/pending-approval')
        } else {
          console.log('No user data received')
          setError('Failed to create account. Please try again.')
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-cardinal" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Join the IYA Community")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isForgotPassword 
              ? "Enter your email and we'll send you a password reset link" 
              : (isLogin ? "Find other IYA students working on similar projects or with similar interests. Find cofounders, collaborators, and friends." : "Create an account to use the IYA networking tool")
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isForgotPassword ? "Forgot Password" : (isLogin ? "Sign In" : "Sign Up")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isForgotPassword ? handlePasswordReset : handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@usc.edu"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              {!isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10"
                      required
                    />
                  </div>
                  {isLogin && (
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true)
                          setError(null)
                          setSuccess(null)
                        }}
                        className="text-sm text-cardinal hover:text-cardinal-light"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Signup fields */}
              {!isLogin && (
                <>
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>


                  {/* Year and Cohort */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          value={formData.year}
                          onChange={(e) => handleInputChange("year", e.target.value)}
                          placeholder="2026"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cohort
                      </label>
                      <select
                        value={formData.cohort}
                        onChange={(e) => handleInputChange("cohort", e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-cardinal focus:outline-none focus:ring-1 focus:ring-cardinal"
                        required
                      >
                        <option value="">Select Cohort</option>
                        <option value="MSIDBT">MSIDBT</option>
                        <option value="Cohort 1">Cohort 1</option>
                        <option value="Cohort 2">Cohort 2</option>
                        <option value="Cohort 3">Cohort 3</option>
                        <option value="Cohort 4">Cohort 4</option>
                        <option value="Cohort 5">Cohort 5</option>
                        <option value="Cohort 6">Cohort 6</option>
                        <option value="Cohort 7">Cohort 7</option>
                        <option value="Cohort 8">Cohort 8</option>
                        <option value="Cohort 9">Cohort 9</option>
                        <option value="Cohort 10">Cohort 10</option>
                        <option value="Cohort 11">Cohort 11</option>
                        <option value="Cohort 12">Cohort 12</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                variant="cardinal"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : (isForgotPassword ? "Send Reset Link" : (isLogin ? "Sign In" : "Create Account"))}
              </Button>
            </form>


            <div className="mt-6 text-center space-y-2">
              {isForgotPassword ? (
                <button
                  onClick={() => {
                    setIsForgotPassword(false)
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-sm text-cardinal hover:text-cardinal-light"
                >
                  Back to sign in
                </button>
              ) : (
                <button
                  onClick={() => {
                    setError(null)
                    setSuccess(null)
                    setIsLogin(!isLogin)
                  }}
                  className="text-sm text-cardinal hover:text-cardinal-light"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
