'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, TrendingUp, Users, ShoppingBag, FileText,
  Settings, Search, Plus, Upload, Bell,
  Lock, Trash2, X, CheckCircle, AlertCircle, Loader2,
  LayoutDashboard, Headphones, Package, FolderOpen,
  BarChart3, LogOut, ChevronRight, Sparkles, ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { businessAPI, chatAPI, productsAPI, documentsAPI } from '@/lib/api'

type Tab = 'overview' | 'chats' | 'customers' | 'products' | 'documents' | 'analytics' | 'settings'

const extractError = (e: any): string => {
  const detail = e?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
  if (detail?.msg) return detail.msg
  return 'An error occurred'
}

interface Toast { id: number; msg: string; type: 'success' | 'error' }

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [business, setBusiness] = useState<any>(null)
  const [bizLoading, setBizLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  let toastId = useRef(0)

  const toast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId.current
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    businessAPI.getAll().then(({ data }) => {
      if (data.length > 0) setBusiness(data[0])
    }).catch(() => {}).finally(() => setBizLoading(false))
  }, [isAuthenticated, router])

  const handleLogout = () => { logout(); router.push('/login') }

  if (!isAuthenticated) return null

  const tabs: [Tab, string, any][] = [
    ['overview', 'Overview', LayoutDashboard],
    ['chats', 'Chats', Headphones],
    ['customers', 'Customers', Users],
    ['products', 'Products', Package],
    ['documents', 'Documents', FolderOpen],
    ['analytics', 'Analytics', BarChart3],
    ['settings', 'Settings', Settings],
  ]

  const sharedProps = { business, toast }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-[60] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium backdrop-blur-sm ${
            t.type === 'success' ? 'bg-emerald-500/90' : 'bg-red-500/90'
          }`} style={{ animation: 'slideInRight 0.3s ease-out' }}>
            {t.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-slate-900 z-30 flex flex-col">
        {/* Logo */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">AI Sales Agent</span>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/[0.06]" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Menu</p>
          {tabs.map(([tab, label, Icon]) => {
            const isActive = activeTab === tab
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-500/20' : 'bg-white/[0.04]'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {label}
              </button>
            )
          })}
        </nav>

        {/* Business badge */}
        {business && (
          <div className="mx-3 mb-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-xs font-bold text-white">
                {business.name?.charAt(0)?.toUpperCase() || 'B'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{business.name}</p>
                <p className="text-[10px] text-slate-500">Business Account</p>
              </div>
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-xs font-bold text-white">
              {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-all"
              title="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-[260px] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#f8fafc]/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900">
                {activeTab === 'overview' ? 'Overview' : tabs.find(t => t[0] === activeTab)?.[1]}
              </h1>
              {business && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">{business.name}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!bizLoading && !business && activeTab !== 'settings' && (
                <button onClick={() => setActiveTab('settings')}
                  className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition font-medium">
                  Complete setup
                </button>
              )}
              <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview'   && <OverviewTab {...sharedProps} setActiveTab={setActiveTab} />}
          {activeTab === 'chats'      && <ChatsTab {...sharedProps} />}
          {activeTab === 'customers'  && <CustomersTab {...sharedProps} />}
          {activeTab === 'products'   && <ProductsTab {...sharedProps} />}
          {activeTab === 'documents'  && <DocumentsTab {...sharedProps} />}
          {activeTab === 'analytics'  && <AnalyticsTab />}
          {activeTab === 'settings'   && <SettingsTab user={user} business={business} setBusiness={setBusiness} toast={toast} />}
        </div>
      </main>

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

/* ─── Reusable Card ──────────────────────────────────────────────────── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${className}`}>{children}</div>
  )
}

