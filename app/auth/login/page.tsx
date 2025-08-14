"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"
import { Lock, Loader2, Shield, Cross } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back to CentomoMD!",
        })
        router.replace('/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      let errorMessage = "An unexpected error occurred. Please try again."
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials."
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please check your email and confirm your account before signing in."
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = "Too many login attempts. Please wait a moment before trying again."
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw error
      }

      // OAuth redirect will handle the rest
    } catch (error: any) {
      console.error('Google login error:', error)
      
      toast({
        title: "Google Login Failed",
        description: "Unable to connect with Google. Please try again or use email/password.",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          {/* Logo and Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Cross className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">CentomoMD</h1>
              <p className="text-blue-100 text-sm">Professional Medical Documentation</p>
            </div>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Secure Medical Professional Access
          </h2>

          {/* Key Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-200 rounded-full"></div>
              <span className="text-lg">CNESST Form Automation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-200 rounded-full"></div>
              <span className="text-lg">Voice-Powered Documentation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-200 rounded-full"></div>
              <span className="text-lg">AI-Enhanced Medical Formatting</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-200 rounded-full"></div>
              <span className="text-lg">Quebec Healthcare Compliant</span>
            </div>
          </div>

          {/* Security Messaging */}
          <div className="bg-blue-700/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-blue-100">
              Your medical data is protected with enterprise-grade security
            </p>
            <p className="text-sm text-blue-100">
              Zero patient data retention for maximum privacy
            </p>
            <p className="text-sm text-blue-100">
              Quebec Law 25 compliant medical platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cross className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CentomoMD</h1>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Secure Medical Platform
            </div>
            <div className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" />
              SSL Encrypted
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border-0 p-6">
            <div className="text-center pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Medical Professional Login
              </h2>
              <p className="text-gray-600">
                Access your secure medical documentation platform
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Medical Professional Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading || isGoogleLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Secure Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading || isGoogleLoading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Secure Login
                  </>
                )}
              </button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-11 mt-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Gmail
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <a 
                href="/auth/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </a>
            </div>

            {/* Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New Medical Professional?{" "}
                <a 
                  href="/auth/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Request Platform Access
                </a>
              </p>
            </div>

            {/* Compliance Indicators */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Quebec Law 25</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Medical Grade Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
