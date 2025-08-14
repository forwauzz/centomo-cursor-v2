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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
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
