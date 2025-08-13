import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    // Test Supabase connection
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed',
          error: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV,
      database: 'connected',
      features: {
        voiceDictation: process.env.NEXT_PUBLIC_ENABLE_VOICE_DICTATION === 'true',
        aiAssistant: process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true',
        realTimeCollaboration: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_COLLABORATION === 'true',
      },
      compliance: {
        mode: process.env.NEXT_PUBLIC_COMPLIANCE_MODE || 'PIPEDA',
        auditLogging: process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING === 'true',
        dataRetentionDays: process.env.NEXT_PUBLIC_DATA_RETENTION_DAYS || '2555',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
