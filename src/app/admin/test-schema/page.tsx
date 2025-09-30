"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestSchemaPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const testSchema = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Test 1: Check if we can query the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (profilesError) {
        throw new Error(`Profiles table error: ${profilesError.message}`)
      }

      // Test 2: Try to insert a test profile with cohort and graduation_year
      const testProfile = {
        id: 'test-schema-' + Date.now(),
        full_name: 'Test User',
        email: 'test-schema@example.com',
        graduation_year: 2026,
        cohort: 'Cohort 10',
        status: 'pending'
      }

      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert(testProfile)
        .select()

      if (insertError) {
        throw new Error(`Insert test failed: ${insertError.message}`)
      }

      // Test 3: Query the inserted profile to verify fields
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testProfile.id)
        .single()

      if (verifyError) {
        throw new Error(`Verification failed: ${verifyError.message}`)
      }

      // Clean up test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testProfile.id)

      setResults({
        profilesTableExists: true,
        insertSuccessful: true,
        cohortField: 'cohort' in verifyData,
        graduationYearField: 'graduation_year' in verifyData,
        cohortValue: verifyData.cohort,
        graduationYearValue: verifyData.graduation_year,
        allFields: Object.keys(verifyData)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Schema Test</h1>
          <p className="text-gray-600">
            Test if the cohort and graduation_year fields exist in the profiles table
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schema Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testSchema} 
              disabled={loading}
              variant="cardinal"
              className="w-full"
            >
              {loading ? "Testing..." : "Test Database Schema"}
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
                  <Card className={results.profilesTableExists ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {results.profilesTableExists ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">Profiles Table</span>
                      </div>
                      <p className="text-sm">
                        {results.profilesTableExists ? "✅ Exists and accessible" : "❌ Not accessible"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={results.insertSuccessful ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {results.insertSuccessful ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">Insert Test</span>
                      </div>
                      <p className="text-sm">
                        {results.insertSuccessful ? "✅ Can insert profiles" : "❌ Insert failed"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={results.cohortField ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {results.cohortField ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">Cohort Field</span>
                      </div>
                      <p className="text-sm">
                        {results.cohortField ? `✅ Exists (value: ${results.cohortValue})` : "❌ Missing"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={results.graduationYearField ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {results.graduationYearField ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">Graduation Year Field</span>
                      </div>
                      <p className="text-sm">
                        {results.graduationYearField ? `✅ Exists (value: ${results.graduationYearValue})` : "❌ Missing"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">All Available Fields</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p>Available columns in profiles table:</p>
                      <ul className="list-disc list-inside mt-2">
                        {results.allFields.map((field: string) => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    </div>
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
