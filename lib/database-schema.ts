import { createServerSupabaseClient } from './supabase-admin'

/**
 * Database schema types and verification utility
 */

// Database table types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash?: string
          oauth_provider?: string
          oauth_sub?: string
          role: 'admin' | 'doctor' | 'staff'
          status: 'pending' | 'active' | 'suspended'
          full_name: string
          created_at: string
          updated_at: string
          last_login?: string
          created_by?: string
          approved_at?: string
        }
        Insert: {
          id?: string
          email: string
          password_hash?: string
          oauth_provider?: string
          oauth_sub?: string
          role: 'admin' | 'doctor' | 'staff'
          status?: 'pending' | 'active' | 'suspended'
          full_name: string
          created_at?: string
          updated_at?: string
          last_login?: string
          created_by?: string
          approved_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          oauth_provider?: string
          oauth_sub?: string
          role?: 'admin' | 'doctor' | 'staff'
          status?: 'pending' | 'active' | 'suspended'
          full_name?: string
          created_at?: string
          updated_at?: string
          last_login?: string
          created_by?: string
          approved_at?: string
        }
      }
      doctor_profiles: {
        Row: {
          id: string
          user_id: string
          doctor_id: string
          credentials?: string
          specialty?: string
          license_number?: string
          practice_address?: string
          practice_phone?: string
          preferences?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          doctor_id?: string
          credentials?: string
          specialty?: string
          license_number?: string
          practice_address?: string
          practice_phone?: string
          preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          doctor_id?: string
          credentials?: string
          specialty?: string
          license_number?: string
          practice_address?: string
          practice_phone?: string
          preferences?: any
          created_at?: string
          updated_at?: string
        }
      }

      user_invitations: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'doctor' | 'staff'
          status: 'pending' | 'accepted' | 'expired'
          invited_by: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'doctor' | 'staff'
          status?: 'pending' | 'accepted' | 'expired'
          invited_by: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'doctor' | 'staff'
          status?: 'pending' | 'accepted' | 'expired'
          invited_by?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      form_sessions: {
        Row: {
          id: string
          user_id: string
          session_data: any
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_data: any
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_data?: any
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      export_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
      form_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          template_data: any
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          template_data: any
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          template_data?: any
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      training_data: {
        Row: {
          id: string
          file_name: string
          file_url: string
          file_size: number
          uploaded_by: string
          status: 'pending' | 'processed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_url: string
          file_size: number
          uploaded_by: string
          status?: 'pending' | 'processed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_url?: string
          file_size?: number
          uploaded_by?: string
          status?: 'pending' | 'processed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      ai_training_metrics: {
        Row: {
          id: string
          model_version: string
          accuracy: number
          training_samples: number
          training_duration: number
          created_at: string
        }
        Insert: {
          id?: string
          model_version: string
          accuracy: number
          training_samples: number
          training_duration: number
          created_at?: string
        }
        Update: {
          id?: string
          model_version?: string
          accuracy?: number
          training_samples?: number
          training_duration?: number
          created_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string
          action_type: string
          action_data: any
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action_type: string
          action_data: any
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action_type?: string
          action_data?: any
          created_at?: string
        }
      }
      system_config: {
        Row: {
          id: string
          key: string
          value: any
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          description?: string | null
          updated_at?: string
        }
      }
      system_logs: {
        Row: {
          id: string
          level: 'info' | 'warning' | 'error'
          message: string
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          level?: 'info' | 'warning' | 'error'
          message: string
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          level?: 'info' | 'warning' | 'error'
          message?: string
          metadata?: any
          created_at?: string
        }
      }
    }
  }
}

export interface SchemaStatus {
  users: boolean
  doctor_profiles: boolean
  user_invitations: boolean
  form_sessions: boolean
  export_tokens: boolean
  form_templates: boolean
  training_data: boolean
  ai_training_metrics: boolean
  admin_actions: boolean
  system_config: boolean
  system_logs: boolean
}

export const verifyDatabaseSchema = async (): Promise<SchemaStatus> => {
  const status: SchemaStatus = {
    users: false,
    doctor_profiles: false,
    user_invitations: false,
    form_sessions: false,
    export_tokens: false,
    form_templates: false,
    training_data: false,
    ai_training_metrics: false,
    admin_actions: false,
    system_config: false,
    system_logs: false
  }

  const tables = [
    'users',
    'doctor_profiles',
    'user_invitations',
    'form_sessions',
    'export_tokens',
    'form_templates',
    'training_data',
    'ai_training_metrics',
    'admin_actions',
    'system_config',
    'system_logs'
  ]

  for (const table of tables) {
    try {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (!error) {
        status[table as keyof SchemaStatus] = true
        console.log(`✅ Table ${table} exists`)
      } else {
        console.log(`❌ Table ${table} not accessible:`, error.message)
      }
    } catch (error) {
      console.log(`❌ Table ${table} error:`, error)
    }
  }

  return status
}

export const getSchemaSummary = (status: SchemaStatus) => {
  const existingTables = Object.entries(status).filter(([_, exists]) => exists).map(([table]) => table)
  const missingTables = Object.entries(status).filter(([_, exists]) => !exists).map(([table]) => table)
  
  return {
    total: Object.keys(status).length,
    existing: existingTables.length,
    missing: missingTables.length,
    existingTables,
    missingTables
  }
}

export const checkRequiredTables = async () => {
  console.log('🔍 Verifying database schema...')
  const status = await verifyDatabaseSchema()
  const summary = getSchemaSummary(status)
  
  console.log(`📊 Schema Summary:`)
  console.log(`   Total tables: ${summary.total}`)
  console.log(`   Existing: ${summary.existing}`)
  console.log(`   Missing: ${summary.missing}`)
  
  if (summary.missing > 0) {
    console.log(`   Missing tables: ${summary.missingTables.join(', ')}`)
  }
  
  return { status, summary }
}
