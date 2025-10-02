"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react'

interface DebugData {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  usersWithSkills: number
  usersWithInterests: number
  usersWithLinks: number
  sampleUser?: {
    id: string
    name: string
    status: string
    links: any
  }
}

export default function DebugDataPage() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDebugData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all users
      const { data: allUsers, error: allUsersError } = await supabase
        .from('profiles')
        .select('id, full_name, status, links')
        .order('created_at', { ascending: false })

      if (allUsersError) {
        throw new Error(`Failed to fetch users: ${allUsersError.message}`)
      }

      // Analyze the data
      const totalUsers = allUsers.length
      const activeUsers = allUsers.filter(u => u.status === 'active').length
      const pendingUsers = allUsers.filter(u => u.status === 'pending').length
      const suspendedUsers = allUsers.filter(u => u.status === 'suspended').length
      
      const usersWithLinks = allUsers.filter(u => u.links && Object.keys(u.links).length > 0).length
      const usersWithSkills = allUsers.filter(u => u.links?.skills && u.links.skills.length > 0).length
      const usersWithInterests = allUsers.filter(u => u.links?.interests && u.links.interests.length > 0).length

      // Get a sample user for detailed inspection
      const sampleUser = allUsers[0] ? {
        id: allUsers[0].id,
        name: allUsers[0].full_name,
        status: allUsers[0].status,
        links: allUsers[0].links
      } : undefined

      setDebugData({
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers,
        usersWithSkills,
        usersWithInterests,
        usersWithLinks,
        sampleUser
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cardinal mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading debug data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Debug Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDebugData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Debug</h1>
            <p className="text-gray-600">Check database status and data integrity</p>
          </div>
          <Button onClick={fetchDebugData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debugData?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{debugData?.activeUsers || 0}</div>
            <p className="text-xs text-gray-500">Visible in directory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{debugData?.pendingUsers || 0}</div>
            <p className="text-xs text-gray-500">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Suspended Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{debugData?.suspendedUsers || 0}</div>
            <p className="text-xs text-gray-500">Blocked access</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Integrity Check */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-cardinal" />
              <span>Data Migration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Users with links data:</span>
                <div className="flex items-center space-x-2">
                  {debugData?.usersWithLinks ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{debugData?.usersWithLinks || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Users with skills:</span>
                <div className="flex items-center space-x-2">
                  {debugData?.usersWithSkills ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{debugData?.usersWithSkills || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Users with interests:</span>
                <div className="flex items-center space-x-2">
                  {debugData?.usersWithInterests ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{debugData?.usersWithInterests || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-cardinal" />
              <span>Directory Visibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active users (visible):</span>
                <span className="font-medium text-green-600">{debugData?.activeUsers || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending users (hidden):</span>
                <span className="font-medium text-yellow-600">{debugData?.pendingUsers || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Suspended users (hidden):</span>
                <span className="font-medium text-red-600">{debugData?.suspendedUsers || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample User Data */}
      {debugData?.sampleUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-cardinal" />
              <span>Sample User Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Name:</span>
                <span>{debugData.sampleUser.name}</span>
                {getStatusBadge(debugData.sampleUser.status)}
              </div>
              
              <div>
                <span className="font-medium block mb-2">Links Data:</span>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(debugData.sampleUser.links, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debugData?.activeUsers === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">
                  <strong>No active users found.</strong> Users need to be approved to appear in the directory.
                  Visit <a href="/admin/users" className="underline">User Management</a> to approve users.
                </p>
              </div>
            )}
            
            {debugData?.usersWithSkills === 0 && debugData?.usersWithInterests === 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">
                  <strong>No skills/interests data found.</strong> The database migration may not have run properly.
                  Check if the migration script was executed in Supabase.
                </p>
              </div>
            )}
            
            {debugData?.pendingUsers > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">
                  <strong>{debugData.pendingUsers} users pending approval.</strong> 
                  These users won't appear in the directory until approved.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
