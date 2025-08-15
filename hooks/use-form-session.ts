import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface FormSessionData {
  section7?: {
    mainNarrative: string
    events: HistoricalEvent[]
    radiologyReport: string
    transcript: string
    isRecording: boolean
    aiFormatEnabled: boolean
    verbatimMode: boolean
    additionalContext: {
      otherIssues: string[]
      selectedTemplates: string[]
    }
    lastSaved: string
  }
}

export interface HistoricalEvent {
  id: string
  date: string
  type: "injury" | "treatment" | "imaging" | "follow-up" | "other"
  description: string
  source?: string
  details?: string
}

export interface UseFormSessionOptions {
  section: string
  autoSaveInterval?: number // in milliseconds
  sessionTimeout?: number // in minutes
}

export function useFormSession(options: UseFormSessionOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<FormSessionData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()

  const { section, autoSaveInterval = 30000, sessionTimeout = 30 } = options

  // Initialize or load existing session
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check for existing session via API
      const response = await fetch(`/api/form-sessions?section=${section}`)
      
      if (response.ok) {
        const { session } = await response.json()
        
        if (session) {
          setSessionId(session.id)
          setSessionData(session.session_data || {})
          setLastSaved(new Date(session.updated_at))
          toast({
            title: "Session Restored",
            description: "Your previous work has been loaded.",
          })
        } else {
          // Create new session
          const newSessionResponse = await fetch('/api/form-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section,
              sessionData: { section, [section]: {} }
            })
          })

          if (newSessionResponse.ok) {
            const { session: newSession } = await newSessionResponse.json()
            setSessionId(newSession.id)
            setSessionData({ section, [section]: {} })
            setLastSaved(new Date())
          } else {
            throw new Error('Failed to create new session')
          }
        }
      } else {
        throw new Error('Failed to fetch session')
      }
    } catch (error) {
      console.error('Error initializing session:', error)
      toast({
        title: "Session Error",
        description: "Failed to initialize form session.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [section, sessionTimeout, toast])

  // Save session data
  const saveSession = useCallback(async (data?: FormSessionData) => {
    if (!sessionId) return

    try {
      setIsSaving(true)
      
      const dataToSave = data || sessionData

      const response = await fetch('/api/form-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sessionData: dataToSave
        })
      })

      if (response.ok) {
        setLastSaved(new Date())
        setSessionData(dataToSave)
        
        toast({
          title: "Auto-saved",
          description: "Your progress has been saved.",
        })
      } else {
        throw new Error('Failed to save session')
      }
    } catch (error) {
      console.error('Error saving session:', error)
      toast({
        title: "Save Error",
        description: "Failed to save your progress.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [sessionId, sessionData, sessionTimeout, toast])

  // Update specific section data
  const updateSectionData = useCallback((sectionKey: string, data: any) => {
    setSessionData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey as keyof FormSessionData],
        ...data,
        lastSaved: new Date().toISOString()
      }
    }))
  }, [])

  // Clear session (for compliance)
  const clearSession = useCallback(async () => {
    if (!sessionId) return

    try {
      const response = await fetch(`/api/form-sessions?sessionId=${sessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSessionId(null)
        setSessionData({})
        setLastSaved(null)
        
        toast({
          title: "Session Cleared",
          description: "All session data has been removed.",
        })
      } else {
        throw new Error('Failed to clear session')
      }
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }, [sessionId, toast])

  // Auto-save effect
  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(() => {
      saveSession()
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [sessionId, saveSession, autoSaveInterval])

  // Initialize on mount
  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  // Cleanup expired sessions on unmount
  useEffect(() => {
    return () => {
      // Cleanup will be handled by database triggers
    }
  }, [])

  return {
    sessionId,
    sessionData,
    isLoading,
    isSaving,
    lastSaved,
    saveSession,
    updateSectionData,
    clearSession,
    initializeSession
  }
}
