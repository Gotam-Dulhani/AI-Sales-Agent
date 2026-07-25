'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Eye, EyeOff, CheckCircle, Rocket, ShoppingCart, Globe, ShieldCheck } from 'lucide-react'
import { authAPI } from '@/lib/api'
import AuthLayout from '@/components/AuthLayout'

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await authAPI.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone: formData.phone || undefined,
      })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join('. ') : detail || 'Registration failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (success) {
    return (
      <AuthLayout
        headline={<>You&apos;re<br/><span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">all set!</span></>}
        subtitle="Your account has been created successfully."
        features={[]}
        gradientFrom="from-slate-900"
        gradientVia="via-emerald-950"
        gradientTo="to-teal-950"
      >
        <div className="text-center py-8">
          <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h2>
          <p className="text-gray-400 text-sm mb-6">Redirecting you to sign in...</p>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">Go to sign in now</Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      headline={<>Get started<br/><span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">for free.</span></>}
      subtitle="Create your account and launch your AI sales agent in minutes. No credit card required."
      features={[
        { icon: Rocket, text: 'Set up in under 5 minutes' },
        { icon: ShoppingCart, text: 'Automate sales & support instantly' },
        { icon: Globe, text: 'Connect to WhatsApp & web channels' },
        { icon: ShieldCheck, text: 'Enterprise-grade security included' },
      ]}
      gradientFrom="from-slate-900"
      gradientVia="via-violet-950"
      gradientTo="to-fuchsia-950"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
        <p className="text-gray-400 text-sm mb-7">Fill in your details to get started</p>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2.5">
            <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="John Doe" required />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="you@example.com" required />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-300">(optional)</span></label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="+92 300 1234567" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                className="w-full pl-11 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="Create a strong password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 mt-5">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account<ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
