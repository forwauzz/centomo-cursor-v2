/**
 * Environment validation utility for CentomoMD V2
 * Provides comprehensive validation of all required environment variables
 * Separates client-side and server-side validation for security
 */

interface EnvironmentConfig {
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey?: string // Optional for client-side
  }
  app: {
    url: string
    name: string
  }
  security: {
    nextAuthSecret: string
    nextAuthUrl: string
  }
  features: {
    voiceDictation: boolean
    aiAssistant: boolean
    realTimeCollaboration: boolean
  }
  compliance: {
    mode: string
    dataRetentionDays: number
    auditLogging: boolean
  }
}

/**
 * Validates client-side environment variables (NEXT_PUBLIC_ only)
 * Safe for browser use - no server secrets
 */
export const validateClientEnvironment = (): EnvironmentConfig => {
  const errors: string[] = []
  const warnings: string[] = []

  // Client-side Supabase Configuration (NEXT_PUBLIC_ only)
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

  // Application Configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5002'
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'CentomoMD V2'

  // Security Configuration (client-side only)
  const nextAuthUrl = process.env.NEXTAUTH_URL || appUrl

  // Feature Flags
  const voiceDictation = process.env.NEXT_PUBLIC_ENABLE_VOICE_DICTATION === 'true'
  const aiAssistant = process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true'
  const realTimeCollaboration = process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_COLLABORATION === 'true'

  // Compliance Configuration
  const complianceMode = process.env.NEXT_PUBLIC_COMPLIANCE_MODE || 'PIPEDA'
  const dataRetentionDays = parseInt(process.env.NEXT_PUBLIC_DATA_RETENTION_DAYS || '2555', 10)
  const auditLogging = process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING === 'true'

  // Check for critical errors
  if (errors.length > 0) {
    const errorMessage = `Client Environment Configuration Errors:\n${errors.join('\n')}\n\nPlease check your .env.local file and ensure all NEXT_PUBLIC_ variables are set correctly.`
    console.error('❌', errorMessage)
    throw new Error(errorMessage)
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️ Client Environment Warnings:', warnings.join(', '))
  }

  // Log successful configuration
  console.log('✅ Client environment configuration validated successfully')
  console.log(`📱 App: ${appName} (${appUrl})`)
  console.log(`🔐 Supabase: ${supabaseUrl?.split('//')[1]?.split('.')[0] || 'Unknown'}`)
  console.log(`🛡️ Compliance: ${complianceMode}`)
  console.log(`🎯 Features: Voice=${voiceDictation}, AI=${aiAssistant}, Real-time=${realTimeCollaboration}`)

  return {
    supabase: {
      url: supabaseUrl!,
      anonKey: supabaseAnonKey!
    },
    app: {
      url: appUrl,
      name: appName
    },
    security: {
      nextAuthSecret: '', // Not available on client-side
      nextAuthUrl
    },
    features: {
      voiceDictation,
      aiAssistant,
      realTimeCollaboration
    },
    compliance: {
      mode: complianceMode,
      dataRetentionDays,
      auditLogging
    }
  }
}

/**
 * Validates server-side environment variables (all variables including secrets)
 * Only for server-side use - includes service role key
 */
export const validateServerEnvironment = (): EnvironmentConfig => {
  // Safety check: ensure this is only called server-side
  if (typeof window !== 'undefined') {
    throw new Error('Server environment validation cannot be used in the browser')
  }

  const errors: string[] = []
  const warnings: string[] = []

  // Server-side Supabase Configuration (all variables)
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

  // Application Configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5002'
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'CentomoMD V2'

  // Security Configuration
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL || appUrl

  if (!nextAuthSecret) {
    warnings.push('NEXTAUTH_SECRET is not set (recommended for production)')
  }

  // Feature Flags
  const voiceDictation = process.env.NEXT_PUBLIC_ENABLE_VOICE_DICTATION === 'true'
  const aiAssistant = process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true'
  const realTimeCollaboration = process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_COLLABORATION === 'true'

  // Compliance Configuration
  const complianceMode = process.env.NEXT_PUBLIC_COMPLIANCE_MODE || 'PIPEDA'
  const dataRetentionDays = parseInt(process.env.NEXT_PUBLIC_DATA_RETENTION_DAYS || '2555', 10)
  const auditLogging = process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING === 'true'

  // Check for critical errors
  if (errors.length > 0) {
    const errorMessage = `Server Environment Configuration Errors:\n${errors.join('\n')}\n\nPlease check your .env.local file and ensure all required variables are set correctly.`
    console.error('❌', errorMessage)
    throw new Error(errorMessage)
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️ Server Environment Warnings:', warnings.join(', '))
  }

  // Log successful configuration
  console.log('✅ Server environment configuration validated successfully')
  console.log(`📱 App: ${appName} (${appUrl})`)
  console.log(`🔐 Supabase: ${supabaseUrl?.split('//')[1]?.split('.')[0] || 'Unknown'}`)
  console.log(`🛡️ Compliance: ${complianceMode}`)
  console.log(`🎯 Features: Voice=${voiceDictation}, AI=${aiAssistant}, Real-time=${realTimeCollaboration}`)

  return {
    supabase: {
      url: supabaseUrl!,
      anonKey: supabaseAnonKey!,
      serviceRoleKey: supabaseServiceRoleKey!
    },
    app: {
      url: appUrl,
      name: appName
    },
    security: {
      nextAuthSecret: nextAuthSecret || '',
      nextAuthUrl
    },
    features: {
      voiceDictation,
      aiAssistant,
      realTimeCollaboration
    },
    compliance: {
      mode: complianceMode,
      dataRetentionDays,
      auditLogging
    }
  }
}

/**
 * Validates all required environment variables (legacy function)
 * @deprecated Use validateClientEnvironment() or validateServerEnvironment() instead
 */
export const validateEnvironment = (): EnvironmentConfig => {
  // Determine if we're on client or server side
  if (typeof window !== 'undefined') {
    // Client-side: use client validation
    return validateClientEnvironment()
  } else {
    // Server-side: use server validation
    return validateServerEnvironment()
  }
}

/**
 * Get environment configuration (validates on first call)
 */
let envConfig: EnvironmentConfig | null = null

export const getEnvironmentConfig = (): EnvironmentConfig => {
  if (!envConfig) {
    envConfig = validateEnvironment()
  }
  return envConfig
}

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if we're in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get feature flags
 */
export const getFeatureFlags = () => {
  const config = getEnvironmentConfig()
  return config.features
}

/**
 * Get compliance settings
 */
export const getComplianceSettings = () => {
  const config = getEnvironmentConfig()
  return config.compliance
}
