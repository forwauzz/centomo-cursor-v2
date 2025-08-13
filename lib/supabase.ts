import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'centomomd-v2'
    }
  }
})

// Server-side Supabase client (for API routes)
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
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

// Type-safe database operations
export const db = {
  // User operations
  users: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: Partial<Database['public']['Tables']['users']['Update']>) => {
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
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    getById: async (id: string, userId: string) => {
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
      const { data, error } = await supabase
        .from('patients')
        .insert(patient)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: Partial<Database['public']['Tables']['patients']['Update']>) => {
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
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    create: async (record: Database['public']['Tables']['medical_records']['Insert']) => {
      const { data, error } = await supabase
        .from('medical_records')
        .insert(record)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: Partial<Database['public']['Tables']['medical_records']['Update']>) => {
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
      const { data, error } = await supabase
        .from('audit_logs')
        .insert(log)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    getByUserId: async (userId: string, limit = 100) => {
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

export default supabase
