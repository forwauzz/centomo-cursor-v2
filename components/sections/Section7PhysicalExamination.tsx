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

export const Section7PhysicalExamination = memo(() => {
  const { toast } = useToast()
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

  // Local state for form data - memoized to prevent unnecessary re-renders
  const [formState, setFormState] = useState({
    isRecording: false,
    aiFormatEnabled: false,
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

  const [events, setEvents] = useState<HistoricalEvent[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Memoized form data to prevent unnecessary re-renders
  const memoizedFormData = useMemo(() => ({
    mainNarrative: formState.mainNarrative,
    events,
    radiologyReport: formState.radiologyReport,
    transcript: formState.transcript,
    isRecording: formState.isRecording,
    aiFormatEnabled: formState.aiFormatEnabled,
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
        aiFormatEnabled: data.aiFormatEnabled || false,
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

  useEffect(() => {
    saveSectionData()
  }, [saveSectionData])

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

  const toggleRecording = useCallback(() => {
    setFormState(prev => ({ ...prev, isRecording: !prev.isRecording }))
  }, [])

  const toggleAiFormat = useCallback(() => {
    setFormState(prev => ({ ...prev, aiFormatEnabled: !prev.aiFormatEnabled }))
  }, [])

  const toggleVerbatimMode = useCallback(() => {
    setFormState(prev => ({ ...prev, verbatimMode: !prev.verbatimMode }))
  }, [])

  // Error boundary reset
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  // Show error boundary if there's an error
  if (error) {
    return <ErrorFallback error={error} resetError={resetError} />
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
                variant={formState.isRecording ? "destructive" : "default"}
                onClick={toggleRecording}
                disabled={isLoading}
              >
                {formState.isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <Button
                variant={formState.aiFormatEnabled ? "default" : "outline"}
                onClick={toggleAiFormat}
                disabled={isLoading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Format
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
          <Textarea
            placeholder="Enter radiology report findings..."
            value={formState.radiologyReport}
            onChange={(e) => updateRadiologyReport(e.target.value)}
            className="min-h-[150px]"
          />
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
          <Textarea
            placeholder="Voice recording transcript will appear here..."
            value={formState.transcript}
            onChange={(e) => updateTranscript(e.target.value)}
            className="min-h-[150px]"
            readOnly={formState.isRecording}
          />
        </CardContent>
      </Card>
    </div>
  )
})
