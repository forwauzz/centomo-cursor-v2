import { createServerSupabaseClient } from './supabase-admin'

/**
 * Database schema verification utility
 * Checks if required tables exist and are properly configured
 */

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
