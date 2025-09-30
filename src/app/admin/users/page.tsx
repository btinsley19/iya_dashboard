"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Shield,
  Mail,
  Calendar,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { approveUser, suspendUser, promoteToAdmin, demoteFromAdmin, deleteUser } from '@/lib/actions/user-actions'

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

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{userId: string, userName: string} | null>(null)
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-cardinal text-white">Admin</Badge>
      case 'user':
        return <Badge className="bg-gray-100 text-gray-800">User</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>
    }
  }

  const handleApprove = async (userId: string) => {
    setActionLoading(userId)
    try {
      await approveUser(userId)
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async (userId: string) => {
    setActionLoading(userId)
    try {
      await suspendUser(userId)
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error suspending user:', error)
      alert('Failed to suspend user')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    setActionLoading(userId)
    try {
      await promoteToAdmin(userId)
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error promoting user:', error)
      alert('Failed to promote user to admin')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDemoteFromAdmin = async (userId: string) => {
    setActionLoading(userId)
    try {
      await demoteFromAdmin(userId)
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error demoting admin:', error)
      alert('Failed to demote admin')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(userId)
    try {
      await deleteUser(userId)
      await fetchUsers() // Refresh the list
      setDeleteConfirm(null) // Close confirmation dialog
    } catch (error: unknown) {
      console.error('Error deleting user:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to delete user: ${errorMessage}`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cardinal mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <Button variant="cardinal">
            <Users className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cardinal focus:outline-none focus:ring-1 focus:ring-cardinal">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cardinal focus:outline-none focus:ring-1 focus:ring-cardinal">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cohort
              </label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cardinal focus:outline-none focus:ring-1 focus:ring-cardinal">
                <option value="">All Cohorts</option>
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
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-cardinal" />
            <span>Users ({users?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Cohort</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Year</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cardinal rounded-full flex items-center justify-center text-white font-semibold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-4 px-4">
                      {getRoleBadge(user.role)}
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
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {user.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(user.id)}
                            disabled={actionLoading === user.id}
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            {actionLoading === user.id ? 'Approving...' : 'Approve'}
                          </Button>
                        )}
                        {user.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleSuspend(user.id)}
                            disabled={actionLoading === user.id}
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            {actionLoading === user.id ? 'Suspending...' : 'Suspend'}
                          </Button>
                        )}
                        {user.role === 'user' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-cardinal border-cardinal hover:bg-red-50"
                            onClick={() => handlePromoteToAdmin(user.id)}
                            disabled={actionLoading === user.id}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {actionLoading === user.id ? 'Promoting...' : 'Make Admin'}
                          </Button>
                        )}
                        {user.role === 'admin' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            onClick={() => handleDemoteFromAdmin(user.id)}
                            disabled={actionLoading === user.id}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {actionLoading === user.id ? 'Demoting...' : 'Remove Admin'}
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => setDeleteConfirm({ userId: user.id, userName: user.full_name })}
                          disabled={actionLoading === user.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!users || users.length === 0) && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">No users match your current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{deleteConfirm.userName}</strong>? 
                This will permanently remove:
              </p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                <li>User profile and all personal data</li>
                <li>All projects, skills, and classes</li>
                <li>Uploaded files (resume, avatar)</li>
                <li>Auth account and email access</li>
                <li>All associated activity logs</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading === deleteConfirm.userId}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleDeleteUser(deleteConfirm.userId)}
                disabled={actionLoading === deleteConfirm.userId}
              >
                {actionLoading === deleteConfirm.userId ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
