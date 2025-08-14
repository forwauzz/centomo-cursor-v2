import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Client-side environment validation (only checks NEXT_PUBLIC_ variables)
const validateClientEnvironment = () => {
  const errors: string[] = []
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  } else if (!supabaseUrl.includes('supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL appears invalid (should contain supabase.co)')
  }

  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  } else if (!supabaseAnonKey.startsWith('eyJ')) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears invalid (should start with eyJ)')
  }

  if (errors.length > 0) {
    const errorMessage = `Client Environment Configuration Errors:\n${errors.join('\n')}\n\nPlease check your .env.local file and ensure all NEXT_PUBLIC_ variables are set correctly.`
    console.error('❌', errorMessage)
    throw new Error(errorMessage)
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Validate client environment
const env = validateClientEnvironment()

// Create client-side Supabase client (safe for browser)
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'centomomd-v2-client',
      'X-Application-Name': 'CentomoMD V2 Client'
    }
  }
})

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
  
  return { error: error.message || 'An unexpected error occurred' }
}

export default supabase
