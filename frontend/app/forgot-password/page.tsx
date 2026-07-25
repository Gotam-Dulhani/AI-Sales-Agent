'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle, KeyRound, Shield, RefreshCw, Lock } from 'lucide-react'
import AuthLayout from '@/components/AuthLayout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await new Promise((r) => setTimeout(r, 1500))
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        headline={<>Check your<br/><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">inbox.</span></>}
        subtitle="We've sent you a password reset link. Check your email."
        features={[]}
        gradientFrom="from-slate-900"
        gradientVia="via-amber-950"
        gradientTo="to-orange-950"
      >
        <div className="text-center py-8">
          <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
            We sent a password reset link to <span className="font-medium text-gray-600">{email}</span>
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      headline={<>Reset your<br/><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">password.</span></>}
      subtitle="Happens to the best of us. Enter your email and we'll send you a reset link."
      features={[
        { icon: KeyRound, text: 'Secure password reset via email' },
        { icon: Shield, text: 'Your account stays protected' },
        { icon: RefreshCw, text: 'Create a new strong password' },
        { icon: Lock, text: 'All sessions will be refreshed' },
      ]}
      gradientFrom="from-slate-900"
      gradientVia="via-amber-950"
      gradientTo="to-orange-950"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h2>
        <p className="text-gray-400 text-sm mb-8">No worries, we&apos;ll send you reset instructions.</p>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2.5">
            <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="you@example.com" required />
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Reset Link<ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
