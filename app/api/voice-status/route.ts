import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id

    // Check if user is requesting their own data or is admin
    if (userId !== user.id) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!userData || userData.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Mock voice recording status (in production, this would come from actual voice processing service)
    const voiceStatus = {
      userId,
      isRecording: false,
      isConnected: true,
      quality: 'excellent' as const,
      duration: 0,
      lastRecording: null,
      deviceInfo: {
        microphone: 'Default Microphone',
        sampleRate: 44100,
        channels: 1,
        bitDepth: 16
      },
      systemStatus: {
        voiceProcessing: 'online',
        transcriptionService: 'online',
        languageModel: 'online',
        accuracy: 94.2
      },
      settings: {
        language: 'en-CA',
        autoPunctuation: true,
        profanityFilter: false,
        speakerDiarization: false
      },
      recentRecordings: [
        {
          id: '1',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          duration: 180, // 3 minutes
          quality: 'excellent',
          transcription: 'Patient presents with...',
          status: 'completed'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          duration: 240, // 4 minutes
          quality: 'good',
          transcription: 'Physical examination reveals...',
          status: 'completed'
        }
      ]
    }

    return NextResponse.json(voiceStatus)
  } catch (error) {
    console.error('Voice status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, settings, deviceInfo } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Handle different voice actions
    switch (action) {
      case 'start_recording':
        // In production, this would start the actual voice recording
        return NextResponse.json({
          success: true,
          recordingId: `rec_${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: 'Voice recording started'
        })

      case 'stop_recording':
        // In production, this would stop the actual voice recording
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          message: 'Voice recording stopped'
        })

      case 'update_settings':
        // Update voice settings
        if (settings) {
          // In production, this would update user voice settings in database
          return NextResponse.json({
            success: true,
            settings: {
              language: settings.language || 'en-CA',
              autoPunctuation: settings.autoPunctuation !== undefined ? settings.autoPunctuation : true,
              profanityFilter: settings.profanityFilter !== undefined ? settings.profanityFilter : false,
              speakerDiarization: settings.speakerDiarization !== undefined ? settings.speakerDiarization : false
            },
            message: 'Voice settings updated'
          })
        }
        break

      case 'test_connection':
        // Test voice connection
        return NextResponse.json({
          success: true,
          isConnected: true,
          quality: 'excellent',
          message: 'Voice connection test successful'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Voice action API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
