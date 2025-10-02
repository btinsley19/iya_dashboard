"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Search, 
  Save,
  ArrowLeft,
  Calendar,
  GraduationCap
} from 'lucide-react'
import { updateUserProfile } from '@/lib/actions/user-actions'
import Link from 'next/link'

interface User {
  id: string
  full_name: string
  email: string
  status: string
  role: string
  graduation_year?: number
  cohort?: string
  created_at: string
}

export default function EditUserPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editData, setEditData] = useState({
    graduation_year: '',
    cohort: ''
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const user = users.find(u => 
      u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchEmail.toLowerCase())
    )
    if (user) {
      setSelectedUser(user)
      setEditData({
        graduation_year: user.graduation_year?.toString() || '',
        cohort: user.cohort || ''
      })
      setError(null)
      setSuccess(null)
    } else {
      setError('User not found')
      setSelectedUser(null)
    }
  }

  const handleSave = async () => {
    if (!selectedUser) return

    setActionLoading(selectedUser.id)
    setError(null)
    setSuccess(null)

    try {
      const updates: any = {}
      
      if (editData.graduation_year.trim()) {
        updates.graduation_year = parseInt(editData.graduation_year)
      }
      
      if (editData.cohort.trim()) {
        updates.major = editData.cohort // Note: using major field for cohort
      }

      await updateUserProfile(selectedUser.id, updates)
      
      setSuccess('User profile updated successfully!')
      
      // Refresh the user list
      await fetchUsers()
      
      // Update the selected user data
      const updatedUser = users.find(u => u.id === selectedUser.id)
      if (updatedUser) {
        setSelectedUser(updatedUser)
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to update user: ${errorMessage}`)
    } finally {
      setActionLoading(null)
    }
  }

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cardinal mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit User Profile</h1>
        </div>
        <p className="text-gray-600">Search for a user and update their graduation year and cohort information</p>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-cardinal" />
            <span>Search User</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by email or name..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="cardinal">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected User Edit Form */}
      {selectedUser && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-cardinal" />
              <span>Edit Profile: {selectedUser.full_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* User Info Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-900 capitalize">{selectedUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Graduation Year
                  </label>
                  <Input
                    type="number"
                    value={editData.graduation_year}
                    onChange={(e) => setEditData(prev => ({ ...prev, graduation_year: e.target.value }))}
                    placeholder="e.g., 2026"
                    min="1900"
                    max="2030"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    Cohort
                  </label>
                  <select
                    value={editData.cohort}
                    onChange={(e) => setEditData(prev => ({ ...prev, cohort: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-cardinal focus:outline-none focus:ring-1 focus:ring-cardinal"
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

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleSave}
                  variant="cardinal"
                  disabled={actionLoading === selectedUser.id}
                >
                  {actionLoading === selectedUser.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null)
                    setSearchEmail('')
                    setEditData({ graduation_year: '', cohort: '' })
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* All Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-cardinal" />
            <span>All Users ({users.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Cohort</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Year</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cardinal rounded-full flex items-center justify-center text-white font-semibold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {user.cohort || 'Not specified'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {user.graduation_year || 'Not specified'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setEditData({
                            graduation_year: user.graduation_year?.toString() || '',
                            cohort: user.cohort || ''
                          })
                          setError(null)
                          setSuccess(null)
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
