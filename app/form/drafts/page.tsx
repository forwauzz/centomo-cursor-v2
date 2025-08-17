"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, FileText, Edit, Eye, Trash2, Plus, AlertCircle } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase"
import { useToast } from "@/hooks/use-toast"

interface DraftForm {
  id: string
  patientName: string
  patientId: string
  formType: string
  progress: number
  lastModified: string
  status: 'draft' | 'in-progress' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // Load real drafts from database
  const loadDrafts = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      // Fetch user's forms from database
      const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select(`
          id,
          patient_name,
          patient_id,
          form_type,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .in('status', ['draft', 'in-progress'])
        .order('updated_at', { ascending: false })

      if (formsError) {
        throw new Error(`Failed to load forms: ${formsError.message}`)
      }

      // Calculate progress for each form based on completed sections
      const draftsWithProgress = await Promise.all(
        forms.map(async (form) => {
          // Get form sections to calculate progress
          const { data: sections } = await supabase
            .from('form_sections')
            .select('section_name, completed')
            .eq('form_id', form.id)

          const totalSections = 4 // section7, section8, section11, etc.
          const completedSections = sections?.filter(s => s.completed).length || 0
          const progress = Math.round((completedSections / totalSections) * 100)

          return {
            id: form.id,
            patientName: form.patient_name,
            patientId: form.patient_id,
            formType: form.form_type,
            progress,
            lastModified: form.updated_at,
            status: form.status as 'draft' | 'in-progress' | 'completed' | 'archived',
            created_at: form.created_at,
            updated_at: form.updated_at
          }
        })
      )

      setDrafts(draftsWithProgress)
    } catch (error) {
      console.error('Error loading drafts:', error)
      toast({
        title: "Error",
        description: "Failed to load your draft forms. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDrafts()
  }, [])

  const handleContinueForm = (draftId: string) => {
    // Redirect to the first form section with the form ID
    router.push(`/form/section7?formId=${draftId}`)
  }

  const handleViewForm = (draftId: string) => {
    // For now, redirect to a preview page or show modal
    // TODO: Implement form preview functionality
    toast({
      title: "Form Preview",
      description: "Form preview functionality coming soon!",
    })
  }

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(draftId)
      
      // Delete form sections first (due to foreign key constraint)
      const { error: sectionsError } = await supabase
        .from('form_sections')
        .delete()
        .eq('form_id', draftId)

      if (sectionsError) {
        console.warn('Error deleting form sections:', sectionsError)
      }

      // Delete the form
      const { error: formError } = await supabase
        .from('forms')
        .delete()
        .eq('id', draftId)

      if (formError) {
        throw new Error(`Failed to delete form: ${formError.message}`)
      }

      // Remove from local state
      setDrafts(prev => prev.filter(draft => draft.id !== draftId))
      
      toast({
        title: "Draft Deleted",
        description: "The draft has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast({
        title: "Error",
        description: "Failed to delete the draft. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "draft":
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Draft</Badge>
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case "archived":
        return <Badge variant="outline" className="border-gray-200 text-gray-700">Archived</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500">Loading your drafts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-500" />
            Draft Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Continue working on your saved draft reports
          </p>
        </div>
        <Button onClick={() => router.push('/form/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Draft Reports</h3>
            <p className="text-gray-500 mb-4">
              You don't have any draft reports yet. Start creating a new report to get started.
            </p>
            <Button onClick={() => router.push('/form/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {draft.patientName}
                      </h3>
                      {getStatusBadge(draft.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Patient ID: {draft.patientId} • {draft.formType}
                    </p>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Progress value={draft.progress} className="w-24 h-2" />
                        <span className="text-sm text-gray-500">{draft.progress}%</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Last modified: {formatDate(draft.lastModified)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewForm(draft.id)}
                      disabled={isDeleting === draft.id}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleContinueForm(draft.id)}
                      disabled={isDeleting === draft.id}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDraft(draft.id)}
                      disabled={isDeleting === draft.id}
                    >
                      {isDeleting === draft.id ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
