"use client"

import { useState, useEffect, memo } from "react"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database as DatabaseType } from "@/lib/database-schema"
import MedicalSidebar from "@/components/navigation/medical-sidebar"
import { useLanguage } from "@/context/LanguageContext"

type User = DatabaseType['public']['Tables']['users']['Row']

const MedicalLayoutContent = memo(({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const pathname = usePathname()
  const supabase = createClientComponentClient<DatabaseType>()
  const { t } = useLanguage()

  // Load user data for display purposes
  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Try to get user profile
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          setUser(userData)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // For public routes, just render children directly
    if (pathname.startsWith('/auth/') || pathname === '/') {
      setLoading(false)
      return
    }

    // For protected routes, load user data for display
    loadUserData()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserData()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, pathname])

  // For public routes, render children directly
  if (pathname.startsWith('/auth/') || pathname === '/') {
    return <>{children}</>
  }

  // Show loading state for protected routes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Get page title and description based on current path
  const getPageInfo = () => {
    const isAdmin = user?.role === 'admin'
    
    switch (pathname) {
      case '/dashboard':
        return {
          title: t('nav.dashboard'),
          description: t('dashboard.manage_docs')
        }
      case '/admin/dashboard':
        return {
          title: t('admin.dashboard'),
          description: t('admin.system_admin')
        }
      case '/settings':
        return {
          title: t('nav.settings'),
          description: t('admin.configure_platform')
        }
      default:
        if (pathname.startsWith('/admin/')) {
          return {
            title: t('admin.dashboard'),
            description: t('admin.system_admin')
          }
        }
        return {
          title: t('nav.dashboard'),
          description: t('dashboard.manage_docs')
        }
    }
  }

  const pageInfo = getPageInfo()

  return (
    <div className="flex h-screen bg-gray-50">
      <MedicalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageInfo.title}</h1>
              <p className="text-gray-600">{pageInfo.description}</p>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
})

MedicalLayoutContent.displayName = 'MedicalLayoutContent'

export default function MedicalLayout({ children }: { children: React.ReactNode }) {
  return <MedicalLayoutContent>{children}</MedicalLayoutContent>
}
