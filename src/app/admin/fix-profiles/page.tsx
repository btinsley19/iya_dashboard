"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function FixProfilesPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fixProfiles = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Find profiles missing cohort or graduation_year
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, email, cohort, graduation_year, status')
        .or('cohort.is.null,graduation_year.is.null')

      if (fetchError) {
        throw new Error(`Failed to fetch profiles: ${fetchError.message}`)
      }

      console.log('Found profiles missing data:', profiles)

      const fixedProfiles = []
      const failedProfiles = []

      for (const profile of profiles || []) {
        try {
          // For demo purposes, set default values
          // In a real scenario, you might want to ask the user for this data
          const updates: any = {}
          
          if (!profile.cohort) {
            updates.cohort = 'Cohort 10' // Default cohort
          }
          
          if (!profile.graduation_year) {
            updates.graduation_year = 2026 // Default year
          }

          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', profile.id)

            if (updateError) {
              failedProfiles.push({ ...profile, error: updateError.message })
            } else {
              fixedProfiles.push({ ...profile, ...updates })
            }
          }
        } catch (err) {
          failedProfiles.push({ ...profile, error: err instanceof Error ? err.message : 'Unknown error' })
        }
      }

      setResults({
        totalProfiles: profiles?.length || 0,
        fixedProfiles: fixedProfiles.length,
        failedProfiles: failedProfiles.length,
        fixed: fixedProfiles,
        failed: failedProfiles
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fix Missing Profile Data</h1>
          <p className="text-gray-600">
            Find and fix profiles that are missing cohort or graduation year data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Data Fix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={fixProfiles} 
              disabled={loading}
              variant="cardinal"
              className="w-full"
            >
              {loading ? "Fixing Profiles..." : "Find and Fix Missing Data"}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Total Found</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{results.totalProfiles}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Fixed</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{results.fixedProfiles}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Failed</span>
                      </div>
                      <p className="text-2xl font-bold text-red-700">{results.failedProfiles}</p>
                    </CardContent>
                  </Card>
                </div>

                {results.fixed.length > 0 && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Successfully Fixed Profiles</span>
                      </div>
                      <div className="space-y-2">
                        {results.fixed.map((profile: any) => (
                          <div key={profile.id} className="text-sm text-green-700 bg-green-100 p-2 rounded">
                            <strong>{profile.full_name}</strong> ({profile.email}) - 
                            Cohort: {profile.cohort}, Year: {profile.graduation_year}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {results.failed.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Failed to Fix</span>
                      </div>
                      <div className="space-y-2">
                        {results.failed.map((profile: any) => (
                          <div key={profile.id} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                            <strong>{profile.full_name}</strong> ({profile.email}) - 
                            Error: {profile.error}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
