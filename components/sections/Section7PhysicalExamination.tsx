"use client"

import { useState, useEffect, memo, lazy, Suspense, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  FileText, 
  Quote, 
  Plus, 
  Upload, 
  Clock, 
  Stethoscope, 
  Brain, 
  Eye, 
  Heart,
  Activity,
  Thermometer,
  Ruler,
  Save,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import { useFormSession, HistoricalEvent } from "@/hooks/use-form-session"
import { useToast } from "@/hooks/use-toast"
import { useVoiceRecording } from "@/hooks/use-voice-recording"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Lazy load heavy components with proper error boundaries
const PhysicalMeasurementsSection = lazy(() => 
  import('./PhysicalMeasurementsSection')
)

const RangeOfMotionSection = lazy(() => 
  import('./RangeOfMotionSection')
)

const BilateralComparisonSection = lazy(() => 
  import('./BilateralComparisonSection')
)

interface PhysicalMeasurement {
  id: string
  type: "height" | "weight" | "blood_pressure" | "temperature" | "pulse" | "oxygen_saturation"
  value: string
  unit: string
  side?: "left" | "right" | "bilateral"
  notes?: string
}

interface RangeOfMotion {
  id: string
  joint: string
  side: "left" | "right" | "bilateral"
  flexion: string
  extension: string
  abduction: string
  adduction: string
  rotation: string
  painLevel: "none" | "mild" | "moderate" | "severe"
  notes?: string
}

interface BilateralComparison {
  id: string
  structure: string
  leftSide: {
    normal: boolean
    findings: string
    measurements?: string
  }
  rightSide: {
    normal: boolean
    findings: string
    measurements?: string
  }
  comparison: string
}

// Loading component for lazy-loaded sections
const SectionLoader = memo(() => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin" />
    <span className="ml-2">Loading section...</span>
  </div>
))

