import { NextResponse } from 'next/server'
import { createServerSupabaseClient, testSupabaseConnection } from '@/lib/supabase'
import { getEnvironmentConfig } from '@/lib/env'

export async function GET() {
  try {
    // Validate environment configuration
    const env = getEnvironmentConfig()
    
    // Test Supabase connection
    const connectionResult = await testSupabaseConnection()
    
    if (!connectionResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection failed',
          error: connectionResult.error
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
             userCount: connectionResult.userCount,
             app: {
               name: env.app.name,
               url: env.app.url
             },
             features: env.features,
             compliance: env.compliance,
             supabase: {
               projectId: env.supabase.url.split('//')[1]?.split('.')[0] || 'unknown'
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
