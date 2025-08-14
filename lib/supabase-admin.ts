import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Server-side environment validation (checks all variables including secrets)
const validateServerEnvironment = () => {
  // Safety check: ensure this is only called server-side
  if (typeof window !== 'undefined') {
    throw new Error('Server-side Supabase client cannot be used in the browser')
  }

  const errors: string[] = []
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

  if (!supabaseServiceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required')
  } else if (!supabaseServiceRoleKey.startsWith('eyJ')) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY appears invalid (should start with eyJ)')
  }

  if (errors.length > 0) {
    const errorMessage = `Server Environment Configuration Errors:\n${errors.join('\n')}\n\nPlease check your .env.local file and ensure all required variables are set correctly.`
    console.error('❌', errorMessage)
    throw new Error(errorMessage)
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey }
}

// Validate server environment
const env = validateServerEnvironment()

// Create server-side Supabase client with service role (for API routes and server functions)
export const createServerSupabaseClient = () => {
  // Safety check: ensure this is only called server-side
  if (typeof window !== 'undefined') {
    throw new Error('Server-side Supabase client cannot be used in the browser')
  }

  return createClient<Database>(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'centomomd-v2-server',
        'X-Application-Name': 'CentomoMD V2 Server'
      }
    }
  })
}

// Server-side connection test function
export const testServerConnection = async () => {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test basic connection by checking if we can access the auth schema
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Server Supabase auth connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    // Try to get user count if users table exists
    try {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.warn('Users table not accessible (may not exist yet):', countError.message)
        // Still return success since auth connection works
        console.log('✅ Server Supabase connection successful (auth only)')
        return { success: true, userCount: 0, note: 'Users table not accessible' }
      }
      
      console.log('✅ Server Supabase connection successful')
      console.log('📊 Database user count:', count || 0)
      return { success: true, userCount: count || 0 }
    } catch (tableError) {
      console.warn('Users table query failed:', tableError)
      // Still return success since auth connection works
      console.log('✅ Server Supabase connection successful (auth only)')
      return { success: true, userCount: 0, note: 'Users table not accessible' }
    }
  } catch (error) {
    console.error('❌ Server Supabase connection test error:', error)
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

// Type-safe database operations for server-side use
export const db = {
  // User operations
  users: {
    getById: async (id: string) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: Partial<Database['public']['Tables']['users']['Update']>) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // Patient operations
  patients: {
    getAll: async (userId: string) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    getById: async (id: string, userId: string) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return data
    },
    
    create: async (patient: Database['public']['Tables']['patients']['Insert']) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('patients')
        .insert(patient)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: Partial<Database['public']['Tables']['patients']['Update']>) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    delete: async (id: string) => {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },
  
  // Medical records operations
  medicalRecords: {
    getAll: async (patientId: string) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    getById: async (id: string) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    create: async (record: Database['public']['Tables']['medical_records']['Insert']) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('medical_records')
        .insert(record)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: Partial<Database['public']['Tables']['medical_records']['Update']>) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('medical_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    delete: async (id: string) => {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },
  
  // Audit logs
  auditLogs: {
    create: async (log: Database['public']['Tables']['audit_logs']['Insert']) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('audit_logs')
        .insert(log)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    getByUserId: async (userId: string, limit = 100) => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    }
  }
}
