import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserCheck, User, FileText, Tag, Settings, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  await requireAdmin()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, content, and system settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-cardinal" />
              <span>User Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions
            </p>
            <div className="space-y-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  All Users
                </Button>
              </Link>
              <Link href="/admin/approvals">
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Pending Approvals
                </Button>
              </Link>
              <Link href="/admin/edit-user">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Edit User Profiles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Content Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-cardinal" />
              <span>Content Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage projects, events, and classes
            </p>
            <div className="space-y-2">
              <Link href="/admin/projects">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Projects
                </Button>
              </Link>
              <Link href="/admin/events">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Events
                </Button>
              </Link>
              <Link href="/admin/classes">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Classes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Taxonomy Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-cardinal" />
              <span>Taxonomy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage skills, tags, and categories
            </p>
            <div className="space-y-2">
              <Link href="/admin/skills">
                <Button variant="outline" className="w-full justify-start">
                  <Tag className="h-4 w-4 mr-2" />
                  Skills
                </Button>
              </Link>
              <Link href="/admin/tags">
                <Button variant="outline" className="w-full justify-start">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-cardinal" />
              <span>System Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Configure system settings and preferences
            </p>
            <div className="space-y-2">
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  General Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-cardinal" />
              <span>Activity Log</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              View system activity and audit trail
            </p>
            <div className="space-y-2">
              <Link href="/admin/activity">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View Activity Log
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-cardinal" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Users:</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Approvals:</span>
                <span className="font-semibold text-gold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Projects:</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upcoming Events:</span>
                <span className="font-semibold">-</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
