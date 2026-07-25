'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, TrendingUp, Users, ShoppingBag, FileText,
  Settings, BarChart3, LogOut, Search, Plus, Upload, Bell,
  Lock, Trash2, X, CheckCircle, AlertCircle, Loader2, Edit2,
  ChevronDown, LayoutDashboard, Headphones, Package, FolderOpen,
  BarChart, LogOutIcon,
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
    ['analytics', 'Analytics', BarChart],
    ['settings', 'Settings', Settings],
  ]

  const sharedProps = { business, toast }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-in slide-in-from-right-5 ${
            t.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
            {t.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-20 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">AI Sales Agent</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map(([tab, label, Icon]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-100">
          <div className="px-3 py-2 mb-1">
            {user && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">
                  {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOutIcon className="h-4.5 w-4.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 capitalize">{activeTab === 'overview' ? 'Dashboard' : activeTab}</h1>
              {business && <p className="text-sm text-slate-400 mt-0.5">{business.name}</p>}
            </div>
            {!bizLoading && !business && activeTab !== 'settings' && (
              <button
                onClick={() => setActiveTab('settings')}
                className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition"
              >
                Set up your business in Settings
              </button>
            )}
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview'   && <OverviewTab {...sharedProps} />}
          {activeTab === 'chats'      && <ChatsTab {...sharedProps} />}
          {activeTab === 'customers'  && <CustomersTab {...sharedProps} />}
          {activeTab === 'products'   && <ProductsTab {...sharedProps} />}
          {activeTab === 'documents'  && <DocumentsTab {...sharedProps} />}
          {activeTab === 'analytics'  && <AnalyticsTab />}
          {activeTab === 'settings'   && <SettingsTab user={user} business={business} setBusiness={setBusiness} toast={toast} />}
        </div>
      </main>
    </div>
  )
}

/* ─── Modal ──────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 focus:bg-white"

function ConfirmDelete({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }) {
  return (
    <Modal title="Delete" onClose={onCancel}>
      <p className="text-slate-500 text-sm mb-6">
        Are you sure you want to delete <span className="font-semibold text-slate-900">{name}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Delete
        </button>
      </div>
    </Modal>
  )
}

/* ─── Overview Tab ─────────────────────────────────────────────────── */
function OverviewTab({ business }: any) {
  const stats = [
    { label: 'Conversations', value: '1,234', icon: MessageSquare, change: '+12%', color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Leads', value: '56', icon: Users, change: '+8%', color: 'bg-violet-50 text-violet-600' },
    { label: 'Orders', value: '89', icon: ShoppingBag, change: '+23%', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Satisfaction', value: '95%', icon: TrendingUp, change: '+2%', color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{s.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{s.value}</h3>
            <p className="text-sm text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Recent Conversations</h2>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-700 text-xs font-bold">C{i}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Customer {i}</p>
                  <p className="text-xs text-slate-400">Last message: {i} hour{i > 1 ? 's' : ''} ago</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">Active</span>
            </div>
          ))}
        </div>
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
        business_id: business.id,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone || undefined,
        customer_email: form.customer_email || undefined,
      })
      setChats(c => [data, ...c])
      setShowModal(false)
      setForm({ customer_name: '', customer_phone: '', customer_email: '' })
      toast('Chat created!')
    } catch (e: any) {
      toast(extractError(e), 'error')
    } finally { setSaving(false) }
  }

  const filtered = chats.filter(c => (c.customer_name || '').toLowerCase().includes(q.toLowerCase()))

  const statusStyle: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-600',
    pending: 'bg-amber-50 text-amber-600',
    resolved: 'bg-slate-100 text-slate-500',
    handed_over: 'bg-violet-50 text-violet-600',
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-slate-50 focus:bg-white" />
          </div>
          <button onClick={() => { if (!business) { toast('Set up your business in Settings first', 'error'); return } setShowModal(true) }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Headphones className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No chats yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {(c.customer_name || 'C').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.customer_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{c.customer_email || c.customer_phone || 'No contact info'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${statusStyle[c.status] || 'bg-slate-100 text-slate-500'}`}>
                  {c.status || 'active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ─── Customers Tab ────────────────────────────────────────────────── */
function CustomersTab({ toast }: any) {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Ahmed Khan', email: 'ahmed@email.com', phone: '+92 300 1111111', orders: 5, spent: 'Rs 12,500' },
    { id: 2, name: 'Sara Malik', email: 'sara@email.com', phone: '+92 300 2222222', orders: 3, spent: 'Rs 7,200' },
    { id: 3, name: 'Bilal Raza', email: 'bilal@email.com', phone: '+92 300 3333333', orders: 8, spent: 'Rs 24,000' },
    { id: 4, name: 'Hina Javed', email: 'hina@email.com', phone: '+92 300 4444444', orders: 1, spent: 'Rs 1,800' },
    { id: 5, name: 'Usman Tariq', email: 'usman@email.com', phone: '+92 300 5555555', orders: 12, spent: 'Rs 45,600' },
  ])
  const [showModal, setShowModal] = useState(false)
  const [delTarget, setDelTarget] = useState<any>(null)
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const nextId = useRef(100)

  const handleAdd = () => {
    if (!form.name.trim()) return
    setCustomers(c => [{ id: nextId.current++, ...form, orders: 0, spent: 'Rs 0' }, ...c])
    setShowModal(false)
    setForm({ name: '', email: '', phone: '' })
    toast('Customer added!')
  }

  const handleDelete = (c: any) => {
    setCustomers(cs => cs.filter(x => x.id !== c.id))
    setDelTarget(null)
    toast(`${c.name} removed`)
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      {showModal && (
        <Modal title="Add Customer" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Full Name *">
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ahmed Khan" />
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ahmed@email.com" />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300 0000000" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name.trim()}
                className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">Add Customer</button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && (
        <ConfirmDelete name={delTarget.name} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDelTarget(null)} />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-slate-50 focus:bg-white" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><Users className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No customers found</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-100">
              <tr>
                {['Name','Email','Phone','Orders','Spent',''].map(h => <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3.5 font-medium text-slate-900">{c.name}</td>
                  <td className="px-6 py-3.5 text-slate-500">{c.email}</td>
                  <td className="px-6 py-3.5 text-slate-500">{c.phone}</td>
                  <td className="px-6 py-3.5 text-slate-700">{c.orders}</td>
                  <td className="px-6 py-3.5 text-emerald-600 font-medium">{c.spent}</td>
                  <td className="px-6 py-3.5">
                    <button onClick={() => setDelTarget(c)} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
        business_id: business.id,
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        sku: form.sku || undefined,
        category: form.category || undefined,
        stock_quantity: parseInt(form.stock_quantity) || 0,
      })
      setProducts(p => [data, ...p])
      setShowModal(false)
      setForm({ name: '', description: '', price: '', sku: '', category: '', stock_quantity: '' })
      toast('Product added!')
    } catch (e: any) {
      toast(extractError(e), 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    setDelLoading(true)
    try {
      await productsAPI.delete(delTarget.id)
      setProducts(p => p.filter(x => x.id !== delTarget.id))
      toast(`${delTarget.name} deleted`)
      setDelTarget(null)
    } catch (e: any) {
      toast(extractError(e), 'error')
    } finally { setDelLoading(false) }
  }

  const stockStyle = (qty: number) =>
    qty === 0 ? { text: 'Out of Stock', cls: 'bg-red-50 text-red-600' }
    : qty < 10 ? { text: 'Low Stock', cls: 'bg-amber-50 text-amber-600' }
    : { text: 'In Stock', cls: 'bg-emerald-50 text-emerald-600' }

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      {showModal && (
        <Modal title="Add Product" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Product Name *">
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Premium Widget" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (Rs) *">
                <input className={inputCls} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </Field>
              <Field label="Stock">
                <input className={inputCls} type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} placeholder="0" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU">
                <input className={inputCls} value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="WGT-001" />
              </Field>
              <Field label="Category">
                <input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Electronics" />
              </Field>
            </div>
            <Field label="Description">
              <textarea className={inputCls + ' resize-none'} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional..." />
            </Field>
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
      {delTarget && (
        <ConfirmDelete name={delTarget.name} loading={delLoading} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-slate-50 focus:bg-white" />
          </div>
          <button onClick={() => { if (!business) { toast('Set up your business in Settings first', 'error'); return } setShowModal(true) }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><Package className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No products yet</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-100">
              <tr>
                {['Product','SKU','Price','Stock','Status',''].map(h => <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => {
                const s = stockStyle(p.stock_quantity)
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{p.name}</td>
                    <td className="px-6 py-3.5 text-slate-500">{p.sku || '—'}</td>
                    <td className="px-6 py-3.5 text-slate-700">Rs {p.price?.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-700">{p.stock_quantity}</td>
                    <td className="px-6 py-3.5"><span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${s.cls}`}>{s.text}</span></td>
                    <td className="px-6 py-3.5">
                      <button onClick={() => setDelTarget(p)} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
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
    if (!file || !business) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await documentsAPI.upload(business.id, fd)
      setDocs(d => [data, ...d])
      toast(`${file.name} uploaded!`)
    } catch (err: any) {
      toast(extractError(err), 'error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    setDelLoading(true)
    try {
      await documentsAPI.delete(delTarget.id)
      setDocs(d => d.filter(x => x.id !== delTarget.id))
      toast(`${delTarget.file_name || 'Document'} deleted`)
      setDelTarget(null)
    } catch {
      toast('Failed to delete', 'error')
    } finally { setDelLoading(false) }
  }

  const typeColor: Record<string, string> = {
    pdf: 'bg-red-50 text-red-600', docx: 'bg-blue-50 text-blue-600',
    txt: 'bg-slate-100 text-slate-500', doc: 'bg-blue-50 text-blue-600',
  }
  const ext = (name: string) => (name || '').split('.').pop()?.toLowerCase() || 'file'

  return (
    <>
      {delTarget && (
        <ConfirmDelete name={delTarget.file_name || 'this document'} loading={delLoading} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />
      )}

      <div className="space-y-5">
        <div
          onClick={() => { if (!business) { toast('Set up your business in Settings first', 'error'); return } fileRef.current?.click() }}
          className="border-2 border-dashed border-indigo-200 rounded-2xl p-10 text-center bg-indigo-50/50 hover:bg-indigo-50 transition cursor-pointer group"
        >
          <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={handleUpload} />
          {uploading ? (
            <><Loader2 className="h-9 w-9 text-indigo-400 mx-auto mb-3 animate-spin" /><p className="text-indigo-600 font-medium text-sm">Uploading...</p></>
          ) : (
            <>
              <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition">
                <Upload className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-indigo-700 font-semibold text-sm">Drop files here or click to upload</p>
              <p className="text-xs text-indigo-400 mt-1">PDF, DOCX, TXT — max 10MB</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Uploaded Documents</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-indigo-500" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><FolderOpen className="h-9 w-9 mx-auto mb-3 opacity-30" /><p className="text-sm">No documents yet</p></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {docs.map((d: any) => {
                const e = ext(d.file_name)
                return (
                  <div key={d.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase ${typeColor[e] || 'bg-slate-100 text-slate-500'}`}>{e}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{d.file_name}</p>
                        <p className="text-xs text-slate-400">{d.file_size ? `${(d.file_size/1024).toFixed(1)} KB` : ''} {d.created_at ? `· ${new Date(d.created_at).toLocaleDateString()}` : ''}</p>
                      </div>
                    </div>
                    <button onClick={() => setDelTarget(d)} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ─── Analytics Tab ────────────────────────────────────────────────── */
function AnalyticsTab() {
  const metrics = [
    { label: 'Messages Sent', value: '8,342', change: '+18%', pos: true },
    { label: 'Response Rate', value: '94.2%', change: '+3%', pos: true },
    { label: 'Avg Response Time', value: '1.4 min', change: '-12%', pos: true },
    { label: 'Unresolved Chats', value: '23', change: '+5%', pos: false },
  ]
  const bars = [65, 80, 55, 90, 70, 110, 95]
  const maxBar = Math.max(...bars)
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{m.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{m.value}</p>
            <p className={`text-xs mt-2 font-semibold ${m.pos ? 'text-emerald-600' : 'text-red-500'}`}>{m.change} this month</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-6">Conversation Volume — Last 7 Days</h2>
        <div className="flex items-end gap-3 h-44">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-xs text-slate-400 font-medium">{h}</span>
              <div className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg hover:from-indigo-600 hover:to-indigo-500 transition-all duration-200"
                style={{ height: `${(h / maxBar) * 100}%` }} />
              <span className="text-xs text-slate-400">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
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
      if (business) {
        const { data } = await businessAPI.update(business.id, bizForm)
        setBusiness(data)
        toast('Business updated!')
      } else {
        const { data } = await businessAPI.create(bizForm)
        setBusiness(data)
        toast('Business created!')
      }
    } catch (e: any) {
      toast(extractError(e), 'error')
    } finally { setBizSaving(false) }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 bg-indigo-100 rounded-xl flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Business Setup</h2>
            {!business && <span className="text-xs text-amber-600">Required</span>}
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Business Name *">
            <input className={inputCls} value={bizForm.name} onChange={e => setBizForm(f => ({ ...f, name: e.target.value }))} placeholder="My Awesome Store" />
          </Field>
          <Field label="Industry">
            <input className={inputCls} value={bizForm.industry} onChange={e => setBizForm(f => ({ ...f, industry: e.target.value }))} placeholder="E-commerce, Retail, Food..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input className={inputCls} value={bizForm.phone} onChange={e => setBizForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300 0000000" />
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" value={bizForm.email} onChange={e => setBizForm(f => ({ ...f, email: e.target.value }))} placeholder="business@email.com" />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={inputCls + ' resize-none'} rows={2} value={bizForm.description} onChange={e => setBizForm(f => ({ ...f, description: e.target.value }))} placeholder="What does your business do?" />
          </Field>
          <button onClick={saveBusiness} disabled={bizSaving}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
            {bizSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {business ? 'Update Business' : 'Create Business'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 bg-violet-100 rounded-xl flex items-center justify-center">
            <Users className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Profile</h2>
        </div>
        <div className="space-y-4">
          <Field label="Full Name"><input defaultValue={user?.full_name || ''} className={inputCls} /></Field>
          <Field label="Email"><input defaultValue={user?.email || ''} disabled className={inputCls + ' bg-slate-50 text-slate-400 cursor-not-allowed'} /></Field>
          <button className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition">Save Changes</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 bg-amber-100 rounded-xl flex items-center justify-center">
            <Bell className="h-4 w-4 text-amber-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
        </div>
        {['New chat message','Order updates','Weekly report'].map(item => (
          <div key={item} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-700">{item}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5.5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Security</h2>
        </div>
        <div className="space-y-4">
          <Field label="Current Password"><input type="password" className={inputCls} placeholder="Enter current password" /></Field>
          <Field label="New Password"><input type="password" className={inputCls} placeholder="Enter new password" /></Field>
          <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition">Update Password</button>
        </div>
      </div>
    </div>
  )
}
