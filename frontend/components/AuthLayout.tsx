'use client'

import Link from 'next/link'
import { MessageSquare, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  headline: ReactNode
  subtitle: string
  features: { icon: LucideIcon; text: string }[]
  gradientFrom?: string
  gradientVia?: string
  gradientTo?: string
}

export default function AuthLayout({
  children,
  headline,
  subtitle,
  features,
  gradientFrom = 'from-slate-900',
  gradientVia = 'via-indigo-950',
  gradientTo = 'to-violet-950',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className={`hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`}>
        {/* Decorative orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/5 rounded-full blur-[80px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white/90 tracking-tight">AI Sales Agent</span>
          </Link>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-[2.75rem] font-bold text-white leading-[1.15] mb-5">
              {headline}
            </h1>
            <p className="text-base text-slate-300/80 mb-10 leading-relaxed max-w-md">
              {subtitle}
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-3">
              {features.map((item) => (
                <div key={item.text} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.07] transition-colors duration-200">
                  <div className="h-9 w-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-indigo-300" />
                  </div>
                  <span className="text-sm text-slate-300/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} AI Sales Agent. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-white relative">
        {/* Subtle bg pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AI Sales Agent</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
