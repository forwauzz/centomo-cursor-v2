"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, FileText, Edit, Eye, Trash2, Plus } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface DraftForm {
  id: string
  patientName: string
  patientId: string
  formType: string
  progress: number
  lastModified: string
  status: 'draft' | 'in-progress'
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    // Mock data for now
    const mockDrafts: DraftForm[] = [
      {
        id: '1',
        patientName: 'Jean Dupont',
        patientId: 'P001',
        formType: 'CNESST Report',
        progress: 65,
        lastModified: '2024-01-15T10:30:00Z',
        status: 'in-progress'
      },
      {
        id: '2',
        patientName: 'Marie Tremblay',
        patientId: 'P002',
        formType: 'CNESST Report',
        progress: 25,
        lastModified: '2024-01-14T14:20:00Z',
        status: 'draft'
      },
      {
        id: '3',
        patientName: 'Pierre Gagnon',
        patientId: 'P003',
        formType: 'Follow-up Report',
        progress: 45,
        lastModified: '2024-01-13T09:15:00Z',
        status: 'in-progress'
      }
    ]
    
    setDrafts(mockDrafts)
    setIsLoading(false)
  }, [])

  const handleContinueForm = (draftId: string) => {
    // TODO: Load draft data and redirect to appropriate form section
    router.push(`/form/section7?draft=${draftId}`)
  }

  const handleViewForm = (draftId: string) => {
    // TODO: Show form preview
    console.log('Viewing draft:', draftId)
  }

  const handleDeleteDraft = (draftId: string) => {
    // TODO: Delete draft from database
    setDrafts(prev => prev.filter(draft => draft.id !== draftId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "draft":
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Draft</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Loading drafts...</p>
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
                        Last modified: {new Date(draft.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewForm(draft.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleContinueForm(draft.id)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDraft(draft.id)}
                    >
                      <Trash2 className="w-4 h-4" />
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
