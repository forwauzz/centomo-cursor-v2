"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CheckCircle, 
  AlertTriangle, 
  Circle, 
  FileText, 
  Download, 
  Mic, 
  MicOff, 
  Globe,
  LogOut,
  Settings,
  User,
  Shield,
  BarChart3,
  Users,
  Brain
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/database-schema"

type UserProfile = Database['public']['Tables']['doctor_profiles']['Row']
type User = Database['public']['Tables']['users']['Row']

const sections = [
  { id: 1, title: "Patient Information", titleFr: "Information du patient", path: "/form/section1", completed: true },
  { id: 2, title: "Physician Information", titleFr: "Information du médecin", path: "/form/section2", completed: true },
  { id: 3, title: "Report Overview", titleFr: "Aperçu du rapport", path: "/form/section3", completed: false, warning: true },
  { id: 4, title: "Identification & Background", titleFr: "Identification et contexte", path: "/form/section4", completed: false },
  { id: 5, title: "Medical History", titleFr: "Antécédents médicaux", path: "/form/section5", completed: false },
  { id: 6, title: "Current Treatment", titleFr: "Traitement actuel", path: "/form/section6", completed: false },
  { id: 7, title: "Physical Examination", titleFr: "Examen physique", path: "/form/section7", completed: false },
  { id: 8, title: "Subjective Assessment", titleFr: "Évaluation subjective", path: "/form/section8", completed: false },
  { id: 9, title: "Physical Exam Tables", titleFr: "Tableaux d'examen physique", path: "/form/section9", completed: false },
  { id: 10, title: "Additional Tests", titleFr: "Tests supplémentaires", path: "/form/section10", completed: false },
  { id: 11, title: "Medical Conclusions", titleFr: "Conclusions médicales", path: "/form/section11", completed: false },
]

const adminNavItems = [
  { id: "dashboard", title: "Admin Dashboard", titleFr: "Tableau de bord admin", path: "/admin/dashboard", icon: Shield },
  { id: "users", title: "User Management", titleFr: "Gestion des utilisateurs", path: "/admin/users", icon: Users },
  { id: "training", title: "AI Training", titleFr: "Formation IA", path: "/admin/training", icon: Brain },
  { id: "analytics", title: "Analytics", titleFr: "Analyses", path: "/admin/analytics", icon: BarChart3 },
]

const doctorNavItems = [
  { id: "dashboard", title: "Dashboard", titleFr: "Tableau de bord", path: "/dashboard", icon: BarChart3 },
  { id: "new-form", title: "New Form", titleFr: "Nouveau formulaire", path: "/form/new", icon: FileText },
  { id: "drafts", title: "Drafts", titleFr: "Brouillons", path: "/form/drafts", icon: FileText },
]

export default function MedicalSidebar() {
  const [currentSection, setCurrentSection] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [language, setLanguage] = useState<"en" | "fr">("en")
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient<Database>()

  const completedSections = sections.filter((s) => s.completed).length
  const progressPercentage = (completedSections / sections.length) * 100

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Fetch user profile from users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (userData) {
            setUser(userData)
            
            // Fetch doctor profile if user is a doctor
            if (userData.role === 'doctor') {
              const { data: profileData } = await supabase
                .from('doctor_profiles')
                .select('*')
                .eq('user_id', authUser.id)
                .single()
              
              setUserProfile(profileData)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "fr" : "en"))
  }

  const getText = (en: string, fr: string) => (language === "en" ? en : fr)

  const isAdmin = user?.role === 'admin'
  const isDoctor = user?.role === 'doctor'

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">CentomoMD</h1>
              <p className="text-sm text-gray-600">{getText("CNESST Medical Report", "Rapport médical CNESST")}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Globe className="w-4 h-4" />
            {language.toUpperCase()}
          </Button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role} • {getText("Online", "En ligne")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="text-xs">{getText("Auto-saved 2 min ago", "Sauvegarde auto 2 min")}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-transparent">
              <Download className="w-3 h-3 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-transparent">
              <Download className="w-3 h-3 mr-1" />
              Word
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto">
          <div className="p-3 space-y-1">
            {/* Role-based navigation */}
            {isAdmin && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {getText("Administration", "Administration")}
                </h3>
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        pathname === item.path ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {language === "en" ? item.title : item.titleFr}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {isDoctor && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {getText("Quick Actions", "Actions rapides")}
                </h3>
                {doctorNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        pathname === item.path ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {language === "en" ? item.title : item.titleFr}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Form Sections */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {getText("Form Sections", "Sections du formulaire")}
              </h3>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setCurrentSection(section.id)
                    router.push(section.path)
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    pathname === section.path ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {section.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : section.warning ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 w-6">
                        {section.id.toString().padStart(2, "0")}
                      </span>
                      <span
                        className={`text-sm font-medium leading-tight ${
                          pathname === section.path ? "text-blue-700" : "text-gray-900"
                        }`}
                      >
                        {language === "en" ? section.title : section.titleFr}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Settings */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => router.push('/settings')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                  pathname === '/settings' ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {getText("Settings", "Paramètres")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-200 space-y-3 flex-shrink-0">
        {/* Voice Recording */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{getText("Voice Recording", "Enregistrement vocal")}</span>
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
            className="h-8 w-8 p-0"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{getText("Form Progress", "Progression du formulaire")}</span>
            <span className="font-medium text-gray-900">
              {completedSections}/{sections.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Compliance Footer */}
        <div className="text-xs text-gray-500 text-center leading-tight">
          {getText("WCAG 2.1 Compliant • Healthcare Certified", "Conforme WCAG 2.1 • Certifié santé")}
        </div>
      </div>
    </div>
  )
}
