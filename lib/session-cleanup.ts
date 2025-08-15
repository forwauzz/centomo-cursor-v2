import { createServerSupabaseClient } from './supabase-admin'

/**
 * Clean up expired form sessions
 * This function should be called periodically (e.g., via cron job)
 * to ensure compliance with zero-retention policy
 */
export async function cleanupExpiredSessions() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Delete all expired sessions
    const { data, error } = await supabase
      .from('form_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) {
      console.error('Error cleaning up expired sessions:', error)
      return { success: false, error: error.message, deletedCount: 0 }
    }

    const deletedCount = data?.length || 0
    console.log(`Cleaned up ${deletedCount} expired form sessions`)

    return { success: true, deletedCount }
  } catch (error) {
    console.error('Session cleanup error:', error)
    return { success: false, error: 'Internal error', deletedCount: 0 }
  }
}

/**
 * Get session statistics for monitoring
 */
export async function getSessionStats() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get total active sessions
    const { data: activeSessions, error: activeError } = await supabase
      .from('form_sessions')
      .select('id', { count: 'exact' })
      .gt('expires_at', new Date().toISOString())

    if (activeError) {
      console.error('Error getting active sessions:', activeError)
      return { success: false, error: activeError.message }
    }

    // Get sessions expiring in next hour
    const oneHourFromNow = new Date()
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)

    const { data: expiringSessions, error: expiringError } = await supabase
      .from('form_sessions')
      .select('id', { count: 'exact' })
      .gt('expires_at', new Date().toISOString())
      .lt('expires_at', oneHourFromNow.toISOString())

    if (expiringError) {
      console.error('Error getting expiring sessions:', expiringError)
      return { success: false, error: expiringError.message }
    }

    return {
      success: true,
      stats: {
        activeSessions: activeSessions?.length || 0,
        expiringInNextHour: expiringSessions?.length || 0,
        lastChecked: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Session stats error:', error)
    return { success: false, error: 'Internal error' }
  }
}

/**
 * Force cleanup all sessions for a specific user (admin function)
 */
export async function cleanupUserSessions(userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Delete all sessions for the user
    const { data, error } = await supabase
      .from('form_sessions')
      .delete()
      .eq('user_id', userId)
      .select('id')

    if (error) {
      console.error('Error cleaning up user sessions:', error)
      return { success: false, error: error.message, deletedCount: 0 }
    }

    const deletedCount = data?.length || 0
    console.log(`Cleaned up ${deletedCount} sessions for user ${userId}`)

    return { success: true, deletedCount }
  } catch (error) {
    console.error('User session cleanup error:', error)
    return { success: false, error: 'Internal error', deletedCount: 0 }
  }
}
