"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, GraduationCap, Code, Users, BookOpen, Grid3X3, List, MapPin, Home, ChevronDown, ChevronUp } from "lucide-react"
import { 
  getDirectoryProfiles, 
  DirectoryProfile,
  DirectoryFilters
} from "@/lib/actions/directory-actions"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function Directory() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHometown, setSelectedHometown] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedCohort, setSelectedCohort] = useState<string>("")
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  // Check authentication immediately on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth')
        return
      }
      
      setIsAuthenticated(true)
    }
    
    checkAuth()
  }, [router])

  // Define fetchData before using it in useEffect
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch directory profiles
      const filters: DirectoryFilters = {
        search: searchTerm || undefined,
        hometown: selectedHometown || undefined,
        location: selectedLocation || undefined,
        cohort: selectedCohort ? [selectedCohort] : undefined
      }
      
      const profilesData = await getDirectoryProfiles(filters)

      setProfiles(profilesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedHometown, selectedLocation, selectedCohort])

  // Fetch profiles when authenticated or filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, fetchData])

  // Predefined cohort options (same as profile page)
  const allCohorts = [
    "Cohort 1",
    "Cohort 2", 
    "Cohort 3",
    "Cohort 4",
    "Cohort 5",
    "Cohort 6",
    "Cohort 7",
    "Cohort 8",
    "Cohort 9",
    "Cohort 10",
    "Cohort 11",
    "Cohort 12",
    "MSIDBT"
  ]

  // Filter users based on search and filters (now handled by server actions)
  const filteredUsers = profiles

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedHometown("")
    setSelectedLocation("")
    setSelectedCohort("")
  }

  const handleViewProfile = (profileId: string) => {
    router.push(`/profile/${profileId}`)
  }

  // Don't render anything until authentication is checked
  if (isAuthenticated === null) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cardinal mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect should happen)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IYA Directory</h1>
        <p className="text-gray-600">Find and connect with other IYA students</p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          {/* Unified Filters Card */}
          <Card className="overflow-hidden">
            {/* Mobile/Desktop Header - Always visible */}
            <CardHeader 
              className={`lg:cursor-default cursor-pointer py-3 ${filtersExpanded ? 'border-b' : ''}`}
              onClick={(e) => {
                // Only toggle on mobile
                if (window.innerWidth < 1024) {
                  setFiltersExpanded(!filtersExpanded)
                }
              }}
            >
              <CardTitle className="flex items-center justify-between text-base font-normal">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-cardinal" />
                  <span>Filters</span>
                </div>
                <div className="lg:hidden">
                  {filtersExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            {/* Filter Content */}
            <CardContent className={`space-y-4 py-4 ${filtersExpanded ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Name, skills, interests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Hometown Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hometown
                </label>
                <Input
                  placeholder="Search by hometown..."
                  value={selectedHometown}
                  onChange={(e) => setSelectedHometown(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <Input
                  placeholder="Search by location..."
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Cohort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cohort
                </label>
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-cardinal focus:outline-none focus:ring-1 focus:ring-cardinal"
                >
                  <option value="">All Cohorts</option>
                  {allCohorts.map((cohort) => (
                    <option key={cohort} value={cohort}>{cohort}</option>
                  ))}
                </select>
              </div>

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              {searchTerm || selectedHometown || selectedLocation || selectedCohort 
                ? `${filteredUsers.length} student${filteredUsers.length !== 1 ? 's' : ''} found`
                : 'All Students'
              }
            </p>
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-cardinal hover:bg-cardinal/90 text-white' : ''}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid View
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-cardinal hover:bg-cardinal/90 text-white' : ''}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cardinal mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profiles...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUsers.map((profile) => (
                <Card key={profile.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewProfile(profile.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                          {profile.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt={profile.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-cardinal flex items-center justify-center text-white font-semibold text-lg">
                              {profile.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{profile.full_name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <GraduationCap className="h-4 w-4" />
                            <span>Class of {profile.graduation_year || 'TBD'}</span>
                          </div>
                          {profile.major && (
                            <div className="text-sm text-gray-500">
                              {profile.major}
                            </div>
                          )}
                          {profile.cohort && (
                            <div className="text-sm text-gray-500">
                              {profile.cohort}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProfile(profile.id)
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Bio */}
                      {profile.bio && (
                        <div>
                          <p className="text-sm text-gray-700 line-clamp-3">{profile.bio}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {profile.skills.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Code className="h-4 w-4 mr-1" />
                            Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Want to Learn */}
                      {profile.wantToLearn.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            Want to Learn
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.wantToLearn.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((profile) => (
                <Card key={profile.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewProfile(profile.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Profile Picture */}
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                        {profile.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-cardinal flex items-center justify-center text-white font-semibold text-lg">
                            {profile.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">{profile.full_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {profile.cohort && (
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {profile.cohort}
                            </span>
                          )}
                          {/* Hide location and hometown on mobile for list view */}
                          <div className="hidden md:flex items-center space-x-4">
                            {profile.location && (
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {profile.location}
                              </span>
                            )}
                            {profile.hometown && (
                              <span className="flex items-center">
                                <Home className="h-4 w-4 mr-1" />
                                {profile.hometown}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* View Profile Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProfile(profile.id)
                        }}
                        className="flex-shrink-0"
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
