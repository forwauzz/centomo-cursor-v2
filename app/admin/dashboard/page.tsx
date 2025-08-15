"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Shield, 
  Brain, 
  BarChart3, 
  Plus, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Server,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Mail,
  UserPlus,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Target,
  Award,
  AlertCircle,
  Info,
  ExternalLink
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database as DatabaseType } from "@/lib/database-schema"
import { useLanguage } from "@/context/LanguageContext"
import Link from "next/link"

type User = DatabaseType['public']['Tables']['users']['Row']

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
  activeConnections: number
  uptime: number
}

interface AITrainingStatus {
  modelStatus: 'training' | 'ready' | 'error' | 'idle'
  accuracy: number
  trainingProgress: number
  lastTraining: string
  nextScheduled: string
  datasetSize: number
  trainingTime: number
}

interface AuditLog {
  id: string
  action: string
  userId: string
  userEmail: string
  timestamp: string
  ipAddress: string
  userAgent: string
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface PlatformAnalytics {
  totalUsers: number
  activeUsers: number
  totalForms: number
  formsThisMonth: number
  averageCompletionTime: number
  systemUptime: number
  errorRate: number
  userSatisfaction: number
}

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    activeConnections: 0,
    uptime: 0
  })
  const [aiTrainingStatus, setAiTrainingStatus] = useState<AITrainingStatus>({
    modelStatus: 'ready',
    accuracy: 0,
    trainingProgress: 0,
    lastTraining: '',
    nextScheduled: '',
    datasetSize: 0,
    trainingTime: 0
  })
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics>({
    totalUsers: 0,
    activeUsers: 0,
    totalForms: 0,
    formsThisMonth: 0,
    averageCompletionTime: 0,
    systemUptime: 0,
    errorRate: 0,
    userSatisfaction: 0
  })
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalForms: 0,
    systemHealth: 100
  })

  const supabase = createClientComponentClient<DatabaseType>()

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Fetch user data
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (userData && userData.role === 'admin') {
            setUser(userData)
            
            // Fetch enhanced admin data
            await fetchEnhancedAdminStats()
            await fetchSystemMetrics()
            await fetchAITrainingStatus()
            await fetchAuditLogs()
            await fetchPlatformAnalytics()
          }
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      }
    }

    fetchAdminData()
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      fetchSystemMetrics()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [supabase])

  const fetchEnhancedAdminStats = async () => {
    // TODO: Replace with actual database queries
    setStats({
      totalUsers: 156,
      activeUsers: 142,
      totalForms: 2847,
      systemHealth: 98
    })
  }

  const fetchSystemMetrics = async () => {
    // TODO: Replace with actual system monitoring
    setSystemMetrics({
      cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
      memoryUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
      diskUsage: Math.floor(Math.random() * 15) + 45, // 45-60%
      networkLatency: Math.floor(Math.random() * 50) + 10, // 10-60ms
      activeConnections: Math.floor(Math.random() * 100) + 200, // 200-300
      uptime: 99.8
    })
  }

  const fetchAITrainingStatus = async () => {
    // TODO: Replace with actual AI training status
    setAiTrainingStatus({
      modelStatus: 'ready',
      accuracy: 94.2,
      trainingProgress: 100,
      lastTraining: '2024-01-15T08:00:00Z',
      nextScheduled: '2024-01-22T08:00:00Z',
      datasetSize: 15420,
      trainingTime: 45 // minutes
    })
  }

  const fetchAuditLogs = async () => {
    // TODO: Replace with actual audit logs
    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        action: 'User Login',
        userId: 'user-123',
        userEmail: 'dr.dupont@centomo.ca',
        timestamp: '2024-01-15T10:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        details: 'Successful login from Montreal, QC',
        severity: 'low'
      },
      {
        id: '2',
        action: 'Form Export',
        userId: 'user-456',
        userEmail: 'dr.tremblay@centomo.ca',
        timestamp: '2024-01-15T09:45:00Z',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        details: 'Exported CNESST report as PDF',
        severity: 'low'
      },
      {
        id: '3',
        action: 'Admin Action',
        userId: 'admin-001',
        userEmail: 'admin@centomo.ca',
        timestamp: '2024-01-15T08:15:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        details: 'Updated system configuration',
        severity: 'medium'
      }
    ]
    setAuditLogs(mockAuditLogs)
  }

  const fetchPlatformAnalytics = async () => {
    // TODO: Replace with actual analytics
    setPlatformAnalytics({
      totalUsers: 156,
      activeUsers: 142,
      totalForms: 2847,
      formsThisMonth: 234,
      averageCompletionTime: 42, // minutes
      systemUptime: 99.8,
      errorRate: 0.2,
      userSatisfaction: 4.7
    })
  }

  const recentUsers = [
    { id: 1, name: "Dr. Jean Dupont", email: "jean.dupont@centomo.ca", role: "doctor", status: "active", joined: "2024-01-15" },
    { id: 2, name: "Dr. Marie Tremblay", email: "marie.tremblay@centomo.ca", role: "doctor", status: "pending", joined: "2024-01-14" },
    { id: 3, name: "Dr. Pierre Gagnon", email: "pierre.gagnon@centomo.ca", role: "doctor", status: "active", joined: "2024-01-13" },
    { id: 4, name: "Admin User", email: "admin@centomo.ca", role: "admin", status: "active", joined: "2024-01-12" },
  ]

  const systemAlerts = [
    { id: 1, type: "info", message: "AI training model updated successfully", time: "2 hours ago", severity: "low" },
    { id: 2, type: "warning", message: "High form submission rate detected", time: "4 hours ago", severity: "medium" },
    { id: 3, type: "success", message: "Backup completed successfully", time: "6 hours ago", severity: "low" },
  ]

  const adminActions = [
    { title: t('admin.user_management'), description: t('admin.manage_accounts'), icon: Users, href: "/admin/users", color: "bg-primary-500", badge: `${stats.totalUsers} ${t('admin.users')}` },
    { title: t('admin.ai_training'), description: t('admin.improve_ai'), icon: Brain, href: "/admin/training", color: "bg-purple-500", badge: aiTrainingStatus.modelStatus },
    { title: t('admin.analytics'), description: t('admin.view_analytics'), icon: BarChart3, href: "/admin/analytics", color: "bg-green-500", badge: t('admin.live') },
    { title: t('admin.system_settings'), description: t('admin.configure_platform'), icon: Settings, href: "/admin/settings", color: "bg-orange-500", badge: "Admin" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('users.active')}</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">{t('users.pending')}</Badge>
      case "inactive":
        return <Badge variant="outline" className="border-gray-200 text-gray-600">{t('users.inactive')}</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default" className="bg-red-100 text-red-800">Admin</Badge>
      case "doctor":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Doctor</Badge>
      case "staff":
        return <Badge variant="outline" className="border-gray-200 text-gray-600">Staff</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-orange-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low':
        return t('audit.low')
      case 'medium':
        return t('audit.medium')
      case 'high':
        return t('audit.high')
      case 'critical':
        return t('audit.critical')
      default:
        return severity.toUpperCase()
    }
  }

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 24)
    const hours = Math.floor(uptime % 24)
    return `${days}d ${hours}h`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.dashboard')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('admin.system_admin')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('admin.refresh')}
          </Button>
          <Button asChild className="bg-primary-600 hover:bg-primary-700">
            <Link href="/admin/users">
              <UserPlus className="w-4 h-4 mr-2" />
              {t('admin.invite_user')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total_users')}</CardTitle>
            <Users className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} {t('stats.active_users')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total_forms')}</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForms}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.medical_reports')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.system_health')}</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.all_systems')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.ai_training')}</CardTitle>
            <Brain className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiTrainingStatus.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.model_accuracy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Performance Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary-600" />
            {t('admin.system_performance')}
          </CardTitle>
          <CardDescription>
            {t('admin.real_time_metrics')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{t('admin.cpu_usage')}</span>
                </div>
                <span className="text-sm font-bold">{systemMetrics.cpuUsage}%</span>
              </div>
              <Progress value={systemMetrics.cpuUsage} className="h-2" />
            </div>
            
                         <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Database className="w-4 h-4 text-green-600" />
                   <span className="text-sm font-medium">{t('admin.memory_usage')}</span>
                 </div>
                 <span className="text-sm font-bold">{systemMetrics.memoryUsage}%</span>
               </div>
               <Progress value={systemMetrics.memoryUsage} className="h-2" />
             </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">{t('admin.disk_usage')}</span>
                </div>
                <span className="text-sm font-bold">{systemMetrics.diskUsage}%</span>
              </div>
              <Progress value={systemMetrics.diskUsage} className="h-2" />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Wifi className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">{t('admin.network_latency')}</div>
                <div className="text-sm text-gray-600">{systemMetrics.networkLatency}ms</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">{t('admin.active_connections')}</div>
                <div className="text-sm text-gray-600">{systemMetrics.activeConnections}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">{t('admin.uptime')}</div>
                <div className="text-sm text-gray-600">{systemMetrics.uptime}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Training System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            {t('ai.training_system')}
          </CardTitle>
          <CardDescription>
            {t('ai.ml_training')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                aiTrainingStatus.modelStatus === 'ready' ? 'bg-green-500' :
                aiTrainingStatus.modelStatus === 'training' ? 'bg-yellow-500 animate-pulse' :
                aiTrainingStatus.modelStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <div>
                <div className="font-medium text-gray-900">{t('ai.model_status')}</div>
                <div className="text-sm text-gray-600 capitalize">{aiTrainingStatus.modelStatus}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Target className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">{t('ai.accuracy')}</div>
                <div className="text-sm text-gray-600">{aiTrainingStatus.accuracy}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Database className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">{t('ai.dataset_size')}</div>
                <div className="text-sm text-gray-600">{aiTrainingStatus.datasetSize.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">{t('ai.last_training')}</div>
                <div className="text-sm text-gray-600">
                  {new Date(aiTrainingStatus.lastTraining).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              variant={aiTrainingStatus.modelStatus === 'training' ? "destructive" : "default"}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {aiTrainingStatus.modelStatus === 'training' ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  {t('ai.stop_training')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t('ai.start_training')}
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/training">
                <Settings className="w-4 h-4 mr-2" />
                {t('ai.training_settings')}
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('ai.export_model')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.actions')}</CardTitle>
          <CardDescription>
            {t('admin.system_management')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50 border-2 hover:border-primary-200"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                      {action.badge && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Platform Analytics and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.platform')}</CardTitle>
            <CardDescription>
              {t('analytics.kpi')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">{t('analytics.active_users')}</div>
                    <div className="text-sm text-gray-600">{t('analytics.last_30_days')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{platformAnalytics.activeUsers}</div>
                  <div className="text-xs text-green-600">+12% {t('analytics.from_last_month')}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{t('analytics.forms_this_month')}</div>
                    <div className="text-sm text-gray-600">{t('analytics.cnesst_reports')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{platformAnalytics.formsThisMonth}</div>
                  <div className="text-xs text-blue-600">+8% {t('analytics.from_last_month')}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">{t('analytics.avg_completion')}</div>
                    <div className="text-sm text-gray-600">{t('analytics.per_form')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{platformAnalytics.averageCompletionTime}m</div>
                  <div className="text-xs text-orange-600">-5% {t('analytics.from_last_month')}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">{t('analytics.user_satisfaction')}</div>
                    <div className="text-sm text-gray-600">{t('analytics.rating_out_of_5')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{platformAnalytics.userSatisfaction}/5</div>
                  <div className="text-xs text-purple-600">+0.2 {t('analytics.from_last_month')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>{t('users.recent_users')}</CardTitle>
            <CardDescription>
              {t('users.registrations')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/admin/users">{t('users.view_all')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs and System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle>{t('audit.logs')}</CardTitle>
            <CardDescription>
              {t('audit.system_activity')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    log.severity === 'low' ? 'bg-green-500' :
                    log.severity === 'medium' ? 'bg-yellow-500' :
                    log.severity === 'high' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{log.action}</span>
                      <span className={`text-xs ${getSeverityColor(log.severity)}`}>
                        {getSeverityLabel(log.severity)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {log.userEmail} • {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{log.details}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/admin/audit-logs">{t('audit.view_all')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>{t('alerts.system_alerts')}</CardTitle>
            <CardDescription>
              {t('alerts.notifications')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{alert.message}</div>
                    <div className="text-xs text-gray-500">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/admin/alerts">{t('alerts.view_all')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced System Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('system.enhanced_status')}</CardTitle>
          <CardDescription>
            {t('system.service_monitoring')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">{t('system.database')}</div>
                <div className="text-sm text-gray-600">{t('system.operational')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">{t('system.compliance')}</div>
                <div className="text-sm text-gray-600">{t('system.online')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">{t('system.ai_services')}</div>
                <div className="text-sm text-gray-600">{t('system.available')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-gray-900">{t('system.voice_processing')}</div>
                <div className="text-sm text-gray-600">{t('system.active')}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center gap-2 text-primary-800">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">{t('system.hipaa_compliant')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
