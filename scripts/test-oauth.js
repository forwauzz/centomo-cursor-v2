const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Google OAuth Configuration...')
console.log('Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? '✅ Configured' : '❌ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testGoogleOAuth() {
  try {
    console.log('\n🧪 Testing Google OAuth sign-in...')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5002/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('❌ Google OAuth Error:', error.message)
      console.error('Error Code:', error.status)
      console.error('Error Details:', error)
      
      if (error.message.includes('provider not enabled')) {
        console.log('\n💡 SOLUTION: Google OAuth provider is not enabled in Supabase')
        console.log('Go to Supabase Dashboard > Authentication > Providers > Google')
        console.log('Enable Google provider and add your OAuth credentials')
      }
      
      if (error.message.includes('redirect_uri_mismatch')) {
        console.log('\n💡 SOLUTION: Redirect URI mismatch')
        console.log('Add http://localhost:5002/auth/callback to your Google OAuth redirect URIs')
      }
      
      return
    }

    console.log('✅ Google OAuth URL generated successfully')
    console.log('URL:', data.url)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testGoogleOAuth()
