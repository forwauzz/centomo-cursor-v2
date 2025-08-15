import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-admin'
import { cleanupExpiredSessions, getSessionStats, cleanupUserSessions } from '@/lib/session-cleanup'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get session statistics
    const stats = await getSessionStats()
    
    if (!stats.success) {
      return NextResponse.json({ error: stats.error }, { status: 500 })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Session cleanup GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, userId } = body

    let result

    switch (action) {
      case 'cleanup_expired':
        result = await cleanupExpiredSessions()
        break
      case 'cleanup_user':
        if (!userId) {
          return NextResponse.json({ error: 'userId required for user cleanup' }, { status: 400 })
        }
        result = await cleanupUserSessions(userId)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Session cleanup POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
