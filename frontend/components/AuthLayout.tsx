'use client'

import Link from 'next/link'
import { MessageSquare, Bot, Sparkles, Shield, BarChart3 } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Sales Agent</span>
          </Link>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Sales Assistant
              </span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed">
              Automate customer support, boost sales, and manage leads — all powered by intelligent AI.
            </p>

            {/* Feature List */}
            <div className="space-y-4">
              {[
                { icon: Bot, text: '24/7 AI customer support' },
                { icon: Sparkles, text: 'Smart product recommendations' },
                { icon: Shield, text: 'Secure & reliable platform' },
                { icon: BarChart3, text: 'Real-time analytics & insights' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-indigo-300" />
                  </div>
                  <span className="text-sm text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} AI Sales Agent. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI Sales Agent</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
