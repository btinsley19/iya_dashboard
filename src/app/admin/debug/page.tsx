"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { checkEmailStatus, forceCleanupEmail } from "@/lib/actions/debug-actions"
import { AlertCircle, CheckCircle, XCircle, Loader2, Mail, User, Shield } from "lucide-react"

interface ProfileData {
  status?: string
  role?: string
  created_at?: string
}

interface AuthUserData {
  id?: string
  created_at?: string
  last_sign_in_at?: string | null
}

interface DeletionLog {
  actor_id?: string
  created_at?: string
  metadata?: {
    deleted_user?: Record<string, unknown>
  }
}

interface CleanupResult {
  message: string
}

interface EmailStatus {
  email: string
  profileExists: boolean
  profileData: ProfileData | null
  authUserExists: boolean
  authUserData: AuthUserData | null
  deletionLogged: boolean
  deletionLog: DeletionLog | null
  canSignup: boolean
}

export default function DebugPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null)

  const handleCheckStatus = async () => {
    if (!email.trim()) {
      setError("Please enter an email address")
      return
    }

    setLoading(true)
    setError(null)
    setStatus(null)
    setCleanupResult(null)

    try {
      const result = await checkEmailStatus(email.trim())
      setStatus(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check email status")
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    if (!email.trim()) {
      setError("Please enter an email address")
      return
    }

    setCleanupLoading(true)
    setError(null)
    setCleanupResult(null)

    try {
      const result = await forceCleanupEmail(email.trim())
      setCleanupResult(result)
      // Refresh status after cleanup
      await handleCheckStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cleanup email")
    } finally {
      setCleanupLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Debug Tool</h1>
          <p className="text-gray-600">
            Check and cleanup email addresses that may be blocked in Supabase Auth
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Status Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address (e.g., brian@123.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleCheckStatus} 
                disabled={loading}
                variant="cardinal"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Status"
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {status && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Profile Status */}
                  <Card className={status.profileExists ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Profile Status</span>
                        {status.profileExists ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {status.profileExists ? (
                        <div className="text-sm text-red-700">
                          <p><strong>Status:</strong> {status.profileData?.status}</p>
                          <p><strong>Role:</strong> {status.profileData?.role}</p>
                          <p><strong>Created:</strong> {status.profileData?.created_at ? new Date(status.profileData.created_at).toLocaleString() : 'N/A'}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-green-700">No profile found</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Auth User Status */}
                  <Card className={status.authUserExists ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">Auth User Status</span>
                        {status.authUserExists ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {status.authUserExists ? (
                        <div className="text-sm text-red-700">
                          <p><strong>ID:</strong> {status.authUserData?.id}</p>
                          <p><strong>Created:</strong> {status.authUserData?.created_at ? new Date(status.authUserData.created_at).toLocaleString() : 'N/A'}</p>
                          <p><strong>Last Sign In:</strong> {status.authUserData?.last_sign_in_at ? new Date(status.authUserData.last_sign_in_at).toLocaleString() : 'Never'}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-green-700">No auth user found</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Signup Status */}
                <Card className={status.canSignup ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Can Sign Up?</span>
                      {status.canSignup ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {status.canSignup ? (
                      <p className="text-sm text-green-700">✅ Email is available for signup</p>
                    ) : (
                      <p className="text-sm text-red-700">❌ Email is blocked - cannot signup</p>
                    )}
                  </CardContent>
                </Card>

                {/* Deletion Log */}
                {status.deletionLogged && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Deletion Record</span>
                      </div>
                      <div className="text-sm text-blue-700">
                        <p><strong>Deleted by:</strong> {status.deletionLog?.actor_id}</p>
                        <p><strong>Deleted at:</strong> {status.deletionLog?.created_at ? new Date(status.deletionLog.created_at).toLocaleString() : 'N/A'}</p>
                        <p><strong>User data:</strong> {JSON.stringify(status.deletionLog?.metadata?.deleted_user, null, 2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cleanup Button */}
                {status.authUserExists && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleCleanup} 
                      disabled={cleanupLoading}
                      variant="cardinal"
                      className="w-full"
                    >
                      {cleanupLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cleaning up...
                        </>
                      ) : (
                        "Force Cleanup Email"
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      This will remove the email from Supabase Auth to allow signup
                    </p>
                  </div>
                )}
              </div>
            )}

            {cleanupResult && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Cleanup Result</span>
                  </div>
                  <p className="text-sm text-green-700">{cleanupResult.message}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
