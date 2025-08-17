import { useState, useCallback, useRef, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface VoiceRecordingState {
  isRecording: boolean
  isProcessing: boolean
  sessionId: string | null
  duration: number
  chunks: number
  currentTranscription: string
  fullTranscription: string
  error: string | null
}

interface VoiceRecordingOptions {
  language?: 'en' | 'fr'
  chunkDuration?: number // in seconds, default 120 (2 minutes)
  onTranscriptionUpdate?: (transcription: string) => void
  onChunkProcessed?: (chunkId: string, transcription: string) => void
  onVoiceCommand?: (command: string, template: string) => void
}

export function useVoiceRecording(options: VoiceRecordingOptions = {}) {
  const {
    language = 'fr',
    chunkDuration = 120,
    onTranscriptionUpdate,
    onChunkProcessed,
    onVoiceCommand
  } = options

  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    sessionId: null,
    duration: 0,
    chunks: 0,
    currentTranscription: '',
    fullTranscription: '',
    error: null
  })

  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  // Refs for managing recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current)
      chunkIntervalRef.current = null
    }
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
    }
  }, [state.isRecording])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isProcessing: true }))

      // Get user session for authorization
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Request microphone access with better audio quality
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          latency: 0.01
        } 
      })

      // Create MediaRecorder with optimal settings for transcription
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      })
      mediaRecorderRef.current = mediaRecorder

      // Start recording session on server
      const response = await fetch('/api/voice/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'start_recording',
          language
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start recording session')
      }

      const { sessionId } = await response.json()

      // Setup recording handlers
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Process final chunk if any
        if (audioChunksRef.current.length > 0) {
          await processAudioChunk(sessionId, session.access_token)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      startTimeRef.current = Date.now()

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }))
      }, 1000)

      // Start chunk timer (every 2 minutes)
      chunkIntervalRef.current = setInterval(async () => {
        if (mediaRecorderRef.current && state.isRecording) {
          await processAudioChunk(sessionId, session.access_token)
        }
      }, chunkDuration * 1000)

      setState(prev => ({
        ...prev,
        isRecording: true,
        isProcessing: false,
        sessionId,
        duration: 0,
        chunks: 0,
        currentTranscription: '',
        fullTranscription: ''
      }))

      toast({
        title: "Recording Started",
        description: "Voice recording is now active. Speak clearly for best transcription.",
        variant: "default"
      })

    } catch (error) {
      console.error('Error starting recording:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start recording',
        isProcessing: false
      }))
      toast({
        title: "Recording Error",
        description: error instanceof Error ? error.message : 'Failed to start recording',
        variant: "destructive"
      })
    }
  }, [language, supabase, toast])

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }))

      if (!mediaRecorderRef.current || !state.sessionId) {
        throw new Error('No active recording session')
      }

      // Get user session for authorization
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Stop recording
      mediaRecorderRef.current.stop()

      // Stop recording session on server
      const response = await fetch('/api/voice/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'stop_recording',
          sessionId: state.sessionId
        })
      })

      if (!response.ok) {
        console.error('Failed to stop recording session')
      }

      // Get full transcription
      const transcriptionResponse = await fetch(`/api/voice/record?sessionId=${state.sessionId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (transcriptionResponse.ok) {
        const { transcription } = await transcriptionResponse.json()
        setState(prev => ({
          ...prev,
          fullTranscription: transcription || '',
          isRecording: false,
          isProcessing: false
        }))
        
        if (onTranscriptionUpdate) {
          onTranscriptionUpdate(transcription || '')
        }
      }

      // Cleanup
      cleanup()

      toast({
        title: "Recording Stopped",
        description: "Voice recording has been stopped and transcription is complete.",
        variant: "default"
      })

    } catch (error) {
      console.error('Error stopping recording:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop recording',
        isProcessing: false
      }))
      toast({
        title: "Recording Error",
        description: error instanceof Error ? error.message : 'Failed to stop recording',
        variant: "destructive"
      })
    }
  }, [state.sessionId, supabase, toast, cleanup, onTranscriptionUpdate])

  // Voice command templates
  const voiceCommands = useMemo(() => ({
    fr: {
      'nouveau paragraphe': '\n\n',
      'point final': '. ',
      'virgule': ', ',
      'diagnostic': 'Le diagnostic révèle ',
      'traitement': 'Le traitement recommandé est ',
      'examen': 'L\'examen physique montre ',
      'douleur': 'Le patient présente une douleur ',
      'amélioration': 'Il y a une amélioration ',
      'stable': 'La condition est stable ',
      'détérioration': 'Il y a une détérioration '
    },
    en: {
      'new paragraph': '\n\n',
      'period': '. ',
      'comma': ', ',
      'diagnosis': 'The diagnosis reveals ',
      'treatment': 'The recommended treatment is ',
      'examination': 'The physical examination shows ',
      'pain': 'The patient presents with pain ',
      'improvement': 'There is improvement ',
      'stable': 'The condition is stable ',
      'deterioration': 'There is deterioration '
    }
  }), [])

  // Detect voice commands in transcription
  const detectVoiceCommands = useCallback((transcription: string) => {
    const commands = voiceCommands[language] || voiceCommands.fr
    const lowerTranscription = transcription.toLowerCase()
    
    for (const [command, template] of Object.entries(commands)) {
      if (lowerTranscription.includes(command)) {
        if (onVoiceCommand) {
          onVoiceCommand(command, template)
        }
        return template
      }
    }
    return null
  }, [language, voiceCommands, onVoiceCommand])

  // Process audio chunk
  const processAudioChunk = useCallback(async (sessionId: string, accessToken: string) => {
    try {
      if (audioChunksRef.current.length === 0) return

      // Combine audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      audioChunksRef.current = []

      // Convert to base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      // Send to server for processing
      const response = await fetch('/api/voice/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'process_chunk',
          sessionId,
          audioChunk: base64Audio,
          language
        })
      })

      if (response.ok) {
        const { chunkId, transcription } = await response.json()
        
        // Check for voice commands
        const commandTemplate = detectVoiceCommands(transcription || '')
        
        setState(prev => ({
          ...prev,
          chunks: prev.chunks + 1,
          currentTranscription: transcription || '',
          fullTranscription: prev.fullTranscription + ' ' + (transcription || '')
        }))

        if (onChunkProcessed) {
          onChunkProcessed(chunkId, transcription || '')
        }

        if (onTranscriptionUpdate) {
          onTranscriptionUpdate(prev.fullTranscription + ' ' + (transcription || ''))
        }
      }

    } catch (error) {
      console.error('Error processing audio chunk:', error)
    }
  }, [language, onChunkProcessed, onTranscriptionUpdate, state.fullTranscription, detectVoiceCommands])

  // Get transcription for a session
  const getTranscription = useCallback(async (sessionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`/api/voice/record?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const { transcription } = await response.json()
        return transcription || ''
      }

      return ''
    } catch (error) {
      console.error('Error getting transcription:', error)
      return ''
    }
  }, [supabase])

  return {
    // State
    isRecording: state.isRecording,
    isProcessing: state.isProcessing,
    sessionId: state.sessionId,
    duration: state.duration,
    chunks: state.chunks,
    currentTranscription: state.currentTranscription,
    fullTranscription: state.fullTranscription,
    error: state.error,

    // Actions
    startRecording,
    stopRecording,
    getTranscription,

    // Voice Commands
    voiceCommands: voiceCommands[language] || voiceCommands.fr,
    detectVoiceCommands,

    // Utilities
    formatDuration: (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }
}
