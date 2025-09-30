"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestSignupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    year: "2026",
    cohort: "Cohort 10"
  })
  const supabase = createClient()

  const testSignup = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log('Starting signup test with data:', formData)

      // Step 1: Check if email already exists
      const { data: existingEmailProfile } = await supabase
        .from('profiles')
        .select('id, status, email')
        .eq('email', formData.email)
        .single()
      
      if (existingEmailProfile) {
        throw new Error('Email already exists in database')
      }

      // Step 2: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
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

      if (authError) {
        throw new Error(`Auth signup failed: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No user data returned from auth signup')
      }

      console.log('Auth user created:', authData.user.id)

      // Step 3: Check if profile already exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, cohort, graduation_year')
        .eq('id', authData.user.id)
        .single()

      let profileInsertData = null
      let profileInsertError = null

      if (!existingProfile) {
        // Create profile only if it doesn't exist
        const profileData = {
          id: authData.user.id,
          full_name: formData.name,
          email: formData.email,
          graduation_year: formData.year ? parseInt(formData.year) : null,
          cohort: formData.cohort,
          status: 'pending',
          visibility: 'public'
        }

        console.log('Attempting to insert profile:', profileData)

        const result = await supabase
          .from('profiles')
          .insert(profileData)
          .select()

        profileInsertData = result.data
        profileInsertError = result.error

        if (profileInsertError) {
          console.error('Profile insert error:', profileInsertError)
          throw new Error(`Profile creation failed: ${profileInsertError.message}`)
        }

        console.log('Profile created successfully:', profileInsertData)
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
            .eq('id', authData.user.id)
          
          if (updateError) {
            console.error('Failed to update cohort/year:', updateError)
            throw new Error(`Failed to update cohort/year: ${updateError.message}`)
          } else {
            console.log('Successfully updated cohort/year')
          }
        }
      }

      // Step 4: Verify the profile was created correctly
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (verifyError) {
        throw new Error(`Profile verification failed: ${verifyError.message}`)
      }

      setResults({
        authUserCreated: true,
        profileCreated: true,
        profileData: verifyProfile,
        cohortValue: verifyProfile.cohort,
        graduationYearValue: verifyProfile.graduation_year,
        allFields: Object.keys(verifyProfile)
      })

    } catch (err) {
      console.error('Signup test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Signup Process Test</h1>
          <p className="text-gray-600">
            Test the complete signup process to see where cohort and year data is lost
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Signup Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="password123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Test User"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year
                </label>
                <Input
                  type="text"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  placeholder="2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cohort
                </label>
                <select
                  value={formData.cohort}
                  onChange={(e) => handleInputChange("cohort", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cardinal focus:outline-none focus:ring-1 focus:ring-cardinal"
                >
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

            <Button 
              onClick={testSignup} 
              disabled={loading}
              variant="cardinal"
              className="w-full"
            >
              {loading ? "Testing Signup..." : "Test Signup Process"}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={results.authUserCreated ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {results.authUserCreated ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">Auth User</span>
                      </div>
                      <p className="text-sm">
                        {results.authUserCreated ? "✅ Created successfully" : "❌ Failed to create"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={results.profileCreated ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {results.profileCreated ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">Profile</span>
                      </div>
                      <p className="text-sm">
                        {results.profileCreated ? "✅ Created successfully" : "❌ Failed to create"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={results.cohortValue ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {results.cohortValue ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">Cohort</span>
                      </div>
                      <p className="text-sm">
                        {results.cohortValue ? `✅ Value: ${results.cohortValue}` : "❌ NULL or empty"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={results.graduationYearValue ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {results.graduationYearValue ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">Graduation Year</span>
                      </div>
                      <p className="text-sm">
                        {results.graduationYearValue ? `✅ Value: ${results.graduationYearValue}` : "❌ NULL or empty"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Complete Profile Data</span>
                    </div>
                    <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-auto">
                      {JSON.stringify(results.profileData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
