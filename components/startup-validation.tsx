'use client'

import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '@/lib/supabase'
import { getEnvironmentConfig } from '@/lib/env'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface ValidationStatus {
  environment: boolean
  supabase: boolean
  error?: string
}

export function StartupValidation() {
  const [status, setStatus] = useState<ValidationStatus>({
    environment: false,
    supabase: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const validateStartup = async () => {
      try {
        // Validate environment configuration
        console.log('🔍 Validating environment configuration...')
        getEnvironmentConfig()
        setStatus(prev => ({ ...prev, environment: true }))
        console.log('✅ Environment validation passed')

        // Test Supabase connection
        console.log('🔍 Testing Supabase connection...')
        const connectionResult = await testSupabaseConnection()
        
        if (connectionResult.success) {
          setStatus(prev => ({ ...prev, supabase: true }))
          console.log('✅ Supabase connection successful')
        } else {
          setStatus(prev => ({ 
            ...prev, 
            supabase: false, 
            error: connectionResult.error 
          }))
          console.error('❌ Supabase connection failed:', connectionResult.error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setStatus({
          environment: false,
          supabase: false,
          error: errorMessage
        })
        console.error('❌ Startup validation failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    validateStartup()
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-lg border">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <h3 className="font-medium">Validating Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Checking environment and database connection...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!status.environment || !status.supabase) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-lg border max-w-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Configuration Error</h3>
              <div className="mt-2 space-y-2">
                {!status.environment && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">Environment configuration failed</span>
                  </div>
                )}
                {!status.supabase && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">Database connection failed</span>
                  </div>
                )}
                {status.error && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md">
                    <p className="text-xs text-red-700 font-mono">{status.error}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Please check your <code className="bg-gray-100 px-1 rounded">.env.local</code> file and ensure all required environment variables are set correctly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export function ValidationStatus() {
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    const checkValidation = async () => {
      try {
        getEnvironmentConfig()
        const connectionResult = await testSupabaseConnection()
        setIsValid(connectionResult.success)
      } catch {
        setIsValid(false)
      }
    }

    checkValidation()
  }, [])

  if (isValid === null) return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg ${
        isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isValid ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isValid ? 'System Ready' : 'Configuration Error'}
        </span>
      </div>
    </div>
  )
}
