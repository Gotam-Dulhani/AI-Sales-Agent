'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, TrendingUp, Users, ShoppingBag, FileText,
  Settings, BarChart3, LogOut, Search, Plus, Upload, Bell,
  Lock, Trash2, X, CheckCircle, AlertCircle, Loader2, Edit2,
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

/* ─── Toast ────────────────────────────────────────────────────────── */
interface Toast { id: number; msg: string; type: 'success' | 'error' }

/* ─── Main Dashboard ───────────────────────────────────────────────── */
export default function DashboardPage() {
  const [activeTab, setActiveTab]     = useState<Tab>('overview')
  const [toasts, setToasts]           = useState<Toast[]>([])
  const [business, setBusiness]       = useState<any>(null)
  const [bizLoading, setBizLoading]   = useState(true)
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
    // Load or create business
    businessAPI.getAll().then(({ data }) => {
      if (data.length > 0) {
        setBusiness(data[0])
      }
    }).catch(() => {}).finally(() => setBizLoading(false))
  }, [isAuthenticated, router])

  const handleLogout = () => { logout(); router.push('/login') }

  if (!isAuthenticated) return null

  const tabTitles: Record<Tab, string> = {
    overview: 'Dashboard', chats: 'Chats', customers: 'Customers',
    products: 'Products', documents: 'Documents', analytics: 'Analytics', settings: 'Settings',
  }

  const sharedProps = { business, toast }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            t.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {t.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AI Sales Agent</span>
          </div>
          {user && <p className="text-sm text-gray-500 mt-2 truncate">{user.email}</p>}
          {business && <p className="text-xs text-blue-600 mt-1 font-medium truncate">📦 {business.name}</p>}
        </div>
        <nav className="px-4 space-y-1">
          {([
            ['overview','Overview',BarChart3],['chats','Chats',MessageSquare],
            ['customers','Customers',Users],['products','Products',ShoppingBag],
            ['documents','Documents',FileText],['analytics','Analytics',TrendingUp],
            ['settings','Settings',Settings],
          ] as [Tab, string, any][]).map(([tab, label, Icon]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition ${
                activeTab === tab ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <Icon className="h-5 w-5" /><span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition">
            <LogOut className="h-5 w-5" /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{tabTitles[activeTab]}</h1>
          {!bizLoading && !business && activeTab !== 'settings' && (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              ⚠ Set up your business in <button onClick={() => setActiveTab('settings')} className="underline font-semibold">Settings</button> first
            </div>
          )}
        </div>

        {activeTab === 'overview'   && <OverviewTab {...sharedProps} />}
        {activeTab === 'chats'      && <ChatsTab {...sharedProps} />}
        {activeTab === 'customers'  && <CustomersTab {...sharedProps} />}
        {activeTab === 'products'   && <ProductsTab {...sharedProps} />}
        {activeTab === 'documents'  && <DocumentsTab {...sharedProps} />}
        {activeTab === 'analytics'  && <AnalyticsTab />}
        {activeTab === 'settings'   && <SettingsTab user={user} business={business} setBusiness={setBusiness} toast={toast} />}
      </main>
    </div>
  )
}

/* ─── Modal Wrapper ────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─── Field Helper ─────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

/* ─── Delete Confirm Dialog ────────────────────────────────────────── */
function ConfirmDelete({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel}>
      <p className="text-gray-600 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-900">{name}</span>? This cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
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
    { label: 'Total Conversations', value: '1,234', icon: MessageSquare, change: '+12%' },
    { label: 'Active Leads',        value: '56',    icon: Users,          change: '+8%' },
    { label: 'Orders This Month',   value: '89',    icon: ShoppingBag,    change: '+23%' },
    { label: 'Customer Satisfaction', value: '95%', icon: TrendingUp,     change: '+2%' },
  ]
  return (
    <>
      <p className="text-gray-600 -mt-4 mb-6">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <s.icon className="h-8 w-8 text-blue-600" />
              <span className="text-green-600 text-sm font-medium">{s.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{s.value}</h3>
            <p className="text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Conversations</h2>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Customer {i}</p>
                  <p className="text-sm text-gray-500">Last message: {i} hour{i > 1 ? 's' : ''} ago</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ─── Chats Tab ────────────────────────────────────────────────────── */
function ChatsTab({ business, toast }: any) {
  const [chats, setChats]       = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [delTarget, setDelTarget] = useState<any>(null)
  const [delLoading, setDelLoading] = useState(false)
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!business) return
    setLoading(true)
    chatAPI.getChats(business.id).then(({ data }) => setChats(data)).catch(() => {}).finally(() => setLoading(false))
  }, [business])

  const extractError = (e: any): string => {
    const detail = e?.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(', ')
    if (detail?.msg) return detail.msg
    return 'An error occurred'
  }

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
      toast('Chat created successfully!')
    } catch (e: any) {
      toast(extractError(e), 'error')
    } finally { setSaving(false) }
  }

  const filtered = chats.filter(c =>
    (c.customer_name || '').toLowerCase().includes(q.toLowerCase())
  )

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-gray-100 text-gray-600',
    handed_over: 'bg-purple-100 text-purple-700',
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
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.customer_name.trim()}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create Chat
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search chats..." className="pl-9 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => { if (!business) { toast('Please set up your business in Settings first', 'error'); return } setShowModal(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No chats yet. Click <strong>New Chat</strong> to start.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {(c.customer_name || 'C').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.customer_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{c.customer_email || c.customer_phone || 'No contact info'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>
                    {c.status || 'active'}
                  </span>
                </div>
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
    { id: 1, name: 'Ahmed Khan',  email: 'ahmed@email.com',  phone: '+92 300 1111111', orders: 5,  spent: 'Rs 12,500' },
    { id: 2, name: 'Sara Malik',  email: 'sara@email.com',   phone: '+92 300 2222222', orders: 3,  spent: 'Rs 7,200'  },
    { id: 3, name: 'Bilal Raza',  email: 'bilal@email.com',  phone: '+92 300 3333333', orders: 8,  spent: 'Rs 24,000' },
    { id: 4, name: 'Hina Javed',  email: 'hina@email.com',   phone: '+92 300 4444444', orders: 1,  spent: 'Rs 1,800'  },
    { id: 5, name: 'Usman Tariq', email: 'usman@email.com',  phone: '+92 300 5555555', orders: 12, spent: 'Rs 45,600' },
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
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name.trim()}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">Add Customer</button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && (
        <ConfirmDelete name={delTarget.name} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDelTarget(null)} />
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers..." className="pl-9 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><Users className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No customers found.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['Name','Email','Phone','Orders','Total Spent',''].map(h => <th key={h} className="px-6 py-3 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 text-gray-500">{c.phone}</td>
                  <td className="px-6 py-4 text-gray-700">{c.orders}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{c.spent}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setDelTarget(c)} className="text-red-400 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
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
  const [products, setProducts]   = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
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

  const stockLabel = (qty: number) =>
    qty === 0 ? { text: 'Out of Stock', cls: 'bg-red-100 text-red-600' }
    : qty < 10 ? { text: 'Low Stock',   cls: 'bg-yellow-100 text-yellow-700' }
    :             { text: 'In Stock',    cls: 'bg-green-100 text-green-700' }

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      {showModal && (
        <Modal title="Add Product" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Product Name *">
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Widget" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (Rs) *">
                <input className={inputCls} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </Field>
              <Field label="Stock Qty">
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
              <textarea className={inputCls + ' resize-none'} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.name.trim() || !form.price}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add Product
              </button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && (
        <ConfirmDelete name={delTarget.name} loading={delLoading} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="pl-9 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => { if (!business) { toast('Please set up your business in Settings first', 'error'); return } setShowModal(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No products yet. Click <strong>Add Product</strong> to get started.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['Product','SKU','Price','Stock','Status',''].map(h => <th key={h} className="px-6 py-3 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(p => {
                const s = stockLabel(p.stock_quantity)
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-gray-500">{p.sku || '—'}</td>
                    <td className="px-6 py-4 text-gray-700">Rs {p.price?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-700">{p.stock_quantity}</td>
                    <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${s.cls}`}>{s.text}</span></td>
                    <td className="px-6 py-4">
                      <button onClick={() => setDelTarget(p)} className="text-red-400 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
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
  const [docs, setDocs]           = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
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
    pdf: 'bg-red-100 text-red-600', docx: 'bg-blue-100 text-blue-600',
    txt: 'bg-gray-100 text-gray-600', doc: 'bg-blue-100 text-blue-600',
  }
  const ext = (name: string) => (name || '').split('.').pop()?.toLowerCase() || 'file'

  return (
    <>
      {delTarget && (
        <ConfirmDelete name={delTarget.file_name || 'this document'} loading={delLoading} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />
      )}

      <div className="space-y-4">
        {/* Upload area */}
        <div
          onClick={() => { if (!business) { toast('Set up your business in Settings first', 'error'); return } fileRef.current?.click() }}
          className="border-2 border-dashed border-blue-300 rounded-xl p-10 text-center bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
        >
          <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={handleUpload} />
          {uploading ? (
            <><Loader2 className="h-10 w-10 text-blue-400 mx-auto mb-3 animate-spin" /><p className="text-blue-600 font-medium">Uploading...</p></>
          ) : (
            <><Upload className="h-10 w-10 text-blue-400 mx-auto mb-3" /><p className="text-blue-700 font-semibold">Drop files here or click to upload</p><p className="text-sm text-blue-500 mt-1">Supports PDF, DOCX, TXT — max 10MB</p></>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b"><h2 className="font-semibold text-gray-800">Uploaded Documents</h2></div>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center py-10 text-gray-400"><FileText className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No documents uploaded yet.</p></div>
          ) : (
            <div className="divide-y">
              {docs.map((d: any) => {
                const e = ext(d.file_name)
                return (
                  <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${typeColor[e] || 'bg-gray-100 text-gray-500'}`}>{e}</span>
                      <div>
                        <p className="font-medium text-gray-900">{d.file_name}</p>
                        <p className="text-xs text-gray-400">{d.file_size ? `${(d.file_size/1024).toFixed(1)} KB` : ''} · {d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <button onClick={() => setDelTarget(d)} className="text-red-400 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
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
    { label: 'Messages Sent',     value: '8,342',   change: '+18%', pos: true },
    { label: 'Response Rate',     value: '94.2%',   change: '+3%',  pos: true },
    { label: 'Avg Response Time', value: '1.4 min', change: '-12%', pos: true },
    { label: 'Unresolved Chats',  value: '23',      change: '+5%',  pos: false },
  ]
  const bars = [65, 80, 55, 90, 70, 110, 95]
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-xl shadow-md p-5">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{m.value}</p>
            <p className={`text-sm mt-1 font-medium ${m.pos ? 'text-green-600' : 'text-red-500'}`}>{m.change} this month</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-semibold text-gray-800 mb-6">Conversation Volume (last 7 days)</h2>
        <div className="flex items-end gap-3 h-40">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all duration-200" style={{ height: `${h}%` }} />
              <span className="text-xs text-gray-400">{days[i]}</span>
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
    <div className="space-y-6 max-w-2xl">
      {/* Business Setup */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-blue-600" /></div>
          <h2 className="font-semibold text-gray-800">Business Setup</h2>
          {!business && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Required</span>}
        </div>
        <div className="space-y-3">
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
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
            {bizSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {business ? 'Update Business' : 'Create Business'}
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center"><Users className="h-4 w-4 text-purple-600" /></div>
          <h2 className="font-semibold text-gray-800">Profile</h2>
        </div>
        <div className="space-y-3">
          <Field label="Full Name"><input defaultValue={user?.full_name || ''} className={inputCls} /></Field>
          <Field label="Email"><input defaultValue={user?.email || ''} disabled className={inputCls + ' bg-gray-50 text-gray-400 cursor-not-allowed'} /></Field>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">Save Changes</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center"><Bell className="h-4 w-4 text-yellow-600" /></div>
          <h2 className="font-semibold text-gray-800">Notifications</h2>
        </div>
        {['New chat message','Order updates','Weekly report'].map(item => (
          <div key={item} className="flex items-center justify-between py-3 border-b last:border-0">
            <span className="text-sm text-gray-700">{item}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center"><Lock className="h-4 w-4 text-green-600" /></div>
          <h2 className="font-semibold text-gray-800">Security</h2>
        </div>
        <div className="space-y-3">
          <Field label="Current Password"><input type="password" className={inputCls} placeholder="••••••••" /></Field>
          <Field label="New Password"><input type="password" className={inputCls} placeholder="••••••••" /></Field>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">Update Password</button>
        </div>
      </div>
    </div>
  )
}