// Error boundary component
const ErrorFallback = memo(({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <Button onClick={resetError} variant="outline">
      Try again
    </Button>
  </div>
))

interface Section7PhysicalExaminationProps {
  formId?: string | null
}

export const Section7PhysicalExamination = memo(({ formId }: Section7PhysicalExaminationProps) => {
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const {
    sessionId,
    sessionData,
    isLoading,
    isSaving,
    lastSaved,
    saveSession,
    updateSectionData,
    clearSession
  } = useFormSession({
    section: "section7",
    autoSaveInterval: 30000, // 30 seconds
    sessionTimeout: 30 // 30 minutes
  })

  // Voice recording hook
  const {
    isRecording,
    isProcessing,
    duration,
    chunks,
    currentTranscription,
    fullTranscription,
    error: recordingError,
    startRecording,
    stopRecording,
    voiceCommands,
    detectVoiceCommands,
    formatDuration
  } = useVoiceRecording({
    language: 'fr',
    chunkDuration: 120, // 2 minutes
    onTranscriptionUpdate: (transcription) => {
      setFormState(prev => ({ ...prev, transcript: transcription }))
    },
    onVoiceCommand: (command, template) => {
      toast({
        title: "Voice Command Detected",
        description: `"${command}" → "${template}"`,
        variant: "default"
      })
    }
  })

  // Local state for form data - memoized to prevent unnecessary re-renders
  const [formState, setFormState] = useState({
    isRecording: false,
    verbatimMode: false,
    mainNarrative: "",
    radiologyReport: "",
    transcript: "",
    measurements: [] as PhysicalMeasurement[],
    rangeOfMotion: [] as RangeOfMotion[],
    bilateralComparisons: [] as BilateralComparison[],
    additionalContext: {
      otherIssues: [] as string[],
      selectedTemplates: [] as string[]
    }
  })

  // AI formatting state
  const [isFormatting, setIsFormatting] = useState(false)
  const [isLoadingFormData, setIsLoadingFormData] = useState(false)

  const [events, setEvents] = useState<HistoricalEvent[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Load existing form data when formId is provided
  const loadExistingFormData = useCallback(async () => {
    if (!formId) return

    try {
      setIsLoadingFormData(true)
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Load form data from API
      const response = await fetch(`/api/forms?formId=${formId}&section=section7`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load form data')
      }

      const { sectionData } = await response.json()

      if (sectionData) {
        setFormState(prev => ({
          ...prev,
          mainNarrative: sectionData.mainNarrative || "",
          radiologyReport: sectionData.radiologyReport || "",
          transcript: sectionData.transcript || "",
          measurements: sectionData.measurements || [],
          rangeOfMotion: sectionData.rangeOfMotion || [],
          bilateralComparisons: sectionData.bilateralComparisons || [],
          additionalContext: {
            otherIssues: sectionData.additionalContext?.otherIssues || [],
            selectedTemplates: sectionData.additionalContext?.selectedTemplates || []
          }
        }))

        if (sectionData.events) {
          setEvents(sectionData.events)
        }

        toast({
          title: "Form Data Loaded",
          description: "Your existing form data has been loaded.",
        })
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      toast({
        title: "Error",
        description: "Failed to load existing form data. Starting with a fresh form.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingFormData(false)
    }
  }, [formId, supabase, toast])

  // Load existing form data on mount if formId is provided
  useEffect(() => {
    loadExistingFormData()
  }, [loadExistingFormData])

  // Memoized form data to prevent unnecessary re-renders
  const memoizedFormData = useMemo(() => ({
    mainNarrative: formState.mainNarrative,
    events,
    radiologyReport: formState.radiologyReport,
    transcript: formState.transcript,
    isRecording: formState.isRecording,
    verbatimMode: formState.verbatimMode,
    additionalContext: formState.additionalContext,
    measurements: formState.measurements,
    rangeOfMotion: formState.rangeOfMotion,
    bilateralComparisons: formState.bilateralComparisons
  }), [formState, events])

  // Load data from session when available - optimized with useCallback
  const loadSessionData = useCallback(() => {
    if (sessionData.section7) {
      const data = sessionData.section7
      setFormState(prev => ({
        ...prev,
        mainNarrative: data.mainNarrative || "",
        radiologyReport: data.radiologyReport || "",
        transcript: data.transcript || "",
        isRecording: data.isRecording || false,
        verbatimMode: data.verbatimMode || false,
        additionalContext: data.additionalContext || { otherIssues: [], selectedTemplates: [] }
      }))
      setEvents(data.events || [])
    }
  }, [sessionData.section7])

  useEffect(() => {
    loadSessionData()
  }, [loadSessionData])

  // Save data to session when it changes - optimized with useCallback
  const saveSectionData = useCallback(() => {
    if (sessionId && !isLoading) {
      updateSectionData("section7", memoizedFormData)
    }
  }, [sessionId, isLoading, memoizedFormData, updateSectionData])

  // Save form data to database when formId is provided
  const saveFormDataToDatabase = useCallback(async () => {
    if (!formId) return

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Save form data via API
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          formId,
          section: 'section7',
          sectionData: memoizedFormData,
          completed: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save form data')
      }

    } catch (error) {
      console.error('Error saving form data to database:', error)
      toast({
        title: "Save Error",
        description: "Failed to save form data. Your work is still saved in the session.",
        variant: "destructive"
      })
    }
  }, [formId, memoizedFormData, supabase, toast])

  useEffect(() => {
    saveSectionData()
  }, [saveSectionData])

  // Save to database when form data changes (debounced)
  useEffect(() => {
    if (!formId) return

    const timeoutId = setTimeout(() => {
      saveFormDataToDatabase()
    }, 2000) // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [memoizedFormData, saveFormDataToDatabase])

  // Memoized event handlers to prevent unnecessary re-renders
  const addEvent = useCallback(() => {
    const newEvent: HistoricalEvent = {
      id: Date.now().toString(),
      date: "",
      type: "other",
      description: "",
    }
    setEvents(prev => [...prev, newEvent])
  }, [])

  const updateEvent = useCallback((id: string, field: keyof HistoricalEvent, value: string) => {
    setEvents(prev => prev.map((event) => (event.id === id ? { ...event, [field]: value } : event)))
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter((event) => event.id !== id))
  }, [])

  const addMeasurement = useCallback(() => {
    const newMeasurement: PhysicalMeasurement = {
      id: Date.now().toString(),
      type: "height",
      value: "",
      unit: "cm",
      side: "bilateral"
    }
    setFormState(prev => ({
      ...prev,
      measurements: [...prev.measurements, newMeasurement]
    }))
  }, [])

  const updateMeasurement = useCallback((id: string, field: keyof PhysicalMeasurement, value: string) => {
    setFormState(prev => ({
      ...prev,
      measurements: prev.measurements.map((measurement) => 
        measurement.id === id ? { ...measurement, [field]: value } : measurement
      )
    }))
  }, [])

  const removeMeasurement = useCallback((id: string) => {
    setFormState(prev => ({
      ...prev,
      measurements: prev.measurements.filter((measurement) => measurement.id !== id)
    }))
  }, [])

  // Memoized form update handlers
  const updateFormField = useCallback((field: keyof typeof formState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }, [])

  const updateNarrative = useCallback((value: string) => {
    updateFormField('mainNarrative', value)
  }, [updateFormField])

  const updateRadiologyReport = useCallback((value: string) => {
    updateFormField('radiologyReport', value)
  }, [updateFormField])

  const updateTranscript = useCallback((value: string) => {
    updateFormField('transcript', value)
  }, [updateFormField])



  // AI formatting function
  const formatTextWithAI = useCallback(async () => {
    if (!formState.mainNarrative.trim()) {
      toast({
        title: "No text to format",
        description: "Please enter some text in the main narrative before formatting.",
        variant: "destructive"
      })
      return
    }

    setIsFormatting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/format/main-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          text: formState.mainNarrative,
          language: 'fr-CA'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to format text')
      }

      const result = await response.json()
      
      if (result.success) {
        updateNarrative(result.formattedText)
        toast({
          title: "Text formatted successfully",
          description: "Your text has been formatted according to Quebec CNESST standards.",
          variant: "default"
        })
      } else {
        throw new Error(result.error || 'Formatting failed')
      }
    } catch (error) {
      console.error('AI formatting error:', error)
      toast({
        title: "Formatting failed",
        description: "There was an error formatting your text. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsFormatting(false)
    }
  }, [formState.mainNarrative, updateNarrative, toast, supabase])

  const toggleVerbatimMode = useCallback(() => {
    setFormState(prev => ({ ...prev, verbatimMode: !prev.verbatimMode }))
  }, [])

  // Compile final document
  const compileFinalDocument = useCallback(async () => {
    if (!formState.mainNarrative.trim() && !formState.radiologyReport.trim() && !formState.transcript.trim()) {
      toast({
        title: "No content to compile",
        description: "Please add content to at least one section before compiling.",
        variant: "destructive"
      })
      return
    }

    setIsFormatting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/format/compile-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          mainNarrative: formState.mainNarrative,
          radiologyReport: formState.radiologyReport,
          transcript: formState.transcript,
          language: 'fr-CA'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to compile document')
      }

      const result = await response.json()
      
      if (result.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.compiledDocument)
        toast({
          title: "Document compiled successfully",
          description: "The compiled document has been copied to your clipboard.",
          variant: "default"
        })
      } else {
        throw new Error(result.error || 'Compilation failed')
      }
    } catch (error) {
      console.error('Document compilation error:', error)
      toast({
        title: "Compilation failed",
        description: "There was an error compiling your document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsFormatting(false)
    }
  }, [formState.mainNarrative, formState.radiologyReport, formState.transcript, toast, supabase])

  // Error boundary reset
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  // Show error boundary if there's an error
  if (error) {
    return <ErrorFallback error={error} resetError={resetError} />
  }

  // Show loading state when loading form data
  if (isLoadingFormData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500">Loading your form data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Section 7: Physical Examination</h1>
          <p className="text-gray-600">Document physical examination findings and measurements</p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          )}
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Main Narrative Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Main Narrative
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter the main physical examination narrative..."
              value={formState.mainNarrative}
              onChange={(e) => updateNarrative(e.target.value)}
              className="min-h-[200px]"
            />
            
            <div className="flex items-center gap-4">
              <Button
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || isProcessing}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording ({formatDuration(duration)})
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={formatTextWithAI}
                disabled={isLoading || isFormatting || !formState.mainNarrative.trim()}
              >
                {isFormatting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Formatting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Format
                  </>
                )}
              </Button>
              
              <Button
                variant={formState.verbatimMode ? "default" : "outline"}
                onClick={toggleVerbatimMode}
                disabled={isLoading}
              >
                <Quote className="w-4 h-4 mr-2" />
                Verbatim Mode
              </Button>
            </div>

            {/* Compile Section Button */}
            <div className="flex justify-center pt-4 border-t">
              <Button
                variant="default"
                onClick={compileFinalDocument}
                disabled={isLoading || isFormatting || (!formState.mainNarrative.trim() && !formState.radiologyReport.trim() && !formState.transcript.trim())}
                className="bg-green-600 hover:bg-green-700"
              >
                {isFormatting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Compile Final Document
                  </>
                )}
              </Button>
            </div>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Recording in progress</span>
                </div>
                <div className="text-sm text-gray-600">
                  Duration: {formatDuration(duration)} | Chunks: {chunks}
                </div>
                {currentTranscription && (
                  <div className="text-sm text-gray-600">
                    Latest: "{currentTranscription.substring(0, 50)}..."
                  </div>
                )}
              </div>
            )}

            {/* Recording Error */}
            {recordingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">Recording Error: {recordingError}</span>
                </div>
              </div>
            )}

            {/* Voice Commands Help */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Voice Commands Available:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(voiceCommands).map(([command, template]) => (
                  <div key={command} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      "{command}"
                    </Badge>
                    <span className="text-blue-700">→</span>
                    <span className="text-blue-600 font-mono">{template}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lazy-loaded sections with error boundaries */}
      <Suspense fallback={<SectionLoader />}>
        <PhysicalMeasurementsSection
          measurements={formState.measurements}
          onAdd={addMeasurement}
          onUpdate={updateMeasurement}
          onRemove={removeMeasurement}
        />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <RangeOfMotionSection
          rangeOfMotion={formState.rangeOfMotion}
          onAdd={() => {/* TODO: Implement */}}
          onUpdate={() => {/* TODO: Implement */}}
          onRemove={() => {/* TODO: Implement */}}
        />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <BilateralComparisonSection
          comparisons={formState.bilateralComparisons}
          onAdd={() => {/* TODO: Implement */}}
          onUpdate={() => {/* TODO: Implement */}}
          onRemove={() => {/* TODO: Implement */}}
        />
      </Suspense>

      {/* Radiology Report Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Radiology Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter radiology report findings..."
              value={formState.radiologyReport}
              onChange={(e) => updateRadiologyReport(e.target.value)}
              className="min-h-[150px]"
            />
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!formState.radiologyReport.trim()) {
                    toast({
                      title: "No text to format",
                      description: "Please enter some text in the radiology report before formatting.",
                      variant: "destructive"
                    })
                    return
                  }

                  setIsFormatting(true)
                  try {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (!session) {
                      throw new Error('No active session')
                    }

                    const response = await fetch('/api/format/radiology-report', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({
                        text: formState.radiologyReport,
                        language: 'fr-CA'
                      })
                    })

                    if (!response.ok) {
                      throw new Error('Failed to format radiology report')
                    }

                    const result = await response.json()
                    
                    if (result.success) {
                      updateRadiologyReport(result.formattedText)
                      toast({
                        title: "Radiology report formatted",
                        description: "Your radiology report has been formatted for word-for-word accuracy.",
                        variant: "default"
                      })
                    } else {
                      throw new Error(result.error || 'Formatting failed')
                    }
                  } catch (error) {
                    console.error('Radiology formatting error:', error)
                    toast({
                      title: "Formatting failed",
                      description: "There was an error formatting your radiology report. Please try again.",
                      variant: "destructive"
                    })
                  } finally {
                    setIsFormatting(false)
                  }
                }}
                disabled={isLoading || isFormatting || !formState.radiologyReport.trim()}
              >
                {isFormatting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Formatting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Format Word-for-Word
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Voice Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Voice recording transcript will appear here..."
              value={formState.transcript}
              onChange={(e) => updateTranscript(e.target.value)}
              className="min-h-[150px]"
              readOnly={isRecording}
            />
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!formState.transcript.trim()) {
                    toast({
                      title: "No text to format",
                      description: "Please enter some text in the voice transcript before formatting.",
                      variant: "destructive"
                    })
                    return
                  }

                  setIsFormatting(true)
                  try {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (!session) {
                      throw new Error('No active session')
                    }

                    const response = await fetch('/api/format/voice-transcript', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({
                        text: formState.transcript,
                        language: 'fr-CA'
                      })
                    })

                    if (!response.ok) {
                      throw new Error('Failed to format voice transcript')
                    }

                    const result = await response.json()
                    
                    if (result.success) {
                      updateTranscript(result.formattedText)
                      toast({
                        title: "Voice transcript formatted",
                        description: "Your voice transcript has been formatted for word-for-word accuracy.",
                        variant: "default"
                      })
                    } else {
                      throw new Error(result.error || 'Formatting failed')
                    }
                  } catch (error) {
                    console.error('Voice transcript formatting error:', error)
                    toast({
                      title: "Formatting failed",
                      description: "There was an error formatting your voice transcript. Please try again.",
                      variant: "destructive"
                    })
                  } finally {
                    setIsFormatting(false)
                  }
                }}
                disabled={isLoading || isFormatting || !formState.transcript.trim()}
              >
                {isFormatting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Formatting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Format Word-for-Word
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
