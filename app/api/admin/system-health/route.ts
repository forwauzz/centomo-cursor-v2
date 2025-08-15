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

    // Verify the user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mock system health data (in production, this would come from actual system monitoring)
    const systemHealth = {
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'online',
          responseTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
          connections: Math.floor(Math.random() * 50) + 100, // 100-150
          uptime: 99.9
        },
        authentication: {
          status: 'online',
          responseTime: Math.floor(Math.random() * 30) + 5, // 5-35ms
          activeSessions: Math.floor(Math.random() * 100) + 200, // 200-300
          uptime: 99.8
        },
        aiServices: {
          status: 'online',
          responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
          modelAccuracy: 94.2,
          uptime: 99.7
        },
        voiceProcessing: {
          status: 'online',
          responseTime: Math.floor(Math.random() * 200) + 100, // 100-300ms
          activeRecordings: Math.floor(Math.random() * 10) + 5, // 5-15
          uptime: 99.6
        }
      },
      resources: {
        cpu: {
          usage: Math.floor(Math.random() * 30) + 20, // 20-50%
          cores: 8,
          temperature: Math.floor(Math.random() * 20) + 40 // 40-60°C
        },
        memory: {
          usage: Math.floor(Math.random() * 20) + 60, // 60-80%
          total: '32GB',
          available: '8GB'
        },
        disk: {
          usage: Math.floor(Math.random() * 15) + 45, // 45-60%
          total: '1TB',
          available: '400GB'
        },
        network: {
          latency: Math.floor(Math.random() * 50) + 10, // 10-60ms
          bandwidth: Math.floor(Math.random() * 100) + 500, // 500-600 Mbps
          activeConnections: Math.floor(Math.random() * 100) + 200 // 200-300
        }
      },
      compliance: {
        hipaa: 'compliant',
        quebecLaw25: 'compliant',
        wcag21: 'compliant',
        lastAudit: '2024-01-01T00:00:00Z',
        nextAudit: '2024-07-01T00:00:00Z'
      },
      alerts: [
        {
          id: '1',
          severity: 'low',
          message: 'System performing normally',
          timestamp: new Date().toISOString()
        }
      ]
    }

    return NextResponse.json(systemHealth)
  } catch (error) {
    console.error('System health API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
