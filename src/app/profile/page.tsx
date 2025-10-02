"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Edit, 
  Save, 
  X, 
  Check,
  MapPin, 
  GraduationCap, 
  Code, 
  Lightbulb, 
  BookOpen, 
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  Home,
  Camera
} from "lucide-react"
import { User, Project, Organization, FavoriteTool, Class } from "@/types"
import { 
  getUserProfile, 
  updateProfile, 
  addSkill, 
  removeSkill,
  addInterest,
  removeInterest, 
  addHobbyOrSport,
  removeHobbyOrSport,
  addFavoriteTool,
  removeFavoriteTool,
  updateContentIngestion,
  updateLinkedInUrl,
  updateResumeUrl,
  updatePersonalWebsite,
  updateGithub,
  addProject,
  updateProject,
  deleteProject,
  addClass,
  removeClass,
  getAvailableClasses,
  addCanTeach,
  removeCanTeach,
  addWantToLearn,
  removeWantToLearn,
  addOrganization,
  removeOrganization,
  updateOrganization,
  updateTool
} from "@/lib/actions/profile-actions"
import { 
  uploadResume, 
  uploadAvatar, 
  deleteResume, 
  deleteAvatar 
} from "@/lib/actions/file-actions"
import { FileUpload } from "@/components/ui/file-upload"
import { AvatarCropper } from "@/components/ui/avatar-cropper"
import { 
  validateProfileInfo, 
  validateSkill, 
  validateInterest, 
  validateProject, 
  validateProjectUrl,
  validateLinkedInUrl,
  sanitizeText,
  formatErrorMessage 
} from "@/lib/validation"

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Individual section editing states
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({})
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({})
  
  // Form states for each section
  const [newSkill, setNewSkill] = useState("")
  const [newInterest, setNewInterest] = useState("")
  const [newHobbyOrSport, setNewHobbyOrSport] = useState("")
  const [newCanTeach, setNewCanTeach] = useState("")
  const [newWantToLearn, setNewWantToLearn] = useState("")
  const [newLinkedInUrl, setNewLinkedInUrl] = useState("")
  const [newResumeUrl, setNewResumeUrl] = useState("")
  const [newPersonalWebsite, setNewPersonalWebsite] = useState("")
  const [newGithub, setNewGithub] = useState("")
  const [newFavoriteTool, setNewFavoriteTool] = useState({ name: "", description: "", categories: [] as string[], link: "" })
  const [newToolCategory, setNewToolCategory] = useState("")
  const [newContentIngestion, setNewContentIngestion] = useState({
    podcasts: "",
    youtubeChannels: "",
    influencers: "",
    newsSources: ""
  })
  const [newOrganization, setNewOrganization] = useState<{
    name: string
    description: string
    role: 'admin' | 'member'
    status: 'active' | 'past'
    type: 'usc' | 'non-usc'
  }>({
    name: "",
    description: "",
    role: "member",
    status: "active",
    type: "usc"
  })
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showOrganizationModal, setShowOrganizationModal] = useState(false)
  const [showToolModal, setShowToolModal] = useState(false)
  const [availableClasses, setAvailableClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)
  const [editingTool, setEditingTool] = useState<FavoriteTool | null>(null)
  const [newProject, setNewProject] = useState<{
    title: string
    description: string
    url: string
    technologies: string[]
    status: 'completed' | 'in-progress' | 'planned'
  }>({
    title: "",
    description: "",
    url: "",
    technologies: [],
    status: "completed"
  })
  const [newClass, setNewClass] = useState({
    classId: "",
    role: "mentor" as const
  })
  const [classSearchQuery, setClassSearchQuery] = useState("")
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [newTechnology, setNewTechnology] = useState("")
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null)

  // Helper function to display validation errors
  const getValidationError = (field: string) => {
    return validationErrors[field]?.[0] || null
  }

  // Helper function to format student type and modality for display
  const formatDisplayValue = (value: string | undefined) => {
    if (!value) return "Not specified"
    return value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  // Helper function to manage loading states
  const setLoadingState = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }))
  }

  // Helper functions for section editing
  const startEditingSection = (section: string) => {
    setEditingSections(prev => ({ ...prev, [section]: true }))
  }

  const stopEditingSection = (section: string) => {
    setEditingSections(prev => ({ ...prev, [section]: false }))
    setValidationErrors({})
  }

  const setSavingSection = (section: string, saving: boolean) => {
    setSavingSections(prev => ({ ...prev, [section]: saving }))
  }

  const isEditingSection = (section: string) => editingSections[section] || false
  const isSavingSection = (section: string) => savingSections[section] || false

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const profileData = await getUserProfile()
      
      // Transform the profile data to match the User interface
      const userData: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        location: profileData.location || undefined,
        hometown: profileData.hometown || undefined,
        year: profileData.year || undefined,
        cohort: profileData.cohort || undefined,
        modality: profileData.modality as 'in-person' | 'online' | 'hybrid',
        bio: profileData.bio || undefined,
        skills: profileData.skills,
        organizations: profileData.organizations,
        interests: profileData.interests,
        hobbiesAndSports: profileData.hobbiesAndSports,
        canTeach: profileData.canTeach,
        wantToLearn: profileData.wantToLearn,
        favoriteTools: profileData.favoriteTools,
        contentIngestion: profileData.contentIngestion,
        projects: profileData.projects,
        classes: profileData.classes,
        linkedinUrl: profileData.linkedinUrl || undefined,
        resumeUrl: profileData.resumeUrl || undefined,
        personalWebsite: profileData.personalWebsite || undefined,
        github: profileData.github || undefined,
        avatar: profileData.avatar || undefined,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt
      }
      
      setUser(userData)
      setNewLinkedInUrl(profileData.linkedinUrl || "")
      setNewResumeUrl(profileData.resumeUrl || "")
      setNewPersonalWebsite(profileData.personalWebsite || "")
      setNewGithub(profileData.github || "")
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      
      // For development/testing: show a demo profile if authentication fails
      if (err instanceof Error && (err.message.includes('authentication') || err.message.includes('Supabase'))) {
        console.log('Using demo profile for development')
        const demoProfile: User = {
          id: "demo-user",
          name: "Demo User",
          email: "demo@usc.edu",
          location: "Los Angeles, CA",
          hometown: "San Francisco, CA",
          year: "2026",
          cohort: "Cohort 10",
          modality: "in-person",
          bio: "Tell other IYA students who you are...",
          skills: ["React", "TypeScript", "Node.js", "Python", "UI/UX", "Figma", "Marketing"],
          organizations: [
            {
              id: "org-1",
              name: "USC IYA Student Council",
              description: "Student government organization for IYA students",
              role: "member",
              status: "active",
              type: "usc"
            },
            {
              id: "org-2", 
              name: "Tech Startup Incubator",
              description: "Local startup accelerator program",
              role: "admin",
              status: "active",
              type: "non-usc"
            }
          ],
          interests: ["Biotech", "Fintech", "Sustainability", "AI/ML", "Web3"],
          hobbiesAndSports: ["Hackathons", "Tech Meetups", "Photography", "Gaming", "Basketball", "Tennis", "Reading", "Cooking"],
          canTeach: ["React", "JavaScript", "UI/UX Design"],
          wantToLearn: ["Machine Learning", "Blockchain", "Physical Product Design", "XR"],
          favoriteTools: [
            { id: "tool-1", name: "VS Code", description: "My go-to code editor with amazing extensions", categories: ["IDE", "Development"], link: "https://code.visualstudio.com/" },
            { id: "tool-2", name: "Figma", description: "Essential for UI/UX design and prototyping", categories: ["Design", "Collaboration"], link: "https://figma.com" },
            { id: "tool-3", name: "Blender", description: "Open-source 3D creation suite", categories: ["3D", "Animation"], link: "https://blender.org" },
            { id: "tool-4", name: "LangChain", description: "Framework for building LLM applications", categories: ["AI", "Development"], link: "https://langchain.com" }
          ],
          contentIngestion: {
            podcasts: ["Lex Fridman Podcast", "The Vergecast", "a16z Podcast"],
            youtubeChannels: ["Fireship", "Traversy Media", "3Blue1Brown"],
            influencers: ["@dan_abramov", "@sindresorhus", "@elonmusk"],
            newsSources: ["Hacker News", "TechCrunch", "The Information"]
          },
          projects: [
            {
              id: "demo-project",
              title: "AI-Powered Dashboard",
              description: "A comprehensive dashboard for data visualization using React and D3.js",
              technologies: ["React", "TypeScript", "D3.js", "Node.js"],
              status: "completed"
            }
          ],
          classes: [
            {
              id: "demo-class-1",
              title: "Professional Practices Residential",
              code: "IDSN 515",
              semester: "Fall 2024"
            },
            {
              id: "demo-class-2",
              title: "Business Essentials",
              code: "IDSN 525",
              semester: "Spring 2025"
            },
            {
              id: "demo-class-3",
              title: "Innovators Forum",
              code: "ACAD 174",
              semester: "Fall 2023"
            },
            {
              id: "demo-class-4",
              title: "Rapid Visualization",
              code: "ACAD 176",
              semester: "Spring 2024"
            }
          ],
          linkedinUrl: "https://linkedin.com/in/demouser",
          resumeUrl: "",
          personalWebsite: "https://demouser.dev",
          github: "https://github.com/demouser",
          avatar: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setUser(demoProfile)
        setNewLinkedInUrl("")
        setNewResumeUrl("")
        setNewPersonalWebsite("")
        setNewGithub("")
        setError("Demo mode: Database not configured. This is a demo profile for testing the UI.")
      } else {
        // Redirect to auth if not authenticated
        router.push('/auth')
      }
    } finally {
      setLoading(false)
    }
  }

  // Save basic profile information
  const handleSaveBasicInfo = async () => {
    if (!user) return
    
    // Store original values for rollback
    const originalUser = { ...user }
    
    try {
      setSavingSection('basicInfo', true)
      setError(null)
      setValidationErrors({})
      
      // Validate profile information
      const profileValidation = validateProfileInfo({
        name: user.name,
        location: user.location,
        hometown: user.hometown,
        year: user.year,
        cohort: user.cohort
      })
      
      if (!profileValidation.isValid) {
        setValidationErrors({ profile: profileValidation.errors })
        return
      }
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        stopEditingSection('basicInfo')
        return
      }
      
      // Update basic profile information (year and cohort are not editable)
      await updateProfile({
        full_name: sanitizeText(user.name),
        location: user.location ? sanitizeText(user.location) : null,
        hometown: user.hometown ? sanitizeText(user.hometown) : null,
        modality: user.modality || null,
        bio: user.bio ? sanitizeText(user.bio) : null
      })

      // Success - close editing mode
      stopEditingSection('basicInfo')
    } catch (err) {
      console.error('Error saving basic info:', err)
      setError(formatErrorMessage(err))
      
      // Revert to original values on error
      setUser(originalUser)
    } finally {
      setSavingSection('basicInfo', false)
    }
  }

  // Save quick links (LinkedIn, Resume, Personal Website, GitHub)
  const handleSaveQuickLinks = async () => {
    if (!user) return
    
    // Store original values for rollback
    const originalLinkedInUrl = user.linkedinUrl
    const originalResumeUrl = user.resumeUrl
    const originalPersonalWebsite = user.personalWebsite
    const originalGithub = user.github
    
    try {
      setSavingSection('quickLinks', true)
      setError(null)
      setValidationErrors({})
      
      // Validate LinkedIn URL
      const linkedinValidation = validateLinkedInUrl(newLinkedInUrl)
      
      if (!linkedinValidation.isValid) {
        setValidationErrors({ linkedin: linkedinValidation.errors })
        return
      }
      
      // Optimistic update - update UI immediately
      setUser(prev => prev ? {
        ...prev,
        linkedinUrl: newLinkedInUrl,
        resumeUrl: newResumeUrl,
        personalWebsite: newPersonalWebsite,
        github: newGithub
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        stopEditingSection('quickLinks')
        return
      }

      // Update LinkedIn URL if changed
      if (newLinkedInUrl !== originalLinkedInUrl) {
        await updateLinkedInUrl(newLinkedInUrl)
      }

      // Update Resume URL if changed
      if (newResumeUrl !== originalResumeUrl) {
        await updateResumeUrl(newResumeUrl)
      }

      // Update personal website if changed
      if (newPersonalWebsite !== originalPersonalWebsite) {
        await updatePersonalWebsite(newPersonalWebsite)
      }

      // Update GitHub if changed
      if (newGithub !== originalGithub) {
        await updateGithub(newGithub)
      }


      // Success - close editing mode
      stopEditingSection('quickLinks')
    } catch (err) {
      console.error('Error saving quick links:', err)
      setError(formatErrorMessage(err))
      
      // Revert to original values on error
      setUser(prev => prev ? {
        ...prev,
        linkedinUrl: originalLinkedInUrl,
        resumeUrl: originalResumeUrl,
        personalWebsite: originalPersonalWebsite,
        github: originalGithub
      } : null)
      setNewLinkedInUrl(originalLinkedInUrl || "")
      setNewResumeUrl(originalResumeUrl || "")
      setNewPersonalWebsite(originalPersonalWebsite || "")
      setNewGithub(originalGithub || "")
    } finally {
      setSavingSection('quickLinks', false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !user) return
    
    const skillToAdd = sanitizeText(newSkill.trim())
    
    try {
      setError(null)
      
      // Validate skill
      const validation = validateSkill(skillToAdd)
      if (!validation.isValid) {
        setValidationErrors({ skill: validation.errors })
        return
      }
      
      // Check if skill already exists
      if (user.skills.includes(skillToAdd)) {
        setValidationErrors({ skill: ['This skill is already added'] })
        return
      }
      
      // Optimistic update - add skill to UI immediately
      setUser(prev => prev ? {
        ...prev,
        skills: [...prev.skills, skillToAdd]
      } : null)
      setNewSkill("")
      setValidationErrors({})
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Save to database in background
      await addSkill(skillToAdd)
    } catch (err) {
      console.error('Error adding skill:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update on error
      setUser(prev => prev ? {
        ...prev,
        skills: prev.skills.filter(s => s !== skillToAdd)
      } : null)
      setNewSkill(skillToAdd)
    }
  }

  const handleRemoveSkill = async (skill: string) => {
    if (!user) return
    
    try {
      setError(null)
      
      // Optimistic update - remove skill from UI immediately
      setUser(prev => prev ? {
        ...prev,
        skills: prev.skills.filter(s => s !== skill)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Save to database in background
      await removeSkill(skill)
    } catch (err) {
      console.error('Error removing skill:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove skill')
      
      // Revert optimistic update on error
      setUser(prev => prev ? {
        ...prev,
        skills: [...prev.skills, skill]
      } : null)
    }
  }


  const handleAddCanTeach = async () => {
    if (!newCanTeach.trim() || !user) return
    
    const skillToAdd = newCanTeach.trim()
    
    try {
      setError(null)
      setLoadingState('addCanTeach', true)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        canTeach: [...prev.canTeach, skillToAdd]
      } : null)
      setNewCanTeach("")
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await addCanTeach(skillToAdd)
    } catch (err) {
      console.error('Error adding canTeach skill:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        canTeach: prev.canTeach.filter(s => s !== skillToAdd)
      } : null)
      setNewCanTeach(skillToAdd)
    } finally {
      setLoadingState('addCanTeach', false)
    }
  }

  const handleRemoveCanTeach = async (skill: string) => {
    if (!user) return
    
    try {
      setError(null)
      setLoadingState(`removeCanTeach-${skill}`, true)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        canTeach: prev.canTeach.filter(s => s !== skill)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await removeCanTeach(skill)
    } catch (err) {
      console.error('Error removing canTeach skill:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        canTeach: [...prev.canTeach, skill]
      } : null)
    } finally {
      setLoadingState(`removeCanTeach-${skill}`, false)
    }
  }

  const handleAddWantToLearn = async () => {
    if (!newWantToLearn.trim() || !user) return
    
    const skillToAdd = newWantToLearn.trim()
    
    try {
      setError(null)
      setLoadingState('addWantToLearn', true)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        wantToLearn: [...prev.wantToLearn, skillToAdd]
      } : null)
      setNewWantToLearn("")
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await addWantToLearn(skillToAdd)
    } catch (err) {
      console.error('Error adding wantToLearn skill:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        wantToLearn: prev.wantToLearn.filter(s => s !== skillToAdd)
      } : null)
      setNewWantToLearn(skillToAdd)
    } finally {
      setLoadingState('addWantToLearn', false)
    }
  }

  const handleRemoveWantToLearn = async (skill: string) => {
    if (!user) return
    
    try {
      setError(null)
      setLoadingState(`removeWantToLearn-${skill}`, true)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        wantToLearn: prev.wantToLearn.filter(s => s !== skill)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await removeWantToLearn(skill)
    } catch (err) {
      console.error('Error removing wantToLearn skill:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        wantToLearn: [...prev.wantToLearn, skill]
      } : null)
    } finally {
      setLoadingState(`removeWantToLearn-${skill}`, false)
    }
  }

  // Organization handlers
  const handleAddOrganization = async () => {
    if (!newOrganization.name.trim() || !user) return
    
    try {
      setError(null)
      
      const orgToAdd = {
        id: `org-${Date.now()}`,
        name: sanitizeText(newOrganization.name.trim()),
        description: sanitizeText(newOrganization.description.trim()),
        role: newOrganization.role,
        status: newOrganization.status,
        type: newOrganization.type
      }
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        organizations: [...prev.organizations, orgToAdd]
      } : null)
      setNewOrganization({
        name: "",
        description: "",
        role: "member",
        status: "active",
        type: "usc"
      })
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Add organization to database
      await addOrganization({
        name: orgToAdd.name,
        description: orgToAdd.description,
        role: orgToAdd.role,
        status: orgToAdd.status,
        type: orgToAdd.type
      })
    } catch (err) {
      console.error('Error adding organization:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        organizations: prev.organizations.filter(o => o.id !== `org-${Date.now()}`)
      } : null)
      setNewOrganization({
        name: newOrganization.name,
        description: newOrganization.description,
        role: newOrganization.role,
        status: newOrganization.status,
        type: newOrganization.type
      })
    }
  }

  const handleRemoveOrganization = async (orgId: string) => {
    if (!user) return
    
    try {
      setError(null)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        organizations: prev.organizations.filter(o => o.id !== orgId)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Remove organization from database
      await removeOrganization(orgId)
    } catch (err) {
      console.error('Error removing organization:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update - reload profile
      await loadUserProfile()
    }
  }

  const handleEditOrganization = (org: Organization) => {
    setEditingOrganization(org)
  }

  const handleEditTool = (tool: FavoriteTool) => {
    setEditingTool(tool)
    setShowToolModal(true)
  }

  const handleUpdateOrganization = async (updatedOrg: Organization) => {
    if (!user) return
    
    try {
      setError(null)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        organizations: prev.organizations.map(o => 
          o.id === updatedOrg.id ? updatedOrg : o
        )
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Update organization in database
      const updatedOrganizations = user.organizations.map(o => 
        o.id === updatedOrg.id ? updatedOrg : o
      )
      await updateOrganization(updatedOrganizations)
      setEditingOrganization(null)
    } catch (err) {
      console.error('Error updating organization:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update - reload profile
      await loadUserProfile()
    }
  }

  const handleCancelEditOrganization = () => {
    setEditingOrganization(null)
  }

  const handleUpdateTool = async (updatedTool: FavoriteTool) => {
    if (!user) return
    
    try {
      setError(null)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        favoriteTools: prev.favoriteTools.map(t => 
          t.id === updatedTool.id ? updatedTool : t
        )
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Update tool in database
      const updatedTools = user.favoriteTools.map(t => 
        t.id === updatedTool.id ? updatedTool : t
      )
      await updateTool(updatedTools)
      setEditingTool(null)
    } catch (err) {
      console.error('Error updating tool:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update - reload profile
      await loadUserProfile()
    }
  }

  const handleCancelEditTool = () => {
    setEditingTool(null)
  }

  // Interest handlers
  const handleAddInterest = async () => {
    if (!newInterest.trim() || !user) return
    
    const interestToAdd = sanitizeText(newInterest.trim())
    
    try {
      setError(null)
      
      // Check if interest already exists
      if (user.interests.includes(interestToAdd)) {
        setValidationErrors({ interest: ['This interest is already added'] })
        return
      }
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        interests: [...prev.interests, interestToAdd]
      } : null)
      setNewInterest("")
      setValidationErrors({})
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Add interest to database
      await addInterest(interestToAdd)
    } catch (err) {
      console.error('Error adding interest:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        interests: prev.interests.filter(i => i !== interestToAdd)
      } : null)
      setNewInterest(interestToAdd)
    }
  }

  const handleRemoveInterest = async (interest: string) => {
    if (!user) return
    
    try {
      setError(null)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        interests: prev.interests.filter(i => i !== interest)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Remove interest from database
      await removeInterest(interest)
    } catch (err) {
      console.error('Error removing interest:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        interests: [...prev.interests, interest]
      } : null)
    }
  }

  // Hobbies and Sports handlers
  const handleAddHobbyOrSport = async () => {
    if (!newHobbyOrSport.trim() || !user) return
    
    const itemToAdd = sanitizeText(newHobbyOrSport.trim())
    
    try {
      setError(null)
      
      // Check if item already exists
      if (user.hobbiesAndSports.includes(itemToAdd)) {
        setValidationErrors({ hobbyOrSport: ['This item is already added'] })
        return
      }
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        hobbiesAndSports: [...prev.hobbiesAndSports, itemToAdd]
      } : null)
      setNewHobbyOrSport("")
      setValidationErrors({})
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await addHobbyOrSport(itemToAdd)
    } catch (err) {
      console.error('Error adding hobby or sport:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        hobbiesAndSports: prev.hobbiesAndSports.filter(item => item !== itemToAdd)
      } : null)
      setNewHobbyOrSport(itemToAdd)
    }
  }

  const handleRemoveHobbyOrSport = async (item: string) => {
    if (!user) return
    
    try {
      setError(null)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        hobbiesAndSports: prev.hobbiesAndSports.filter(h => h !== item)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await removeHobbyOrSport(item)
    } catch (err) {
      console.error('Error removing hobby or sport:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        hobbiesAndSports: [...prev.hobbiesAndSports, item]
      } : null)
    }
  }

  // Favorite Tools handlers
  const handleAddFavoriteTool = async () => {
    if (!newFavoriteTool.name.trim() || !user) return
    
    try {
      setError(null)
      
      const toolToAdd = {
        id: `tool-${Date.now()}`,
        name: sanitizeText(newFavoriteTool.name.trim()),
        description: newFavoriteTool.description ? sanitizeText(newFavoriteTool.description.trim()) : '',
        categories: newFavoriteTool.categories,
        link: newFavoriteTool.link ? sanitizeText(newFavoriteTool.link.trim()) : ''
      }
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        favoriteTools: [...prev.favoriteTools, toolToAdd]
      } : null)
      setNewFavoriteTool({ name: "", description: "", categories: [], link: "" })
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await addFavoriteTool(toolToAdd)
    } catch (err) {
      console.error('Error adding favorite tool:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        favoriteTools: prev.favoriteTools.filter(t => t.id !== `tool-${Date.now()}`)
      } : null)
      setNewFavoriteTool({ name: newFavoriteTool.name, description: newFavoriteTool.description, categories: newFavoriteTool.categories, link: newFavoriteTool.link })
    }
  }

  const handleRemoveFavoriteTool = async (toolId: string) => {
    if (!user) return
    
    try {
      setError(null)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        favoriteTools: prev.favoriteTools.filter(t => t.id !== toolId)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await removeFavoriteTool(toolId)
    } catch (err) {
      console.error('Error removing favorite tool:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update - we'd need to restore the tool, but for simplicity, just reload
      await loadUserProfile()
    }
  }

  const handleAddToolCategory = () => {
    if (newToolCategory.trim() && !newFavoriteTool.categories.includes(newToolCategory.trim())) {
      setNewFavoriteTool(prev => ({
        ...prev,
        categories: [...prev.categories, newToolCategory.trim()]
      }))
      setNewToolCategory("")
    }
  }

  const handleRemoveToolCategory = (category: string) => {
    setNewFavoriteTool(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }))
  }

  // Content Ingestion handlers
  const handleAddContentIngestionItem = async (type: 'podcasts' | 'youtubeChannels' | 'influencers' | 'newsSources') => {
    if (!user) return
    
    const value = newContentIngestion[type].trim()
    if (!value) return
    
    try {
      setError(null)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        contentIngestion: {
          ...prev.contentIngestion,
          [type]: [...prev.contentIngestion[type], sanitizeText(value)]
        }
      } : null)
      setNewContentIngestion(prev => ({ ...prev, [type]: "" }))
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await updateContentIngestion({
        ...user.contentIngestion,
        [type]: [...user.contentIngestion[type], sanitizeText(value)]
      })
    } catch (err) {
      console.error('Error adding content ingestion item:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      setUser(prev => prev ? {
        ...prev,
        contentIngestion: {
          ...prev.contentIngestion,
          [type]: prev.contentIngestion[type].filter((item: string) => item !== sanitizeText(value))
        }
      } : null)
      setNewContentIngestion(prev => ({ ...prev, [type]: value }))
    }
  }

  const handleRemoveContentIngestionItem = async (type: 'podcasts' | 'youtubeChannels' | 'influencers' | 'newsSources', index: number) => {
    if (!user) return
    
    try {
      setError(null)
      
      const itemToRemove = user.contentIngestion[type][index]
      const newItems = user.contentIngestion[type].filter((_, i) => i !== index)
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        contentIngestion: {
          ...prev.contentIngestion,
          [type]: newItems
        }
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await updateContentIngestion({
        ...user.contentIngestion,
        [type]: newItems
      })
    } catch (err) {
      console.error('Error removing content ingestion item:', err)
      setError(formatErrorMessage(err))
      
      // Revert optimistic update
      await loadUserProfile()
    }
  }

  // Project management handlers
  const handleAddProject = async () => {
    if (!newProject.title.trim() || !user) return
    
    try {
      setError(null)
      
      // Validate project
      const projectValidation = validateProject(newProject)
      const urlValidation = validateProjectUrl(newProject.url)
      
      const allErrors: Record<string, string[]> = {}
      if (!projectValidation.isValid) {
        allErrors.project = projectValidation.errors
      }
      if (!urlValidation.isValid) {
        allErrors.projectUrl = urlValidation.errors
      }
      
      if (Object.keys(allErrors).length > 0) {
        setValidationErrors(allErrors)
        return
      }
      
      // Check if we're in demo mode first
      if (user.id === "demo-user") {
        const projectToAdd = {
          id: `demo-project-${Date.now()}`,
          title: sanitizeText(newProject.title),
          description: newProject.description ? sanitizeText(newProject.description) : "",
          url: newProject.url,
          technologies: newProject.technologies,
          status: newProject.status
        }
        
        // Optimistic update for demo mode
        setUser(prev => prev ? {
          ...prev,
          projects: [...prev.projects, projectToAdd]
        } : null)
        setNewProject({
          title: "",
          description: "",
          url: "",
          technologies: [],
          status: "completed"
        })
        setShowProjectModal(false)
        setValidationErrors({})
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // For real users, save to database first, then update UI
      const savedProject = await addProject({
        title: sanitizeText(newProject.title),
        description: newProject.description ? sanitizeText(newProject.description) : undefined,
        links: {
          url: newProject.url || undefined,
          technologies: newProject.technologies,
          status: newProject.status
        }
      })
      
      // Update UI with the actual saved project data
      setUser(prev => prev ? {
        ...prev,
        projects: [...prev.projects, savedProject]
      } : null)
      setNewProject({
        title: "",
        description: "",
        url: "",
        technologies: [],
        status: "completed"
      })
      setShowProjectModal(false)
      setValidationErrors({})
    } catch (err) {
      console.error('Error adding project:', err)
      setError(formatErrorMessage(err))
      
      // Reset the form to allow retry
      setNewProject({
        title: newProject.title,
        description: newProject.description,
        url: newProject.url,
        technologies: newProject.technologies,
        status: newProject.status
      })
      setShowProjectModal(true)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return
    
    // Store the project to restore if deletion fails
    const projectToDelete = user.projects.find(p => p.id === projectId)
    
    try {
      setError(null)
      
      // Optimistic update - remove project from UI immediately
      setUser(prev => prev ? {
        ...prev,
        projects: prev.projects.filter(p => p.id !== projectId)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Save to database in background
      await deleteProject(projectId)
    } catch (err) {
      console.error('Error deleting project:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      
      // Revert optimistic update on error
      if (projectToDelete) {
        setUser(prev => prev ? {
          ...prev,
          projects: [...prev.projects, projectToDelete]
        } : null)
      }
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
  }

  const handleUpdateProject = async (updatedProject: Project) => {
    if (!user) return
    
    try {
      setError(null)
      
      // Validate project
      const projectValidation = validateProject(updatedProject)
      const urlValidation = validateProjectUrl(updatedProject.url || '')
      
      const allErrors: Record<string, string[]> = {}
      if (!projectValidation.isValid) {
        allErrors.project = projectValidation.errors
      }
      if (!urlValidation.isValid) {
        allErrors.projectUrl = urlValidation.errors
      }
      
      if (Object.keys(allErrors).length > 0) {
        setValidationErrors(allErrors)
        return
      }
      
      // Clear validation errors
      setValidationErrors({})
      
      // Optimistic update
      setUser(prev => prev ? {
        ...prev,
        projects: prev.projects.map(p => 
          p.id === updatedProject.id ? updatedProject : p
        )
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Update project in database
      await updateProject(updatedProject.id, {
        title: sanitizeText(updatedProject.title),
        description: updatedProject.description ? sanitizeText(updatedProject.description) : undefined,
        links: {
          url: updatedProject.url || undefined,
          technologies: updatedProject.technologies,
          status: updatedProject.status
        }
      })
      setEditingProject(null)
    } catch (err) {
      console.error('Error updating project:', err)
      setError(err instanceof Error ? err.message : 'Failed to update project')
      
      // Revert optimistic update - reload profile
      await loadUserProfile()
    }
  }

  const handleCancelEditProject = () => {
    setEditingProject(null)
  }

  const handleAddTechnology = () => {
    if (newTechnology.trim() && !newProject.technologies.includes(newTechnology.trim())) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }))
      setNewTechnology("")
    }
  }

  const handleRemoveTechnology = (tech: string) => {
    setNewProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  // Class management handlers
  const loadAvailableClasses = async () => {
    try {
      setLoadingClasses(true)
      console.log('Loading available classes...')
      const classes = await getAvailableClasses()
      console.log('Loaded classes:', classes.length, classes.slice(0, 5))
      setAvailableClasses(classes)
      
      // Filter out already added classes
      const addedClassIds = user?.classes?.map(c => c.id) || []
      const availableClassesFiltered = classes.filter(classItem => 
        !addedClassIds.includes(classItem.id)
      )
      setFilteredClasses(availableClassesFiltered)
    } catch (err) {
      console.error('Error loading classes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load classes')
    } finally {
      setLoadingClasses(false)
    }
  }

  // Filter classes based on search query and exclude already added classes
  const filterClasses = (query: string) => {
    // Get IDs of already added classes
    const addedClassIds = user?.classes?.map(c => c.id) || []
    
    // Filter out already added classes
    const availableClassesFiltered = availableClasses.filter(classItem => 
      !addedClassIds.includes(classItem.id)
    )
    
    if (!query.trim()) {
      setFilteredClasses(availableClassesFiltered)
      return
    }
    
    const filtered = availableClassesFiltered.filter(classItem => 
      classItem.code.toLowerCase().includes(query.toLowerCase()) ||
      classItem.title.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredClasses(filtered)
  }

  const handleAddClass = async () => {
    if (!newClass.classId || !user) return
    
    const selectedClass = availableClasses.find(c => c.id === newClass.classId)
    if (!selectedClass) {
      setError('Selected class not found')
      return
    }
    
    try {
      setError(null)
      
      const classToAdd = {
        id: selectedClass.id,
        title: selectedClass.title,
        code: selectedClass.code,
        semester: selectedClass.semester,
        year: selectedClass.year
      }
      
      // Optimistic update - add class to UI immediately
      setUser(prev => prev ? {
        ...prev,
        classes: [...prev.classes, classToAdd]
      } : null)
      setNewClass({ classId: "", role: "mentor" })
      setClassSearchQuery("")
      setShowClassModal(false)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Save to database in background
      await addClass(newClass.classId)
    } catch (err) {
      console.error('Error adding class:', err)
      setError(err instanceof Error ? err.message : 'Failed to add class')
      
      // Revert optimistic update on error
      setUser(prev => prev ? {
        ...prev,
        classes: prev.classes.filter(c => c.id !== selectedClass.id)
      } : null)
      setNewClass({ classId: selectedClass.id, role: newClass.role })
      setShowClassModal(true)
    }
  }

  const handleRemoveClass = async (classId: string) => {
    if (!user) return
    
    // Store the class to restore if deletion fails
    const classToDelete = user.classes.find(c => c.id === classId)
    
    try {
      setError(null)
      
      // Optimistic update - remove class from UI immediately
      setUser(prev => prev ? {
        ...prev,
        classes: prev.classes.filter(c => c.id !== classId)
      } : null)
      
      // Check if we're in demo mode
      if (user.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      // Save to database in background
      await removeClass(classId)
    } catch (err) {
      console.error('Error removing class:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove class')
      
      // Revert optimistic update on error
      if (classToDelete) {
        setUser(prev => prev ? {
          ...prev,
          classes: [...prev.classes, classToDelete]
        } : null)
      }
    }
  }

  // File upload handlers
  const handleResumeUpload = async (file: File) => {
    try {
      setUploadingResume(true)
      setError(null)
      
      // Check if we're in demo mode
      if (user?.id === "demo-user") {
        setError("Demo mode: File uploads are not available. Set up database for real functionality.")
        return
      }
      
      const result = await uploadResume(file)
      setNewResumeUrl(result.url)
      // Reload profile to get updated data
      await loadUserProfile()
    } catch (err) {
      console.error('Error uploading resume:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    // Convert HEIC to JPEG if needed, then show cropper
    let processedFile = file
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      try {
        console.log('Converting HEIC to JPEG...')
        // Dynamic import to avoid SSR issues
        const heic2any = (await import('heic2any')).default
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        }) as Blob
        
        processedFile = new File([convertedBlob], 'avatar.jpg', { type: 'image/jpeg' })
        console.log('HEIC conversion successful')
      } catch (error) {
        console.error('HEIC conversion failed:', error)
        setError('Failed to convert HEIC image to JPEG')
        return
      }
    }
    
    // Create image URL for cropper
    const imageUrl = URL.createObjectURL(processedFile)
    setCropperImageSrc(imageUrl)
  }

  const handleCroppedImage = async (croppedImageBlob: Blob) => {
    try {
      setUploadingAvatar(true)
      setError(null)
      
      // Check if we're in demo mode
      if (user?.id === "demo-user") {
        setError("Demo mode: File uploads are not available. Set up database for real functionality.")
        return
      }
      
      // Convert blob to File
      const file = new File([croppedImageBlob], 'profile-picture.jpg', { type: 'image/jpeg' })
      const result = await uploadAvatar(file)
      console.log('Avatar upload result:', result)
      
      // Clean up the image URL
      if (cropperImageSrc) {
        URL.revokeObjectURL(cropperImageSrc)
        setCropperImageSrc(null)
      }
      
      // Force reload profile to get updated data
      setLoading(true)
      await loadUserProfile()
      console.log('User after reload:', user)
      stopEditingSection('profileHeader')
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCancelCrop = () => {
    if (cropperImageSrc) {
      URL.revokeObjectURL(cropperImageSrc)
      setCropperImageSrc(null)
    }
    stopEditingSection('profileHeader')
  }

  const handleDeleteResume = async () => {
    try {
      setUploadingResume(true)
      setError(null)
      
      // Check if we're in demo mode
      if (user?.id === "demo-user") {
        setNewResumeUrl("")
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await deleteResume()
      setNewResumeUrl("")
      // Reload profile to get updated data
      await loadUserProfile()
    } catch (err) {
      console.error('Error deleting resume:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete resume')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      setUploadingAvatar(true)
      setError(null)
      
      // Check if we're in demo mode
      if (user?.id === "demo-user") {
        setError("Demo mode: Changes are not persisted. Set up database for real functionality.")
        return
      }
      
      await deleteAvatar()
      // Reload profile to get updated data
      await loadUserProfile()
    } catch (err) {
      console.error('Error deleting avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-cardinal" />
            <span className="text-gray-600">Loading your profile...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error || 'Profile not found'}</p>
            <Button onClick={loadUserProfile} variant="cardinal">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Edit your profile to get recommended to other IYA students</p>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="flex items-start space-x-6">
              <div className="relative">
                {user.avatar ? (
                  <>
                    {console.log('Rendering avatar image:', user.avatar)}
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        console.log('Image failed to load:', user.avatar)
                        e.currentTarget.style.display = 'none'
                      }}
                      onLoad={() => console.log('Image loaded successfully:', user.avatar)}
                    />
                  </>
                ) : (
                  <>
                    {console.log('No avatar found, showing initial:', user.avatar)}
                    <div className="w-24 h-24 bg-cardinal rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {user.name.charAt(0)}
                    </div>
                  </>
                )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                    onClick={() => startEditingSection('profileHeader')}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <span className="px-3 py-1 bg-gold text-gray-900 text-sm font-medium rounded-full">
                      {user.year} • {user.cohort}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Home className="h-4 w-4" />
                      <span>{user.hometown}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Picture Upload Section */}
              {isEditingSection('profileHeader') && (
                <div className="border-t pt-6">
                  {cropperImageSrc ? (
                    <AvatarCropper
                      imageSrc={cropperImageSrc}
                      onCropComplete={handleCroppedImage}
                      onCancel={handleCancelCrop}
                      loading={uploadingAvatar}
                    />
                  ) : (
                    <div className="max-w-md">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Profile Picture</h3>
                      <FileUpload
                        onFileSelect={handleAvatarUpload}
                        accept="image/*"
                        maxSize={2}
                        type="avatar"
                        currentFile={user.avatar}
                        onDelete={handleDeleteAvatar}
                        loading={uploadingAvatar}
                      />
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => stopEditingSection('profileHeader')}
                          disabled={uploadingAvatar}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button 
                          variant="cardinal" 
                          size="sm"
                          onClick={() => stopEditingSection('profileHeader')}
                          disabled={uploadingAvatar}
                          className="flex-1"
                        >
                          {uploadingAvatar ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          {uploadingAvatar ? 'Saving...' : 'Done'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Basic Information</CardTitle>
              {!isEditingSection('basicInfo') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('basicInfo')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button 
                  variant="cardinal" 
                  size="sm"
                  onClick={handleSaveBasicInfo}
                  disabled={isSavingSection('basicInfo')}
                >
                  {isSavingSection('basicInfo') ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSavingSection('basicInfo') ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                {isEditingSection('basicInfo') ? (
                  <div>
                  <Input
                    value={user.name}
                    onChange={(e) => setUser(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                      className={getValidationError('profile') ? 'border-red-500' : ''}
                  />
                    {getValidationError('profile') && (
                      <p className="text-red-500 text-xs mt-1">{getValidationError('profile')}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year
                </label>
                <p className="text-gray-900">{user.year || "Not specified"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cohort
                </label>
                <p className="text-gray-900">{user.cohort || "Not specified"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modality
                </label>
                {isEditingSection('basicInfo') ? (
                  <select
                    value={user.modality || ""}
                    onChange={(e) => setUser(prev => prev ? ({ ...prev, modality: e.target.value as 'in-person' | 'online' | 'hybrid' }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal"
                  >
                    <option value="">Select modality...</option>
                    <option value="in-person">In Person</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formatDisplayValue(user.modality)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditingSection('basicInfo') ? (
                  <Input
                    value={user.location || ""}
                    onChange={(e) => setUser(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                    placeholder="Current location"
                  />
                ) : (
                  <p className="text-gray-900">{user.location || "Not specified"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hometown
                </label>
                {isEditingSection('basicInfo') ? (
                  <Input
                    value={user.hometown || ""}
                    onChange={(e) => setUser(prev => prev ? ({ ...prev, hometown: e.target.value }) : null)}
                    placeholder="Hometown"
                  />
                ) : (
                  <p className="text-gray-900">{user.hometown || "Not specified"}</p>
                )}
              </div>
            </div>
            
            {/* Freeform Bio Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditingSection('basicInfo') ? (
                <textarea
                  value={user.bio || ""}
                  onChange={(e) => setUser(prev => prev ? ({ ...prev, bio: e.target.value }) : null)}
                  placeholder="Tell other IYA students who you are..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal"
                  rows={4}
                />
              ) : (
                <p className="text-gray-900">{user.bio || "Tell other IYA students who you are..."}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-cardinal" />
                <span>Skills</span>
              </CardTitle>
              {!isEditingSection('skills') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('skills')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('skills')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{skill}</span>
                  {isEditingSection('skills') && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditingSection('skills') && (
              <div>
              <div className="flex space-x-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    className={getValidationError('skill') ? 'border-red-500' : ''}
                />
                <Button onClick={handleAddSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
                </div>
                {getValidationError('skill') && (
                  <p className="text-red-500 text-xs mt-1">{getValidationError('skill')}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <span>Organizations and Clubs</span>
              </CardTitle>
              {!isEditingSection('organizations') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('organizations')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowOrganizationModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('organizations')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {user.organizations.map((org) => (
                <div key={org.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{org.name}</h3>
                        {org.type === 'usc' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
                            USC
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{org.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          org.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {org.role}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {org.status}
                        </span>
                      </div>
                    </div>
                    {isEditingSection('organizations') && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditOrganization(org)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveOrganization(org.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Edit Organization Modal */}
            {editingOrganization && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-semibold mb-4">Edit Organization</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingOrganization.name}
                        onChange={(e) => setEditingOrganization((prev) => prev ? ({ ...prev, name: e.target.value }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editingOrganization.description}
                        onChange={(e) => setEditingOrganization((prev) => prev ? ({ ...prev, description: e.target.value }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={editingOrganization.role}
                        onChange={(e) => setEditingOrganization((prev) => prev ? ({ ...prev, role: e.target.value as 'admin' | 'member' }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingOrganization.status}
                        onChange={(e) => setEditingOrganization((prev) => prev ? ({ ...prev, status: e.target.value as 'active' | 'past' }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="past">Past</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={editingOrganization.type}
                        onChange={(e) => setEditingOrganization((prev) => prev ? ({ ...prev, type: e.target.value as 'usc' | 'non-usc' }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                      >
                        <option value="usc">USC</option>
                        <option value="non-usc">Non-USC</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEditOrganization}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleUpdateOrganization(editingOrganization)}
                      disabled={!editingOrganization.name.trim()}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {isEditingSection('organizations') && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowOrganizationModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <span>Interests</span>
              </CardTitle>
              {!isEditingSection('interests') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('interests')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('interests')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{interest}</span>
                  {isEditingSection('interests') && (
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-blue-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditingSection('interests') && (
              <div>
                <div className="flex space-x-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                    className={getValidationError('interest') ? 'border-red-500' : ''}
                  />
                  <Button onClick={handleAddInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {getValidationError('interest') && (
                  <p className="text-red-500 text-xs mt-1">{getValidationError('interest')}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-cardinal" />
                <span>Projects</span>
              </CardTitle>
              {!isEditingSection('projects') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('projects')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowProjectModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('projects')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.projects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {project.status === 'completed' ? 'Completed' :
                           project.status === 'in-progress' ? 'In Progress' : 'Planned'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-cardinal hover:text-cardinal-light mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Project</span>
                        </a>
                      )}
                    </div>
                    {isEditingSection('projects') && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isEditingSection('projects') && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowProjectModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Project Modal */}
        {editingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject((prev) => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject((prev) => prev ? ({ ...prev, description: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="url"
                    value={editingProject.url}
                    onChange={(e) => setEditingProject((prev) => prev ? ({ ...prev, url: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject((prev) => prev ? ({ ...prev, status: e.target.value as 'completed' | 'in-progress' | 'planned' }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                  >
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingProject.technologies.map((tech: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center space-x-1">
                        <span>{tech}</span>
                        <button
                          onClick={() => setEditingProject((prev) => prev ? ({
                            ...prev,
                            technologies: prev.technologies.filter((_, i: number) => i !== index)
                          }) : null)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (newTechnology.trim() && !editingProject.technologies.includes(newTechnology.trim())) {
                            setEditingProject((prev) => prev ? ({
                              ...prev,
                              technologies: [...prev.technologies, newTechnology.trim()]
                            }) : null)
                            setNewTechnology('')
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                      placeholder="Add technology"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newTechnology.trim() && !editingProject.technologies.includes(newTechnology.trim())) {
                          setEditingProject((prev) => ({
                            ...prev!,
                            technologies: [...prev!.technologies, newTechnology.trim()]
                          }))
                          setNewTechnology('')
                        }
                      }}
                      disabled={!newTechnology.trim() || editingProject.technologies.includes(newTechnology.trim())}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={handleCancelEditProject}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleUpdateProject(editingProject)}
                  disabled={!editingProject.title.trim()}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Organization Modal */}
        {showOrganizationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Add Organization</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={newOrganization.name}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Organization name"
                    className="text-sm"
                  />
                  <Input
                    value={newOrganization.description}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    value={newOrganization.role}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={newOrganization.status}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, status: e.target.value as 'active' | 'past' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="past">Past</option>
                  </select>
                  <select
                    value={newOrganization.type}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, type: e.target.value as 'usc' | 'non-usc' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal text-sm"
                  >
                    <option value="usc">USC</option>
                    <option value="non-usc">Non-USC</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrganizationModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleAddOrganization()
                    setShowOrganizationModal(false)
                  }}
                  disabled={!newOrganization.name.trim()}
                >
                  Add Organization
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Tool Modal */}
        {showToolModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">{editingTool ? 'Edit Tool' : 'Add Tool'}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={editingTool ? editingTool.name : newFavoriteTool.name}
                    onChange={(e) => {
                      if (editingTool) {
                        setEditingTool((prev) => prev ? ({ ...prev, name: e.target.value }) : null)
                      } else {
                        setNewFavoriteTool((prev) => ({ ...prev, name: e.target.value }))
                      }
                    }}
                    placeholder="Tool name"
                    className="text-sm"
                  />
                  <Input
                    value={editingTool ? editingTool.link : newFavoriteTool.link}
                    onChange={(e) => {
                      if (editingTool) {
                        setEditingTool((prev) => prev ? ({ ...prev, link: e.target.value }) : null)
                      } else {
                        setNewFavoriteTool((prev) => ({ ...prev, link: e.target.value }))
                      }
                    }}
                    placeholder="Link (optional)"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Input
                    value={editingTool ? editingTool.description : newFavoriteTool.description}
                    onChange={(e) => {
                      if (editingTool) {
                        setEditingTool((prev) => prev ? ({ ...prev, description: e.target.value }) : null)
                      } else {
                        setNewFavoriteTool((prev) => ({ ...prev, description: e.target.value }))
                      }
                    }}
                    placeholder="Description (optional)"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(editingTool ? editingTool.categories : newFavoriteTool.categories).map((category: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded flex items-center space-x-1">
                        <span>{category}</span>
                        <button
                          onClick={() => {
                            if (editingTool) {
                              setEditingTool((prev) => prev ? ({
                                ...prev,
                                categories: prev.categories.filter((c: string) => c !== category)
                              }) : null)
                            } else {
                              handleRemoveToolCategory(category)
                            }
                          }}
                          className="text-purple-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={newToolCategory}
                      onChange={(e) => setNewToolCategory(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddToolCategory()
                        }
                      }}
                      placeholder="Add category"
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (editingTool) {
                          if (newToolCategory.trim() && !editingTool.categories.includes(newToolCategory.trim())) {
                            setEditingTool((prev) => prev ? ({
                              ...prev,
                              categories: [...prev.categories, newToolCategory.trim()]
                            }) : null)
                            setNewToolCategory("")
                          }
                        } else {
                          handleAddToolCategory()
                        }
                      }}
                      disabled={!newToolCategory.trim() || (editingTool ? editingTool.categories.includes(newToolCategory.trim()) : newFavoriteTool.categories.includes(newToolCategory.trim()))}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowToolModal(false)
                    setEditingTool(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (editingTool) {
                      handleUpdateTool(editingTool)
                      setShowToolModal(false)
                      setEditingTool(null)
                    } else {
                      handleAddFavoriteTool()
                      setShowToolModal(false)
                    }
                  }}
                  disabled={editingTool ? !editingTool.name.trim() : !newFavoriteTool.name.trim()}
                >
                  {editingTool ? 'Update Tool' : 'Add Tool'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hobbies and Sports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-gold" />
                <span>Hobbies and Sports</span>
              </CardTitle>
              {!isEditingSection('hobbiesAndSports') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('hobbiesAndSports')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('hobbiesAndSports')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {user.hobbiesAndSports.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{item}</span>
                  {isEditingSection('hobbiesAndSports') && (
                    <button
                      onClick={() => handleRemoveHobbyOrSport(item)}
                      className="text-yellow-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditingSection('hobbiesAndSports') && (
              <div>
                <div className="flex space-x-2">
                  <Input
                    value={newHobbyOrSport}
                    onChange={(e) => setNewHobbyOrSport(e.target.value)}
                    placeholder="Add hobby, sport, or activity"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddHobbyOrSport()}
                    className={getValidationError('hobbyOrSport') ? 'border-red-500' : ''}
                  />
                  <Button onClick={handleAddHobbyOrSport} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {getValidationError('hobbyOrSport') && (
                  <p className="text-red-500 text-xs mt-1">{getValidationError('hobbyOrSport')}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                <span>Quick Links</span>
              </CardTitle>
              {!isEditingSection('quickLinks') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('quickLinks')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('quickLinks')}
                    disabled={isSavingSection('quickLinks')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    variant="cardinal" 
                    size="sm"
                    onClick={handleSaveQuickLinks}
                    disabled={isSavingSection('quickLinks')}
                  >
                    {isSavingSection('quickLinks') ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSavingSection('quickLinks') ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* LinkedIn Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  user.linkedinUrl ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {user.linkedinUrl ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-700">LinkedIn Profile</span>
              </div>
              {user.linkedinUrl && (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cardinal hover:text-cardinal-light"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Resume Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  user.resumeUrl ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {user.resumeUrl ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-700">Resume</span>
              </div>
              {user.resumeUrl && (
                <a
                  href={user.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cardinal hover:text-cardinal-light"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Personal Website Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  user.personalWebsite ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {user.personalWebsite ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-700">Personal Website</span>
              </div>
              {user.personalWebsite && (
                <a
                  href={user.personalWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cardinal hover:text-cardinal-light"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* GitHub Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  user.github ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {user.github ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-700">GitHub</span>
              </div>
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cardinal hover:text-cardinal-light"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {isEditingSection('quickLinks') && (
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <div>
                  <Input
                    value={newLinkedInUrl}
                    onChange={(e) => setNewLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                      className={`text-sm ${getValidationError('linkedin') ? 'border-red-500' : ''}`}
                  />
                    {getValidationError('linkedin') && (
                      <p className="text-red-500 text-xs mt-1">{getValidationError('linkedin')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resume
                  </label>
                  <FileUpload
                    onFileSelect={handleResumeUpload}
                    accept=".pdf"
                    maxSize={5}
                    type="resume"
                    currentFile={user.resumeUrl}
                    onDelete={handleDeleteResume}
                    loading={uploadingResume}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Website
                  </label>
                  <Input
                    value={newPersonalWebsite}
                    onChange={(e) => setNewPersonalWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub
                  </label>
                  <Input
                    value={newGithub}
                    onChange={(e) => setNewGithub(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Tools */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-purple-600" />
                <span>Favorite Tools</span>
              </CardTitle>
              {!isEditingSection('favoriteTools') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('favoriteTools')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowToolModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('favoriteTools')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {user.favoriteTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-start justify-between p-4 bg-purple-50 rounded-lg"
                >
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
                  {isEditingSection('favoriteTools') && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTool(tool)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <button
                        onClick={() => handleRemoveFavoriteTool(tool.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isEditingSection('favoriteTools') && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowToolModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Want to Learn */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Want to Learn</span>
              </CardTitle>
              {!isEditingSection('wantToLearn') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('wantToLearn')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('wantToLearn')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {user.wantToLearn.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{skill}</span>
                  {isEditingSection('wantToLearn') && (
                    <button
                      onClick={() => handleRemoveWantToLearn(skill)}
                      disabled={loadingStates[`removeWantToLearn-${skill}`]}
                      className="text-orange-500 hover:text-red-500 disabled:opacity-50"
                    >
                      {loadingStates[`removeWantToLearn-${skill}`] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditingSection('wantToLearn') && (
              <div className="flex space-x-2">
                <Input
                  value={newWantToLearn}
                  onChange={(e) => setNewWantToLearn(e.target.value)}
                  placeholder="Add skill"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddWantToLearn()}
                  className="text-sm"
                />
                <Button 
                  onClick={handleAddWantToLearn} 
                  size="sm"
                  disabled={loadingStates.addWantToLearn}
                >
                  {loadingStates.addWantToLearn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Ingestion */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <span>Content Ingestion</span>
              </CardTitle>
              {!isEditingSection('contentIngestion') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('contentIngestion')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('contentIngestion')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-indigo-700 mb-2">
                  Podcasts
                </label>
                <div className="space-y-1 mb-2">
                  {user.contentIngestion.podcasts.map((podcast, index) => (
                    <div key={index} className="flex items-center justify-between px-2 py-1 bg-indigo-50 rounded text-sm">
                      <span className="text-gray-700">{podcast}</span>
                      {isEditingSection('contentIngestion') && (
                        <button
                          onClick={() => handleRemoveContentIngestionItem('podcasts', index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditingSection('contentIngestion') && (
                  <div className="flex space-x-2">
                    <Input
                      value={newContentIngestion.podcasts}
                      onChange={(e) => setNewContentIngestion(prev => ({ ...prev, podcasts: e.target.value }))}
                      placeholder="Add podcast"
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddContentIngestionItem('podcasts')}
                    />
                    <Button onClick={() => handleAddContentIngestionItem('podcasts')} size="sm">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-red-700 mb-2">
                  YouTube Channels
                </label>
                <div className="space-y-1 mb-2">
                  {user.contentIngestion.youtubeChannels.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between px-2 py-1 bg-red-50 rounded text-sm">
                      <span className="text-gray-700">{channel}</span>
                      {isEditingSection('contentIngestion') && (
                        <button
                          onClick={() => handleRemoveContentIngestionItem('youtubeChannels', index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditingSection('contentIngestion') && (
                  <div className="flex space-x-2">
                    <Input
                      value={newContentIngestion.youtubeChannels}
                      onChange={(e) => setNewContentIngestion(prev => ({ ...prev, youtubeChannels: e.target.value }))}
                      placeholder="Add YouTube channel"
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddContentIngestionItem('youtubeChannels')}
                    />
                    <Button onClick={() => handleAddContentIngestionItem('youtubeChannels')} size="sm">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">
                  Influencers
                </label>
                <div className="space-y-1 mb-2">
                  {user.contentIngestion.influencers.map((influencer, index) => (
                    <div key={index} className="flex items-center justify-between px-2 py-1 bg-yellow-50 rounded text-sm">
                      <span className="text-gray-700">{influencer}</span>
                      {isEditingSection('contentIngestion') && (
                        <button
                          onClick={() => handleRemoveContentIngestionItem('influencers', index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditingSection('contentIngestion') && (
                  <div className="flex space-x-2">
                    <Input
                      value={newContentIngestion.influencers}
                      onChange={(e) => setNewContentIngestion(prev => ({ ...prev, influencers: e.target.value }))}
                      placeholder="Add influencer"
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddContentIngestionItem('influencers')}
                    />
                    <Button onClick={() => handleAddContentIngestionItem('influencers')} size="sm">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">
                  News Sources
                </label>
                <div className="space-y-1 mb-2">
                  {user.contentIngestion.newsSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between px-2 py-1 bg-green-100 rounded text-sm">
                      <span className="text-green-700">{source}</span>
                      {isEditingSection('contentIngestion') && (
                        <button
                          onClick={() => handleRemoveContentIngestionItem('newsSources', index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditingSection('contentIngestion') && (
                  <div className="flex space-x-2">
                    <Input
                      value={newContentIngestion.newsSources}
                      onChange={(e) => setNewContentIngestion(prev => ({ ...prev, newsSources: e.target.value }))}
                      placeholder="Add news source"
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddContentIngestionItem('newsSources')}
                    />
                    <Button onClick={() => handleAddContentIngestionItem('newsSources')} size="sm">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-cardinal" />
                <span>Classes</span>
              </CardTitle>
              {!isEditingSection('classes') ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startEditingSection('classes')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      await loadAvailableClasses()
                      setShowClassModal(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopEditingSection('classes')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.classes.map((classItem) => (
                <div key={classItem.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{classItem.code} - {classItem.title}</h3>
                  <p className="text-sm text-gray-600">{classItem.instructor ? `Instructor: ${classItem.instructor}` : ''}</p>
                  <div className="flex items-center justify-between mt-2">
                    {classItem.semester && (
                      <span className="text-xs text-gray-500">{classItem.semester}</span>
                        )}
                      </div>
                    </div>
                    {isEditingSection('classes') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveClass(classItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isEditingSection('classes') && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowClassModal(true)
                      loadAvailableClasses()
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Class
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Creation Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <div>
                  <Input
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title"
                    className={getValidationError('project') ? 'border-red-500' : ''}
                  />
                  {getValidationError('project') && (
                    <p className="text-red-500 text-xs mt-1">{getValidationError('project')}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project URL
                </label>
                <div>
                  <Input
                    value={newProject.url}
                    onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-project.com"
                    className={getValidationError('projectUrl') ? 'border-red-500' : ''}
                  />
                  {getValidationError('projectUrl') && (
                    <p className="text-red-500 text-xs mt-1">{getValidationError('projectUrl')}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technologies
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="Add technology"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTechnology()}
                  />
                  <Button onClick={handleAddTechnology} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newProject.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center space-x-1">
                      <span>{tech}</span>
                      <button
                        onClick={() => handleRemoveTechnology(tech)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value as 'completed' | 'in-progress' | 'planned' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cardinal"
                >
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowProjectModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="cardinal"
                onClick={handleAddProject}
                disabled={!newProject.title.trim()}
                className="flex-1"
              >
                Add Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Class Selection Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Add Class</h3>
            
            {/* Search Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Classes
              </label>
              <Input
                type="text"
                placeholder="Search by course code or title (e.g., 'IDSN 515' or 'Business')"
                value={classSearchQuery}
                onChange={(e) => {
                  setClassSearchQuery(e.target.value)
                  filterClasses(e.target.value)
                }}
                className="w-full"
              />
            </div>

            {/* Class Results */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
              {loadingClasses ? (
                <div className="p-4 text-center text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Loading classes...</p>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {classSearchQuery ? 'No classes found matching your search.' : 'Start typing to search for classes...'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        newClass.classId === classItem.id ? 'bg-cardinal/10 border-l-4 border-cardinal' : ''
                      }`}
                      onClick={() => setNewClass(prev => ({ ...prev, classId: classItem.id }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{classItem.code}</div>
                          <div className="text-sm text-gray-600">{classItem.title}</div>
                        </div>
                        {newClass.classId === classItem.id && (
                          <Check className="h-5 w-5 text-cardinal" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowClassModal(false)
                  setClassSearchQuery("")
                  setNewClass({ classId: "", role: "mentor" })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="cardinal"
                onClick={handleAddClass}
                disabled={!newClass.classId}
                className="flex-1"
              >
                Add Class
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