/* ─── Modal ──────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200/50" onClick={e => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.15s ease-out' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
      <style jsx global>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 bg-slate-50/50 focus:bg-white placeholder:text-slate-300"

function ConfirmDelete({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel}>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        Are you sure you want to delete <span className="font-semibold text-slate-900">{name}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Delete
        </button>
      </div>
    </Modal>
  )
}

/* ─── Overview Tab ─────────────────────────────────────────────────── */
function OverviewTab({ business, setActiveTab }: any) {
  const stats = [
    { label: 'Total Conversations', value: '1,234', icon: MessageSquare, change: '+12.5%', up: true, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
    { label: 'Active Leads', value: '56', icon: Users, change: '+8.2%', up: true, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
    { label: 'Orders This Month', value: '89', icon: ShoppingBag, change: '+23.1%', up: true, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
    { label: 'Satisfaction Rate', value: '95%', icon: TrendingUp, change: '+2.4%', up: true, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="p-6 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}!</h2>
            <p className="text-indigo-100 text-sm">Here&apos;s what&apos;s happening with your business today.</p>
          </div>
          <div className="hidden md:flex h-14 w-14 bg-white/10 rounded-2xl items-center justify-center">
            <Sparkles className="h-6 w-6 text-white/80" />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5 hover:shadow-md transition-shadow duration-200 group cursor-default">
            <div className="flex items-start justify-between mb-4">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className="h-5 w-5 text-slate-700" />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${s.up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Conversations */}
        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Conversations</h3>
            <button onClick={() => setActiveTab('chats')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { name: 'Ahmed Khan', msg: 'Interested in premium plan', time: '2m ago', status: 'active' },
              { name: 'Sara Malik', msg: 'Asked about delivery time', time: '15m ago', status: 'active' },
              { name: 'Bilal Raza', msg: 'Order #1089 confirmed', time: '1h ago', status: 'pending' },
              { name: 'Hina Javed', msg: 'Complaint resolved', time: '3h ago', status: 'resolved' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-xs font-bold text-white">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {c.status === 'active' && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.msg}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-300">{c.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Start new chat', icon: Headphones, tab: 'chats', color: 'bg-blue-50 text-blue-600' },
              { label: 'Add product', icon: Package, tab: 'products', color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Upload document', icon: FolderOpen, tab: 'documents', color: 'bg-amber-50 text-amber-600' },
              { label: 'View analytics', icon: BarChart3, tab: 'analytics', color: 'bg-violet-50 text-violet-600' },
            ].map(a => (
              <button key={a.label} onClick={() => setActiveTab(a.tab)}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-50 transition-all group text-left">
                <div className={`h-8 w-8 rounded-lg ${a.color} flex items-center justify-center`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{a.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ─── Chats Tab ────────────────────────────────────────────────────── */
function ChatsTab({ business, toast }: any) {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!business) return
    setLoading(true)
    chatAPI.getChats(business.id).then(({ data }) => setChats(data)).catch(() => {}).finally(() => setLoading(false))
  }, [business])

  const handleAdd = async () => {
    if (!form.customer_name.trim()) return
    setSaving(true)
    try {
      const { data } = await chatAPI.createChat({
        business_id: business.id, customer_name: form.customer_name,
        customer_phone: form.customer_phone || undefined, customer_email: form.customer_email || undefined,
      })
      setChats(c => [data, ...c])
      setShowModal(false)
      setForm({ customer_name: '', customer_phone: '', customer_email: '' })
      toast('Chat created!')
    } catch (e: any) { toast(extractError(e), 'error') }
    finally { setSaving(false) }
  }

  const filtered = chats.filter(c => (c.customer_name || '').toLowerCase().includes(q.toLowerCase()))
  const statusStyle: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    resolved: 'bg-slate-100 text-slate-600 ring-slate-500/10',
    handed_over: 'bg-violet-50 text-violet-700 ring-violet-600/10',
  }

  return (
    <>
      {showModal && (
        <Modal title="New Chat" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Customer Name *">
              <input className={inputCls} value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Ahmed Khan" />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} placeholder="+92 300 1234567" />
            </Field>
            <Field label="Email">
              <input className={inputCls} value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} placeholder="customer@email.com" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.customer_name.trim()}
                className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search conversations..."
                className="w-72 pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-slate-50/50 focus:bg-white" />
            </div>
          </div>
          <button onClick={() => { if (!business) { toast('Set up your business first', 'error'); return } setShowModal(true) }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/20">
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Headphones className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No conversations yet</p>
            <p className="text-xs text-slate-400 mt-1">Create a new chat to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {(c.customer_name || 'C').split(' ').length > 1
                      ? `${(c.customer_name || 'C').split(' ')[0][0]}${(c.customer_name || 'C').split(' ')[1][0]}`.toUpperCase()
                      : (c.customer_name || 'C').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.customer_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.customer_email || c.customer_phone || 'No contact info'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ring-1 ring-inset ${statusStyle[c.status] || 'bg-slate-100 text-slate-500 ring-slate-500/10'}`}>
                    {c.status || 'active'}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}

/* ─── Customers Tab ────────────────────────────────────────────────── */
function CustomersTab({ toast }: any) {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Ahmed Khan', email: 'ahmed@email.com', phone: '+92 300 1111111', orders: 5, spent: 12500 },
    { id: 2, name: 'Sara Malik', email: 'sara@email.com', phone: '+92 300 2222222', orders: 3, spent: 7200 },
    { id: 3, name: 'Bilal Raza', email: 'bilal@email.com', phone: '+92 300 3333333', orders: 8, spent: 24000 },
    { id: 4, name: 'Hina Javed', email: 'hina@email.com', phone: '+92 300 4444444', orders: 1, spent: 1800 },
    { id: 5, name: 'Usman Tariq', email: 'usman@email.com', phone: '+92 300 5555555', orders: 12, spent: 45600 },
  ])
  const [showModal, setShowModal] = useState(false)
  const [delTarget, setDelTarget] = useState<any>(null)
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const nextId = useRef(100)

  const handleAdd = () => {
    if (!form.name.trim()) return
    setCustomers(c => [{ id: nextId.current++, ...form, orders: 0, spent: 0 }, ...c])
    setShowModal(false); setForm({ name: '', email: '', phone: '' }); toast('Customer added!')
  }
  const handleDelete = (c: any) => { setCustomers(cs => cs.filter(x => x.id !== c.id)); setDelTarget(null); toast(`${c.name} removed`) }

  const filtered = customers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      {showModal && (
        <Modal title="Add Customer" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Full Name *"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ahmed Khan" /></Field>
            <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ahmed@email.com" /></Field>
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300 0000000" /></Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name.trim()} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">Add Customer</button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && <ConfirmDelete name={delTarget.name} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDelTarget(null)} />}

      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers..."
                className="w-72 pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-slate-50/50 focus:bg-white" />
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/20">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users className="h-6 w-6 text-slate-300" /></div>
            <p className="text-sm font-medium text-slate-500">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Name','Email','Phone','Orders','Revenue',''].map(h => <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-[10px] font-bold text-white">{c.name.split(' ').map((n: string) => n[0]).join('')}</div>
                        <span className="font-semibold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{c.email}</td>
                    <td className="px-6 py-3.5 text-slate-500">{c.phone}</td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{c.orders}</td>
                    <td className="px-6 py-3.5 text-emerald-600 font-semibold">Rs {c.spent.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      <button onClick={() => setDelTarget(c)} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

/* ─── Products Tab ─────────────────────────────────────────────────── */
function ProductsTab({ business, toast }: any) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [delTarget, setDelTarget] = useState<any>(null)
  const [delLoading, setDelLoading] = useState(false)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', sku: '', category: '', stock_quantity: '' })

  useEffect(() => {
    if (!business) return
    setLoading(true)
    productsAPI.getAll(business.id).then(({ data }) => setProducts(data)).catch(() => {}).finally(() => setLoading(false))
  }, [business])

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    try {
      const { data } = await productsAPI.create({
        business_id: business.id, name: form.name, description: form.description || undefined,
        price: parseFloat(form.price), sku: form.sku || undefined, category: form.category || undefined,
        stock_quantity: parseInt(form.stock_quantity) || 0,
      })
      setProducts(p => [data, ...p]); setShowModal(false)
      setForm({ name: '', description: '', price: '', sku: '', category: '', stock_quantity: '' }); toast('Product added!')
    } catch (e: any) { toast(extractError(e), 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return; setDelLoading(true)
    try {
      await productsAPI.delete(delTarget.id)
      setProducts(p => p.filter(x => x.id !== delTarget.id)); toast(`${delTarget.name} deleted`); setDelTarget(null)
    } catch (e: any) { toast(extractError(e), 'error') }
    finally { setDelLoading(false) }
  }

  const stockStyle = (qty: number) =>
    qty === 0 ? { text: 'Out of Stock', cls: 'bg-red-50 text-red-700 ring-red-600/10' }
    : qty < 10 ? { text: 'Low Stock', cls: 'bg-amber-50 text-amber-700 ring-amber-600/10' }
    : { text: 'In Stock', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' }

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      {showModal && (
        <Modal title="Add Product" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Product Name *"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Premium Widget" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (Rs) *"><input className={inputCls} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></Field>
              <Field label="Stock"><input className={inputCls} type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} placeholder="0" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU"><input className={inputCls} value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="WGT-001" /></Field>
              <Field label="Category"><input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Electronics" /></Field>
            </div>
            <Field label="Description"><textarea className={inputCls + ' resize-none'} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional..." /></Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.name.trim() || !form.price}
                className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add Product
              </button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && <ConfirmDelete name={delTarget.name} loading={delLoading} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />}

      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..."
                className="w-72 pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-slate-50/50 focus:bg-white" />
            </div>
          </div>
          <button onClick={() => { if (!business) { toast('Set up your business first', 'error'); return } setShowModal(true) }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/20">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Package className="h-6 w-6 text-slate-300" /></div>
            <p className="text-sm font-medium text-slate-500">No products yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Product','SKU','Price','Stock','Status',''].map(h => <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => {
                  const s = stockStyle(p.stock_quantity)
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{p.name}</td>
                      <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">{p.sku || '—'}</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">Rs {p.price?.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">{p.stock_quantity}</td>
                      <td className="px-6 py-3.5"><span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ring-1 ring-inset ${s.cls}`}>{s.text}</span></td>
                      <td className="px-6 py-3.5"><button onClick={() => setDelTarget(p)} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

/* ─── Documents Tab ────────────────────────────────────────────────── */
function DocumentsTab({ business, toast }: any) {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [delTarget, setDelTarget] = useState<any>(null)
  const [delLoading, setDelLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!business) return
    setLoading(true)
    documentsAPI.getAll(business.id).then(({ data }) => setDocs(data)).catch(() => {}).finally(() => setLoading(false))
  }, [business])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return; setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const { data } = await documentsAPI.upload(business.id, fd)
      setDocs(d => [data, ...d]); toast(`${file.name} uploaded!`)
    } catch (err: any) { toast(extractError(err), 'error') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const handleDelete = async () => {
    if (!delTarget) return; setDelLoading(true)
    try { await documentsAPI.delete(delTarget.id); setDocs(d => d.filter(x => x.id !== delTarget.id)); toast('Deleted'); setDelTarget(null) }
    catch { toast('Failed to delete', 'error') }
    finally { setDelLoading(false) }
  }

  const typeColor: Record<string, string> = { pdf: 'bg-red-50 text-red-600', docx: 'bg-blue-50 text-blue-600', txt: 'bg-slate-100 text-slate-500', doc: 'bg-blue-50 text-blue-600' }
  const ext = (name: string) => (name || '').split('.').pop()?.toLowerCase() || 'file'

  return (
    <>
      {delTarget && <ConfirmDelete name={delTarget.file_name || 'this document'} loading={delLoading} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />}

      <div className="space-y-5">
        <div onClick={() => { if (!business) { toast('Set up your business first', 'error'); return } fileRef.current?.click() }}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group">
          <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={handleUpload} />
          {uploading ? (
            <><Loader2 className="h-10 w-10 text-indigo-400 mx-auto mb-3 animate-spin" /><p className="text-indigo-600 font-medium text-sm">Uploading...</p></>
          ) : (
            <>
              <div className="h-14 w-14 bg-slate-100 group-hover:bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Upload className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Drop files here or click to upload</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT — up to 10MB</p>
            </>
          )}
        </div>

        <Card>
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Uploaded Documents</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-indigo-400" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><FolderOpen className="h-5 w-5 text-slate-300" /></div>
              <p className="text-sm text-slate-500 font-medium">No documents yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {docs.map((d: any) => {
                const e = ext(d.file_name)
                return (
                  <div key={d.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-3.5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${typeColor[e] || 'bg-slate-100 text-slate-500'}`}>{e}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{d.file_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{d.file_size ? `${(d.file_size/1024).toFixed(1)} KB` : ''} {d.created_at ? `· ${new Date(d.created_at).toLocaleDateString()}` : ''}</p>
                      </div>
                    </div>
                    <button onClick={() => setDelTarget(d)} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

/* ─── Analytics Tab ────────────────────────────────────────────────── */
function AnalyticsTab() {
  const metrics = [
    { label: 'Messages Sent', value: '8,342', change: '+18%', pos: true, icon: MessageSquare },
    { label: 'Response Rate', value: '94.2%', change: '+3.1%', pos: true, icon: TrendingUp },
    { label: 'Avg Response Time', value: '1.4 min', change: '-12%', pos: true, icon: Headphones },
    { label: 'Unresolved', value: '23', change: '+5%', pos: false, icon: AlertCircle },
  ]
  const bars = [65, 80, 55, 90, 70, 110, 95]
  const maxBar = Math.max(...bars)
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center">
                <m.icon className="h-4 w-4 text-slate-500" />
              </div>
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${m.pos ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {m.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{m.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{m.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-900">Conversation Volume</h3>
          <span className="text-xs text-slate-400 font-medium">Last 7 days</span>
        </div>
        <div className="flex items-end gap-3 h-48">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group/bar">
              <span className="text-[11px] text-slate-400 font-medium opacity-0 group-hover/bar:opacity-100 transition-opacity">{h}</span>
              <div className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg group-hover/bar:from-indigo-600 group-hover/bar:to-indigo-500 transition-all duration-200 cursor-default"
                style={{ height: `${(h / maxBar) * 100}%` }} />
              <span className="text-[11px] text-slate-400 font-medium">{days[i]}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ─── Settings Tab ─────────────────────────────────────────────────── */
function SettingsTab({ user, business, setBusiness, toast }: any) {
  const [bizForm, setBizForm] = useState({ name: business?.name || '', description: business?.description || '', industry: business?.industry || '', phone: business?.phone || '', email: business?.email || '' })
  const [bizSaving, setBizSaving] = useState(false)

  const saveBusiness = async () => {
    if (!bizForm.name.trim()) { toast('Business name is required', 'error'); return }
    setBizSaving(true)
    try {
      if (business) { const { data } = await businessAPI.update(business.id, bizForm); setBusiness(data); toast('Updated!') }
      else { const { data } = await businessAPI.create(bizForm); setBusiness(data); toast('Created!') }
    } catch (e: any) { toast(extractError(e), 'error') }
    finally { setBizSaving(false) }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 bg-indigo-100 rounded-xl flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-indigo-600" /></div>
          <div><h3 className="text-sm font-bold text-slate-900">Business Setup</h3>{!business && <p className="text-[11px] text-amber-600 font-medium">Required to use the platform</p>}</div>
        </div>
        <div className="space-y-4">
          <Field label="Business Name *"><input className={inputCls} value={bizForm.name} onChange={e => setBizForm(f => ({ ...f, name: e.target.value }))} placeholder="My Store" /></Field>
          <Field label="Industry"><input className={inputCls} value={bizForm.industry} onChange={e => setBizForm(f => ({ ...f, industry: e.target.value }))} placeholder="E-commerce, Retail..." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input className={inputCls} value={bizForm.phone} onChange={e => setBizForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300 0000000" /></Field>
            <Field label="Email"><input className={inputCls} type="email" value={bizForm.email} onChange={e => setBizForm(f => ({ ...f, email: e.target.value }))} placeholder="biz@email.com" /></Field>
          </div>
          <Field label="Description"><textarea className={inputCls + ' resize-none'} rows={2} value={bizForm.description} onChange={e => setBizForm(f => ({ ...f, description: e.target.value }))} placeholder="What does your business do?" /></Field>
          <button onClick={saveBusiness} disabled={bizSaving}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-indigo-600/20">
            {bizSaving && <Loader2 className="h-4 w-4 animate-spin" />} {business ? 'Update' : 'Create'} Business
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 bg-violet-100 rounded-xl flex items-center justify-center"><Users className="h-4 w-4 text-violet-600" /></div>
          <h3 className="text-sm font-bold text-slate-900">Profile</h3>
        </div>
        <div className="space-y-4">
          <Field label="Full Name"><input defaultValue={user?.full_name || ''} className={inputCls} /></Field>
          <Field label="Email"><input defaultValue={user?.email || ''} disabled className={inputCls + ' bg-slate-50 text-slate-400 cursor-not-allowed'} /></Field>
          <button className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition shadow-sm shadow-violet-600/20">Save Changes</button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 bg-amber-100 rounded-xl flex items-center justify-center"><Bell className="h-4 w-4 text-amber-600" /></div>
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
        </div>
        {['New chat message','Order updates','Weekly report'].map(item => (
          <div key={item} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-700">{item}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-[22px] bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[18px]" />
            </label>
          </div>
        ))}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 bg-emerald-100 rounded-xl flex items-center justify-center"><Lock className="h-4 w-4 text-emerald-600" /></div>
          <h3 className="text-sm font-bold text-slate-900">Security</h3>
        </div>
        <div className="space-y-4">
          <Field label="Current Password"><input type="password" className={inputCls} placeholder="Enter current password" /></Field>
          <Field label="New Password"><input type="password" className={inputCls} placeholder="Enter new password" /></Field>
          <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20">Update Password</button>
        </div>
      </Card>
    </div>
  )
}
