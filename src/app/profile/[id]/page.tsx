"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  GraduationCap, 
  Code, 
  BookOpen, 
  ExternalLink,
  ArrowLeft,
  Users,
  Briefcase,
  Globe,
  Mail,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Lightbulb,
  Home,
  Headphones,
  Youtube,
  User,
  Newspaper
} from "lucide-react"
import { getProfileById } from "@/lib/actions/directory-actions"
import { DirectoryProfile } from "@/lib/actions/directory-actions"

export default function PublicProfile() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<DirectoryProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProfile(params.id as string)
    }
  }, [params.id])

  const fetchProfile = async (profileId: string) => {
    try {
      setLoading(true)
      const profileData = await getProfileById(profileId)
      if (profileData) {
        setProfile(profileData)
      } else {
        setError("Profile not found")
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cardinal mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }


  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-500 mb-4">
            The profile you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          onClick={handleBack} 
          variant="outline" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span className="text-lg">{profile.email}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-cardinal flex items-center justify-center text-white font-bold text-2xl">
                    {profile.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  {profile.graduation_year && profile.cohort && (
                    <span className="px-3 py-1 bg-gold text-gray-900 text-sm font-medium rounded-full">
                      {profile.graduation_year} • {profile.cohort}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.location && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.hometown && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Home className="h-4 w-4" />
                      <span>{profile.hometown}</span>
                    </div>
                  )}
                  {profile.major && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <GraduationCap className="h-4 w-4" />
                      <span>{profile.major}</span>
                    </div>
                  )}
                </div>
                {profile.bio && (
                  <p className="mt-4 text-gray-700">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-cardinal" />
                <span>Skills</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizations */}
        {profile.organizations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-cardinal" />
                <span>Organizations and Clubs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.organizations.map((org) => (
                  <div key={org.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{org.name}</h4>
                          {org.type === 'usc' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
                              USC
                            </span>
                          )}
                        </div>
                        {org.description && (
                          <p className="text-sm text-gray-600 mt-1">{org.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            org.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {org.role}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {org.status === 'active' ? 'Active' : 'Past'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interests */}
        {profile.interests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <span>Interests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {profile.projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-cardinal" />
                <span>Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.projects.map((project) => (
                  <div key={project.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                        <div className="mt-2 space-y-2">
                          {/* Project Status - separate line */}
                          {(() => {
                            const projectStatus = project.links && typeof project.links === 'object' ? String(project.links.status || '') : ''
                            if (!projectStatus) return null
                            return (
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  projectStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                  projectStatus === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {projectStatus === 'completed' ? 'Completed' :
                                   projectStatus === 'in-progress' ? 'In Progress' : 'Planned'}
                                </span>
                              </div>
                            )
                          })()}
                          {/* Technologies - separate line */}
                          {(() => {
                            const techs = project.links && typeof project.links === 'object' && Array.isArray(project.links.technologies) ? project.links.technologies : []
                            if (techs.length === 0) return null
                            return (
                              <div className="flex flex-wrap gap-1">
                                {techs.map((tech: unknown) => (
                                  <span 
                                    key={String(tech)} 
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                  >
                                    {String(tech)}
                                  </span>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                    {(() => {
                      const projectUrl = project.links && typeof project.links === 'object' ? String(project.links.url || '') : ''
                      if (!projectUrl) return null
                      return (
                        <div className="mt-2">
                          <a 
                            href={projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-cardinal hover:text-red-800 text-sm font-medium"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>View Project</span>
                          </a>
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hobbies and Sports */}
        {profile.hobbiesAndSports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-gold" />
                <span>Hobbies and Sports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.hobbiesAndSports.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        {profile.links && typeof profile.links === 'object' && Object.keys(profile.links).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                <span>Quick Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const links = profile.links && typeof profile.links === 'object' && !Array.isArray(profile.links) ? profile.links as Record<string, unknown> : {}
                  return (
                    <>
                      {links.linkedin && (
                        <a 
                          href={String(links.linkedin)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Linkedin className="h-5 w-5 text-blue-600" />
                          <span className="text-gray-700">LinkedIn</span>
                          <ExternalLink className="h-4 w-4 text-cardinal" />
                        </a>
                      )}
                      {links.github && (
                        <a 
                          href={String(links.github)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Github className="h-5 w-5 text-gray-800" />
                          <span className="text-gray-700">GitHub</span>
                          <ExternalLink className="h-4 w-4 text-cardinal" />
                        </a>
                      )}
                      {links.twitter && (
                        <a 
                          href={String(links.twitter)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Twitter className="h-5 w-5 text-blue-400" />
                          <span className="text-gray-700">Twitter</span>
                          <ExternalLink className="h-4 w-4 text-cardinal" />
                        </a>
                      )}
                      {links.instagram && (
                        <a 
                          href={String(links.instagram)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Instagram className="h-5 w-5 text-pink-500" />
                          <span className="text-gray-700">Instagram</span>
                          <ExternalLink className="h-4 w-4 text-cardinal" />
                        </a>
                      )}
                      {links.personalWebsite && (
                        <a 
                          href={String(links.personalWebsite)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Globe className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-700">Website</span>
                          <ExternalLink className="h-4 w-4 text-cardinal" />
                        </a>
                      )}
                      {links.resume && (
                        <a 
                          href={String(links.resume)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Briefcase className="h-5 w-5 text-gray-700" />
                          <span className="text-gray-700">Resume</span>
                          <ExternalLink className="h-4 w-4 text-cardinal" />
                        </a>
                      )}
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classes */}
        {profile.classes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-cardinal" />
                <span>Classes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.classes.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{classItem.code}</div>
                      <div className="text-sm text-gray-600">{classItem.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Want to Learn */}
        {profile.wantToLearn.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>Want to Learn</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.wantToLearn.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Favorite Tools */}
        {profile.favoriteTools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-purple-600" />
                <span>Favorite Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.favoriteTools.map((tool) => (
                  <div key={tool.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{tool.name}</span>
                      </div>
                      {tool.description && (
                        <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                      )}
                      {tool.categories && tool.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {tool.categories.map((category: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                      {tool.link && (
                        <a
                          href={tool.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-cardinal hover:text-cardinal-light"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Visit Tool</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Ingestion */}
        {(profile.contentIngestion.podcasts.length > 0 || 
          profile.contentIngestion.youtubeChannels.length > 0 || 
          profile.contentIngestion.influencers.length > 0 || 
          profile.contentIngestion.newsSources.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Headphones className="h-5 w-5 text-purple-600" />
                <span>Content & Media</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.contentIngestion.podcasts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Headphones className="h-4 w-4 mr-1" />
                      Podcasts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.contentIngestion.podcasts.map((podcast, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {podcast}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.contentIngestion.youtubeChannels.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Youtube className="h-4 w-4 mr-1" />
                      YouTube Channels
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.contentIngestion.youtubeChannels.map((channel, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.contentIngestion.influencers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Influencers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.contentIngestion.influencers.map((influencer, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {influencer}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.contentIngestion.newsSources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Newspaper className="h-4 w-4 mr-1" />
                      News Sources
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.contentIngestion.newsSources.map((source, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
