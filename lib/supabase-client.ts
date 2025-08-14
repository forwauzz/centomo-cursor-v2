import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database-schema'

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createClientSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}

// For backward compatibility
export const supabase = createClientSupabaseClient()

// Client-side connection test function
export const testClientConnection = async () => {
  try {
    // Test basic connection by checking if we can access the auth schema
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Client Supabase auth connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Client Supabase connection successful')
    return { success: true }
  } catch (error) {
    console.error('❌ Client Supabase connection test error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error.code === 'PGRST116') {
    return { error: 'Authentication required' }
  }
  
  if (error.code === 'PGRST301') {
    return { error: 'Invalid credentials' }
  }
  
  if (error.code === 'PGRST302') {
    return { error: 'Access denied' }
  }
  
  if (error.status === 401) {
    return { error: 'JWT token invalid or expired' }
  }
  
  return { error: error.message || 'An unexpected error occurred' }
}

export default supabase
