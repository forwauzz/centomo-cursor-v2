"use client"

import { useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase-client"

export default function TestOAuthPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [solution, setSolution] = useState<string | null>(null)
  
  const supabase = createClientSupabaseClient()

  const testGoogleOAuth = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setSolution(null)

    try {
      console.log('🧪 Testing Google OAuth...')
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (oauthError) {
        console.error('❌ Google OAuth Error:', oauthError)
        setError(oauthError.message)
        setResult(oauthError)
        
        // Provide specific solutions based on error
        if (oauthError.message.includes('provider not enabled') || oauthError.message.includes('disabled')) {
          setSolution('Google OAuth provider is not enabled in Supabase. Go to Supabase Dashboard > Authentication > Providers > Google and enable it.')
        } else if (oauthError.message.includes('redirect_uri_mismatch')) {
          setSolution('Redirect URI mismatch. Add http://localhost:5002/auth/callback to your Google OAuth redirect URIs.')
        } else if (oauthError.message.includes('invalid_client')) {
          setSolution('Invalid OAuth credentials. Check your Google OAuth Client ID and Secret in Supabase.')
        } else {
          setSolution('Check Supabase Dashboard > Authentication > Providers > Google configuration.')
        }
        return
      }

      console.log('✅ Google OAuth URL generated:', data.url)
      setResult(data)
      setSolution('✅ Google OAuth is working! You can now use Gmail login.')
      
    } catch (err: any) {
      console.error('❌ Unexpected error:', err)
      setError(err.message)
      setResult(err)
      setSolution('Unexpected error occurred. Check browser console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Google OAuth Test
        </h1>
        
        <button
          onClick={testGoogleOAuth}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Google OAuth'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-medium">Error:</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {solution && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-blue-800 font-medium">Solution:</h3>
            <p className="text-blue-700 text-sm mt-1">{solution}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-green-800 font-medium">Result:</h3>
            <pre className="text-green-700 text-xs mt-1 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>Check the browser console for detailed logs.</p>
          <p className="mt-2">
            <strong>Quick Fix:</strong> If you see "provider not enabled" error, 
            go to Supabase Dashboard → Authentication → Providers → Google and enable it.
          </p>
        </div>
      </div>
    </div>
  )
}
