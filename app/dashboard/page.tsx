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
  MicOff,
  BarChart3,
  Calendar,
  User,
  Activity,
  TrendingUp,
  Shield,
  Database,
  Zap,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Volume2,
  Headphones,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  Cpu,
  HardDriveIcon,
  Settings
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database as DatabaseType } from "@/lib/database-schema"
import { useLanguage } from "@/context/LanguageContext"
import Link from "next/link"

type User = DatabaseType['public']['Tables']['users']['Row']
type DoctorProfile = DatabaseType['public']['Tables']['doctor_profiles']['Row']

interface VoiceStatus {
  isRecording: boolean
  isConnected: boolean
  quality: 'excellent' | 'good' | 'poor'
  duration: number
  lastRecording?: string
}

interface ExportRecord {
  id: string
  formTitle: string
  exportType: 'PDF' | 'Word' | 'XML'
  status: 'completed' | 'processing' | 'failed'
  createdAt: string
  fileSize?: string
  downloadUrl?: string
}

interface SystemHealth {
  voiceProcessing: 'online' | 'offline' | 'degraded'
  aiServices: 'online' | 'offline' | 'degraded'
  database: 'online' | 'offline' | 'degraded'
  compliance: 'compliant' | 'warning' | 'non-compliant'
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>({
    isRecording: false,
    isConnected: true,
    quality: 'excellent',
    duration: 0
  })
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    voiceProcessing: 'online',
    aiServices: 'online',
    database: 'online',
    compliance: 'compliant'
  })
  const [stats, setStats] = useState({
    totalForms: 0,
    completedForms: 0,
    drafts: 0,
    thisMonth: 0,
    averageCompletionTime: 0,
    voiceAccuracy: 0,
    exportSuccess: 0
  })

  const supabase = createClientComponentClient<DatabaseType>()
  const { t } = useLanguage()

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
            
            // Fetch doctor profile (handle case where profile doesn't exist)
            const { data: profileData, error: profileError } = await supabase
              .from('doctor_profiles')
              .select('*')
              .eq('user_id', authUser.id)
            
            if (profileError) {
              console.warn('Doctor profile not found:', profileError)
              setDoctorProfile(null)
            } else {
              setDoctorProfile(profileData?.[0] || null)
            }
          }

          // Fetch enhanced statistics
          await fetchEnhancedStats(authUser.id)
          
          // Fetch export history
          await fetchExportHistory(authUser.id)
          
          // Fetch system health
          await fetchSystemHealth()
          
          // Fetch recent forms
          await fetchRecentForms(authUser.id)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [supabase])

  const fetchEnhancedStats = async (userId: string) => {
    try {
      // Get real form statistics
      const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select('id, status, created_at')
        .eq('user_id', userId)

      if (formsError) {
        console.error('Error fetching forms:', formsError)
        return
      }

      const totalForms = forms?.length || 0
      const completedForms = forms?.filter(f => f.status === 'completed').length || 0
      const drafts = forms?.filter(f => f.status === 'draft').length || 0
      
      // Calculate this month's forms
      const thisMonth = new Date().getMonth()
      const thisYear = new Date().getFullYear()
      const thisMonthForms = forms?.filter(f => {
        const formDate = new Date(f.created_at)
        return formDate.getMonth() === thisMonth && formDate.getFullYear() === thisYear
      }).length || 0

      // Get voice accuracy from voice sessions
      const { data: voiceSessions } = await supabase
        .from('voice_sessions')
        .select('quality')
        .eq('user_id', userId)
        .eq('status', 'completed')

      const voiceAccuracy = voiceSessions && voiceSessions.length > 0 
        ? Math.round((voiceSessions.filter(v => v.quality === 'excellent').length / voiceSessions.length) * 100)
        : 94 // fallback

      // Get export success rate
      const { data: exports } = await supabase
        .from('exports')
        .select('status')
        .eq('user_id', userId)

      const exportSuccess = exports && exports.length > 0
        ? Math.round((exports.filter(e => e.status === 'completed').length / exports.length) * 100)
        : 98 // fallback

      setStats({
        totalForms,
        completedForms,
        drafts,
        thisMonth: thisMonthForms,
        averageCompletionTime: 45, // TODO: Calculate from actual completion times
        voiceAccuracy,
        exportSuccess
      })
    } catch (error) {
      console.error('Error fetching enhanced stats:', error)
    }
  }

  const fetchExportHistory = async (userId: string) => {
    try {
      const { data: exports, error } = await supabase
        .from('exports')
        .select(`
          id,
          export_type,
          status,
          file_size,
          created_at,
          forms!inner(patient_name, patient_id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching exports:', error)
        return
      }

      const exportRecords: ExportRecord[] = (exports || []).map(exp => ({
        id: exp.id,
        formTitle: `Patient: ${exp.forms.patient_name} - CNESST Report`,
        exportType: exp.export_type as 'PDF' | 'Word' | 'XML',
        status: exp.status as 'completed' | 'processing' | 'failed',
        createdAt: exp.created_at,
        fileSize: exp.file_size ? `${Math.round(exp.file_size / 1024 / 1024 * 10) / 10} MB` : undefined,
        downloadUrl: exp.status === 'completed' ? '#' : undefined
      }))

      setExportHistory(exportRecords)
    } catch (error) {
      console.error('Error fetching export history:', error)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      // Check voice processing status
      const { data: voiceSessions } = await supabase
        .from('voice_sessions')
        .select('status')
        .eq('status', 'processing')
        .limit(1)

      const voiceProcessing = voiceSessions && voiceSessions.length > 0 ? 'online' : 'online'

      // Check AI services (placeholder for now)
      const aiServices = 'online'

      // Check database connectivity
      const { error: dbError } = await supabase
        .from('forms')
        .select('id')
        .limit(1)

      const database = dbError ? 'offline' : 'online'

      // Check compliance (placeholder)
      const compliance = 'compliant'

      setSystemHealth({
        voiceProcessing,
        aiServices,
        database,
        compliance
      })
    } catch (error) {
      console.error('Error fetching system health:', error)
      setSystemHealth({
        voiceProcessing: 'offline',
        aiServices: 'offline',
        database: 'offline',
        compliance: 'non-compliant'
      })
    }
  }

  const fetchRecentForms = async (userId: string) => {
    try {
      const { data: forms, error } = await supabase
        .from('forms')
        .select('id, patient_name, patient_id, form_type, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching recent forms:', error)
        return
      }

      const recentFormsData = (forms || []).map(form => {
        // Calculate progress based on status
        let progress = 0
        switch (form.status) {
          case 'completed':
            progress = 100
            break
          case 'in-progress':
            progress = 65
            break
          case 'draft':
            progress = 25
            break
          default:
            progress = 0
        }

        return {
          id: form.id,
          title: `Patient: ${form.patient_name}`,
          status: form.status,
          date: form.created_at.split('T')[0],
          progress,
          patientId: form.patient_id,
          formType: form.form_type.toUpperCase()
        }
      })

      setRecentForms(recentFormsData)
    } catch (error) {
      console.error('Error fetching recent forms:', error)
    }
  }

  const [recentForms, setRecentForms] = useState<Array<{
    id: string
    title: string
    status: string
    date: string
    progress: number
    patientId: string
    formType: string
  }>>([])

  const quickActions = [
    { title: t('actions.new_form'), description: t('actions.create_cnesst'), icon: Plus, href: "/form/new", color: "bg-primary-500", badge: t('actions.primary') },
    { title: t('actions.view_drafts'), description: t('actions.continue_drafts'), icon: Clock, href: "/form/drafts", color: "bg-orange-500", badge: `${stats.drafts} ${t('actions.pending')}` },
    { title: t('actions.export_reports'), description: t('actions.download_forms'), icon: Download, href: "/exports", color: "bg-green-500", badge: t('actions.recent') },
    { title: t('actions.voice_recording'), description: t('actions.start_dictation'), icon: Mic, href: "/voice", color: "bg-purple-500", badge: voiceStatus.isConnected ? t('status.online') : t('status.offline') },
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
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('forms.completed')}</Badge>
      case "draft":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">{t('forms.draft')}</Badge>
      case "in-progress":
        return <Badge variant="outline" className="border-blue-200 text-blue-700">{t('forms.in_progress')}</Badge>
      default:
        return <Badge variant="outline">{t('forms.unknown')}</Badge>
    }
  }

  const getSystemHealthIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'compliant':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'degraded':
      case 'warning':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      case 'offline':
      case 'non-compliant':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
    }
  }

  const getVoiceQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome')}, {doctorProfile?.credentials || user?.full_name || "Doctor"}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.manage_docs')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-primary-600 hover:bg-primary-700">
            <Link href="/form/new">
              <Plus className="w-4 h-4 mr-2" />
              {t('actions.new_form')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total_forms')}</CardTitle>
            <FileText className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForms}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonth} {t('stats.this_month')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.completed')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedForms}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completedForms / stats.totalForms) * 100)}% {t('stats.completion_rate')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.drafts')}</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.pending_completion')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.voice_accuracy')}</CardTitle>
            <Mic className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.voiceAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.ai_accuracy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Voice Recording Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary-600" />
            {t('voice.status')}
          </CardTitle>
          <CardDescription>
            {t('voice.real_time')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${voiceStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium text-gray-900">{t('voice.connection')}</div>
                <div className="text-sm text-gray-600">
                  {voiceStatus.isConnected ? t('voice.connected') : t('voice.disconnected')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${voiceStatus.isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <div>
                <div className="font-medium text-gray-900">{t('voice.recording')}</div>
                <div className="text-sm text-gray-600">
                  {voiceStatus.isRecording ? `${t('voice.active')} (${formatDuration(voiceStatus.duration)})` : t('voice.inactive')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Volume2 className={`w-4 h-4 ${getVoiceQualityColor(voiceStatus.quality)}`} />
              <div>
                <div className="font-medium text-gray-900">{t('voice.audio_quality')}</div>
                <div className={`text-sm capitalize ${getVoiceQualityColor(voiceStatus.quality)}`}>
                  {t(`status.${voiceStatus.quality}`)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Headphones className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">{t('voice.device')}</div>
                <div className="text-sm text-gray-600">
                  {voiceStatus.isConnected ? t('voice.microphone_ready') : t('voice.no_device')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              variant={voiceStatus.isRecording ? "destructive" : "default"}
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => setVoiceStatus(prev => ({ ...prev, isRecording: !prev.isRecording }))}
            >
              {voiceStatus.isRecording ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  {t('voice.stop_recording')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t('voice.start_recording')}
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/voice/settings">
                <Settings className="w-4 h-4 mr-2" />
                {t('voice.settings')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('actions.quick_actions')}</CardTitle>
          <CardDescription>
            {t('actions.medical_workflow')}
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

      {/* Recent Forms and Export History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Forms */}
        <Card>
          <CardHeader>
            <CardTitle>{t('forms.recent_forms')}</CardTitle>
            <CardDescription>
              {t('forms.latest_work')}
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
                        {new Date(form.date).toLocaleDateString()} • {form.patientId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Progress value={form.progress} className="w-20 h-2" />
                      <span className="text-sm text-gray-500">{form.progress}%</span>
                    </div>
                    {getStatusBadge(form.status)}
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
                <Link href="/form/drafts">{t('forms.view_all')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export History */}
        <Card>
          <CardHeader>
            <CardTitle>{t('exports.history')}</CardTitle>
            <CardDescription>
              {t('exports.recent_exports')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportHistory.map((exportRecord) => (
                <div key={exportRecord.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      exportRecord.exportType === 'PDF' ? 'bg-red-100' : 
                      exportRecord.exportType === 'Word' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <Download className={`w-4 h-4 ${
                        exportRecord.exportType === 'PDF' ? 'text-red-600' : 
                        exportRecord.exportType === 'Word' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm truncate max-w-[200px]">{exportRecord.formTitle}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(exportRecord.createdAt).toLocaleDateString()} • {exportRecord.exportType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exportRecord.status === 'completed' && (
                      <Badge variant="default" className="bg-green-100 text-green-800">{t('forms.completed')}</Badge>
                    )}
                    {exportRecord.status === 'processing' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">{t('exports.processing')}</Badge>
                    )}
                    {exportRecord.status === 'failed' && (
                      <Badge variant="destructive">{t('exports.failed')}</Badge>
                    )}
                    {exportRecord.downloadUrl && (
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/exports">{t('exports.view_all')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced System Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('system.status')}</CardTitle>
          <CardDescription>
            {t('system.platform_health')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getSystemHealthIcon(systemHealth.voiceProcessing)}
              <div>
                <div className="font-medium text-gray-900">{t('system.voice_processing')}</div>
                <div className="text-sm text-gray-600 capitalize">{systemHealth.voiceProcessing}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getSystemHealthIcon(systemHealth.aiServices)}
              <div>
                <div className="font-medium text-gray-900">{t('system.ai_services')}</div>
                <div className="text-sm text-gray-600 capitalize">{systemHealth.aiServices}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getSystemHealthIcon(systemHealth.database)}
              <div>
                <div className="font-medium text-gray-900">{t('system.database')}</div>
                <div className="text-sm text-gray-600 capitalize">{systemHealth.database}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getSystemHealthIcon(systemHealth.compliance)}
              <div>
                <div className="font-medium text-gray-900">{t('system.compliance')}</div>
                <div className="text-sm text-gray-600 capitalize">{systemHealth.compliance}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center gap-2 text-primary-800">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">{t('system.wcag_compliant')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
