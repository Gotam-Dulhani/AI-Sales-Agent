'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, MessageSquare, Users, Zap, Clock } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import AuthLayout from '@/components/AuthLayout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const setAuth = useAuth((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const { data } = await authAPI.login({ email, password })
      setAuth(data.user, data.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      headline={<>Welcome<br/><span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">back.</span></>}
      subtitle="Sign in to manage your AI-powered sales team and keep your business running 24/7."
      features={[
        { icon: MessageSquare, text: 'Manage AI-powered conversations' },
        { icon: Users, text: 'Track leads and customer data' },
        { icon: Zap, text: 'Automated product recommendations' },
        { icon: Clock, text: 'Real-time order tracking & support' },
      ]}
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
        <p className="text-gray-400 text-sm mb-8">Enter your credentials to access your dashboard</p>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2.5">
            <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="you@example.com" required />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="Enter your password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 mt-6">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In<ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Create one</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
