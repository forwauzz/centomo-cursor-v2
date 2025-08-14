"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Database } from "@/lib/database-schema"
import { createClientSupabaseClient } from "@/lib/supabase-client"
import MedicalSidebar from "@/components/navigation/medical-sidebar"
import { Card } from "@/components/ui/card"
import { FileText, Loader2 } from "lucide-react"

type User = Database['public']['Tables']['users']['Row']

interface MedicalLayoutProps {
  children: React.ReactNode
}

export default function MedicalLayout({ children }: MedicalLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientSupabaseClient()

  // Single authentication check function
  const checkAuthAndLoadUser = async () => {
    try {
      console.log('🔍 Starting auth check...')
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        setIsAuthenticated(false)
        setUser(null)
        if (!pathname.startsWith('/auth/')) {
          router.push('/auth/login')
        }
        return
      }

      if (!session?.user) {
        console.log('❌ No session found')
        setIsAuthenticated(false)
        setUser(null)
        if (!pathname.startsWith('/auth/')) {
          router.push('/auth/login')
        }
        return
      }

      console.log('✅ Session found for user:', session.user.email)
      console.log('🔍 Auth UID:', session.user.id)
      
      // Set authenticated immediately to prevent redirect loop
      setIsAuthenticated(true)

      // Try to get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userData) {
        console.log('✅ User profile loaded')
        setUser(userData)
        
        // Handle redirects only if on root path
        if (pathname === '/') {
          if (userData.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/dashboard')
          }
        }
      } else if (userError?.code === 'PGRST116') {
        console.log('🔄 Creating new user profile...')
        
        // Create user profile using auth user ID
        const newUserData = {
          id: session.user.id, // This matches auth.uid()
          email: session.user.email!,
          oauth_provider: session.user.app_metadata?.provider || 'email',
          oauth_sub: session.user.id,
          role: 'doctor' as const,
          status: 'active' as const,
          full_name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email!.split('@')[0] || 'User'
        }

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUserData])
          .select()
          .single()

        if (createdUser && !createError) {
          console.log('✅ User profile created successfully')
          setUser(createdUser)
          
          // Redirect new users to dashboard
          if (pathname === '/') {
            router.push('/dashboard')
          }
        } else {
          console.error('❌ Failed to create user profile:', createError)
          // Keep authenticated but without profile
        }
      } else {
        console.error('❌ Database error fetching user:', userError)
        // Keep authenticated but log the error
      }

    } catch (error) {
      console.error('❌ Authentication check failed:', error)
      // Don't change auth state on unexpected errors
    } finally {
      setLoading(false)
    }
  }

  // Main authentication effect
  useEffect(() => {
    checkAuthAndLoadUser()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 Auth state change:', event)
        
        if (event === 'SIGNED_OUT') {
          console.log('🔄 User signed out')
          setUser(null)
          setIsAuthenticated(false)
          router.push('/auth/login')
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔄 User signed in, reloading page to refresh state')
          // Reload page to ensure clean state
          window.location.reload()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed')
          // Token was refreshed, no need to reload
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array - only run once

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading CentomoMD</h2>
            <p className="text-gray-600">Initializing medical documentation platform...</p>
          </Card>
        </div>
      </div>
    )
  }

  // Don't show sidebar on auth pages
  if (pathname.startsWith('/auth/')) {
    return <>{children}</>
  }

  // Show layout for authenticated users
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <MedicalSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {getPageTitle(pathname, user?.role || 'doctor')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {getPageDescription(pathname, user?.role || 'doctor')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    )
  }

  // Fallback for unauthenticated users (shouldn't reach here normally)
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access CentomoMD</p>
        </Card>
      </div>
    </div>
  )
}

// Helper functions remain the same
function getPageTitle(pathname: string, userRole: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Doctor Dashboard',
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/users': 'User Management',
    '/admin/training': 'AI Training',
    '/admin/analytics': 'Analytics',
    '/form/new': 'New Medical Form',
    '/form/drafts': 'Form Drafts',
    '/settings': 'Settings',
    '/form/section1': 'Patient Information',
    '/form/section2': 'Physician Information',
    '/form/section3': 'Report Overview',
    '/form/section4': 'Identification & Background',
    '/form/section5': 'Medical History',
    '/form/section6': 'Current Treatment',
    '/form/section7': 'Physical Examination',
    '/form/section8': 'Subjective Assessment',
    '/form/section9': 'Physical Exam Tables',
    '/form/section10': 'Additional Tests',
    '/form/section11': 'Medical Conclusions',
  }

  return titles[pathname] || 'CentomoMD'
}

function getPageDescription(pathname: string, userRole: string): string {
  const descriptions: Record<string, string> = {
    '/dashboard': 'Manage your medical forms and patient documentation',
    '/admin/dashboard': 'Administrative dashboard for system management',
    '/admin/users': 'Manage user accounts and permissions',
    '/admin/training': 'Train and improve AI documentation capabilities',
    '/admin/analytics': 'View system analytics and usage statistics',
    '/form/new': 'Create a new CNESST medical report',
    '/form/drafts': 'View and edit your form drafts',
    '/settings': 'Configure your account and preferences',
  }

  if (pathname.startsWith('/form/section')) {
    const sectionNumber = pathname.split('/').pop()
    return `Section ${sectionNumber} of the CNESST medical form`
  }

  return descriptions[pathname] || 'Medical documentation platform'
}
