"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, User, Calendar } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import MedicalLayout from "@/components/layout/medical-layout"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/database-schema"
import { useToast } from "@/hooks/use-toast"

export default function NewFormPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    formType: "cnesst",
    date: new Date().toISOString().split('T')[0]
  })
  
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      // Create form in database
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: user.id,
          patient_name: formData.patientName,
          patient_id: formData.patientId,
          form_type: formData.formType,
          status: 'draft'
        })
        .select()
        .single()

      if (formError) {
        throw new Error(`Failed to create form: ${formError.message}`)
      }

      // Create initial form session (optional - skip if table doesn't exist)
      try {
        const { error: sessionError } = await supabase
          .from('form_sessions')
          .insert({
            user_id: user.id,
            session_data: {
              formId: form.id,
              patientName: formData.patientName,
              patientId: formData.patientId,
              formType: formData.formType,
              date: formData.date,
              currentSection: 'section7'
            },
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          })

        if (sessionError) {
          console.warn('Failed to create form session:', sessionError)
          // Continue anyway as the form was created successfully
        }
      } catch (sessionError) {
        console.warn('Form sessions table may not exist:', sessionError)
        // Continue anyway as the form was created successfully
      }

      toast({
        title: "Form Created",
        description: `Successfully created form for ${formData.patientName}`,
      })

      // Redirect to first form section with form ID
      router.push(`/form/section7?formId=${form.id}`)
    } catch (error) {
      console.error('Error creating form:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create form",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MedicalLayout>
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Plus className="w-8 h-8 text-primary-600" />
            Create New CNESST Report
          </h1>
          <p className="text-gray-600 mt-2">
            Start a new medical documentation report for your patient
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Enter the basic patient information to begin the report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    placeholder="Enter patient's full name"
                    value={formData.patientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    placeholder="Patient ID or file number"
                    value={formData.patientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="formType">Report Type</Label>
                  <Select 
                    value={formData.formType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, formType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cnesst">CNESST Medical Report</SelectItem>
                      <SelectItem value="followup">Follow-up Report</SelectItem>
                      <SelectItem value="assessment">Initial Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Report Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Report"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MedicalLayout>
  )
}
