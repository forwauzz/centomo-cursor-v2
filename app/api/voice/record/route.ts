import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-admin'

// Mock OpenAI for now - we'll add the real implementation later
const mockOpenAI = {
  audio: {
    transcriptions: {
      create: async (params: any) => {
        // Mock transcription - in production this would call OpenAI
        return "Ceci est une transcription simulée du texte dicté."
      }
    }
  }
}

interface VoiceChunk {
  id: string
  audioData: string // Base64 encoded audio
  timestamp: string
  duration: number
  transcription?: string
  status: 'recording' | 'processing' | 'completed' | 'failed'
}

interface RecordingSession {
  id: string
  userId: string
  startTime: string
  endTime?: string
  chunks: VoiceChunk[]
  totalDuration: number
  status: 'active' | 'completed' | 'failed'
  language: 'en' | 'fr'
}

// In-memory storage for development (replace with database later)
const recordingSessions = new Map<string, RecordingSession>()

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - No auth header' }, { status: 401 })
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    // Verify the user is authenticated using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { action, audioChunk, sessionId, language = 'fr' } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'start_recording':
        return await handleStartRecording(user.id, language)

      case 'process_chunk':
        if (!audioChunk || !sessionId) {
          return NextResponse.json(
            { error: 'Audio chunk and session ID are required' },
            { status: 400 }
          )
        }
        return await handleProcessChunk(audioChunk, sessionId, user.id, language)

      case 'stop_recording':
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          )
        }
        return await handleStopRecording(sessionId, user.id)

      case 'get_transcription':
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          )
        }
        return await handleGetTranscription(sessionId, user.id)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Voice recording API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function handleStartRecording(userId: string, language: string) {
  try {
    const sessionId = `rec_${Date.now()}_${userId}`
    const session: RecordingSession = {
      id: sessionId,
      userId,
      startTime: new Date().toISOString(),
      chunks: [],
      totalDuration: 0,
      status: 'active',
      language: language as 'en' | 'fr'
    }

    // Store session in memory
    recordingSessions.set(sessionId, session)

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Recording session started',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error starting recording:', error)
    return NextResponse.json(
      { error: 'Failed to start recording session' },
      { status: 500 }
    )
  }
}

async function handleProcessChunk(
  audioChunk: string, 
  sessionId: string, 
  userId: string, 
  language: string
) {
  try {
    const session = recordingSessions.get(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Recording session not found' },
        { status: 404 }
      )
    }

    // Create chunk ID
    const chunkId = `chunk_${Date.now()}_${sessionId}`
    
    // Process audio chunk with mock Whisper
    const transcription = await transcribeAudioChunk(audioChunk, language)
    
    // Store chunk in session
    const chunk: VoiceChunk = {
      id: chunkId,
      audioData: audioChunk,
      timestamp: new Date().toISOString(),
      duration: 120, // 2 minutes
      transcription,
      status: 'completed'
    }

    session.chunks.push(chunk)
    session.totalDuration += 120

    return NextResponse.json({
      success: true,
      chunkId,
      transcription,
      message: 'Audio chunk processed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing audio chunk:', error)
    return NextResponse.json(
      { error: 'Failed to process audio chunk' },
      { status: 500 }
    )
  }
}

async function handleStopRecording(sessionId: string, userId: string) {
  try {
    const session = recordingSessions.get(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Recording session not found' },
        { status: 404 }
      )
    }

    // Update session status
    session.status = 'completed'
    session.endTime = new Date().toISOString()

    return NextResponse.json({
      success: true,
      message: 'Recording session stopped',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error stopping recording:', error)
    return NextResponse.json(
      { error: 'Failed to stop recording' },
      { status: 500 }
    )
  }
}

async function handleGetTranscription(sessionId: string, userId: string) {
  try {
    const session = recordingSessions.get(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Recording session not found' },
        { status: 404 }
      )
    }

    // Combine all transcriptions
    const fullTranscription = session.chunks
      .map((chunk) => chunk.transcription)
      .filter(Boolean)
      .join(' ')

    return NextResponse.json({
      success: true,
      transcription: fullTranscription,
      chunks: session.chunks.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting transcription:', error)
    return NextResponse.json(
      { error: 'Failed to get transcription' },
      { status: 500 }
    )
  }
}

async function transcribeAudioChunk(audioData: string, language: string): Promise<string> {
  try {
    // Mock transcription for now
    // In production, this would call OpenAI Whisper API
    const mockTranscriptions = {
      fr: [
        "Le patient présente une douleur à l'épaule droite.",
        "L'examen physique révèle une limitation de mouvement.",
        "Les signes vitaux sont normaux.",
        "La radiographie montre une fracture de la clavicule.",
        "Le traitement recommandé est la physiothérapie."
      ],
      en: [
        "The patient presents with right shoulder pain.",
        "Physical examination reveals limited range of motion.",
        "Vital signs are normal.",
        "X-ray shows a clavicle fracture.",
        "Recommended treatment is physiotherapy."
      ]
    }

    const transcriptions = mockTranscriptions[language as 'fr' | 'en'] || mockTranscriptions.fr
    const randomIndex = Math.floor(Math.random() * transcriptions.length)
    
    return transcriptions[randomIndex]

  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error('Failed to transcribe audio')
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - No auth header' }, { status: 401 })
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    // Verify the user is authenticated using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get recording session from memory
    const recording = recordingSessions.get(sessionId)

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      recording,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Voice recording GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
