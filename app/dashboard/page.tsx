"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Download, 
  Mic, 
  BarChart3,
  Calendar,
  User,
  Activity
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/database-schema"
import Link from "next/link"

type User = Database['public']['Tables']['users']['Row']
type DoctorProfile = Database['public']['Tables']['doctor_profiles']['Row']

export default function DoctorDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [stats, setStats] = useState({
    totalForms: 0,
    completedForms: 0,
    drafts: 0,
    thisMonth: 0
  })

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Fetch user data
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (userData) {
            setUser(userData)
            
            // Fetch doctor profile
            const { data: profileData } = await supabase
              .from('doctor_profiles')
              .select('*')
              .eq('user_id', authUser.id)
              .single()
            
            setDoctorProfile(profileData)
          }

          // TODO: Fetch actual form statistics from database
          // For now, using mock data
          setStats({
            totalForms: 24,
            completedForms: 18,
            drafts: 6,
            thisMonth: 8
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [supabase])

  const recentForms = [
    { id: 1, title: "Patient: Jean Dupont", status: "completed", date: "2024-01-15", progress: 100 },
    { id: 2, title: "Patient: Marie Tremblay", status: "draft", date: "2024-01-14", progress: 65 },
    { id: 3, title: "Patient: Pierre Gagnon", status: "in-progress", date: "2024-01-13", progress: 45 },
    { id: 4, title: "Patient: Sophie Martin", status: "completed", date: "2024-01-12", progress: 100 },
  ]

  const quickActions = [
    { title: "New Form", description: "Create a new CNESST report", icon: Plus, href: "/form/new", color: "bg-blue-500" },
    { title: "View Drafts", description: "Continue working on drafts", icon: Clock, href: "/form/drafts", color: "bg-orange-500" },
    { title: "Export Reports", description: "Download completed forms", icon: Download, href: "/exports", color: "bg-green-500" },
    { title: "Voice Recording", description: "Start voice dictation", icon: Mic, href: "/voice", color: "bg-purple-500" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "draft":
        return <Clock className="w-4 h-4 text-orange-500" />
      case "in-progress":
        return <AlertTriangle className="w-4 h-4 text-blue-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case "draft":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Draft</Badge>
      case "in-progress":
        return <Badge variant="outline" className="border-blue-200 text-blue-700">In Progress</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {doctorProfile?.credentials || user?.full_name || "Doctor"}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your medical documentation and patient reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/form/new">
              <Plus className="w-4 h-4 mr-2" />
              New Form
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForms}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedForms}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completedForms / stats.totalForms) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              Pending completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              New forms created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts for your workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Forms</CardTitle>
          <CardDescription>
            Your latest medical documentation work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentForms.map((form) => (
              <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(form.status)}
                  <div>
                    <div className="font-medium">{form.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(form.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Progress value={form.progress} className="w-20 h-2" />
                    <span className="text-sm text-gray-500">{form.progress}%</span>
                  </div>
                  {getStatusBadge(form.status)}
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link href="/form/drafts">View All Forms</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Platform health and compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-green-800">Voice Recording</div>
                <div className="text-sm text-green-600">Available</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="font-medium text-blue-800">AI Processing</div>
                <div className="text-sm text-blue-600">Online</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-green-800">Compliance</div>
                <div className="text-sm text-green-600">WCAG 2.1 Certified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
