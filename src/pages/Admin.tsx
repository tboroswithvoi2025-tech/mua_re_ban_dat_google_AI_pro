import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard, Package, Users, Building2, FileText, Settings,
  TrendingUp, ShoppingCart, Clock, CheckCircle2, DollarSign, Loader2,
  Search, Eye, Check, X, PlayCircle, XCircle, AlertCircle, Sparkles,
  Plus, Pencil, Trash2, Save, MessageCircle, Facebook,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus, Product, PaymentMethod, Profile, SiteSettings, OrderEvent } from '@/types'
import {
  formatVND, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  BADGE_LABELS, STOCK_LABELS,
} from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Tab = 'overview' | 'orders' | 'products' | 'customers' | 'bank' | 'policy' | 'contact'

export default function Admin() {
  const { user, role, loading, signInWithGoogle } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-6 h-6 text-mystic-400 animate-spin" /></div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <Sparkles className="w-12 h-12 text-mystic-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Đăng nhập Admin</h2>
          <p className="text-gray-400 text-sm mb-6">Vui lòng đăng nhập bằng Google</p>
          <button onClick={signInWithGoogle} className="btn-primary w-full">Đăng nhập Google</button>
        </div>
      </div>
    )
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-400 text-sm">Tài khoản của bạn không có quyền Admin. Vui lòng liên hệ quản trị viên.</p>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'bank', label: 'Ngân hàng', icon: Building2 },
    { id: 'policy', label: 'Chính sách', icon: FileText },
    { id: 'contact', label: 'Liên hệ', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-7 h-7 text-gold-400" />
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-mystic-500/30 text-mystic-200 border border-mystic-400/40'
                  : 'bg-night-800/40 text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'customers' && <CustomersTab />}
        {tab === 'bank' && <BankTab />}
        {tab === 'policy' && <PolicyTab />}
        {tab === 'contact' && <ContactTab />}
      </div>
    </div>
  )
}

// ============================================================
// Overview Tab
// ============================================================
function OverviewTab() {
  const [stats, setStats] = useState({
    customers: 0, orders: 0, pending: 0, verified: 0, processing: 0, completed: 0, revenue: 0,
  })
  const [chartData, setChartData] = useState<{ date: string; revenue: number; orders: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { count: customers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
      const { count: pending } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('order_status', ['PENDING_PAYMENT', 'CUSTOMER_REPORTED_PAID'])
      const { count: verified } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PAYMENT_VERIFIED')
      const { count: processing } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PROCESSING')
      const { count: completed } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'COMPLETED')

      // Revenue from verified + completed
      const { data: revData } = await supabase
        .from('orders')
        .select('total_amount')
        .in('order_status', ['PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED'])
      const revenue = (revData ?? []).reduce((sum, o) => sum + (o.total_amount || 0), 0)

      // Chart data: last 7 days
      const days: { date: string; revenue: number; orders: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        days.push({ date: dateStr.substring(5), revenue: 0, orders: 0 })
      }
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('total_amount, order_status, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      ;(recentOrders ?? []).forEach((o) => {
        const dateStr = (o.created_at as string).substring(5, 10)
        const day = days.find((d) => d.date === dateStr)
        if (day) {
          day.orders += 1
          if (['PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED'].includes(o.order_status)) {
            day.revenue += o.total_amount || 0
          }
        }
      })

      setStats({ customers: customers ?? 0, orders: orders ?? 0, pending: pending ?? 0, verified: verified ?? 0, processing: processing ?? 0, completed: completed ?? 0, revenue })
      setChartData(days)
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="text-mystic-300 animate-pulse">Đang tải...</div>

  const cards = [
    { label: 'Khách hàng', value: stats.customers, icon: Users, color: 'text-abyss-300' },
    { label: 'Tổng đơn hàng', value: stats.orders, icon: ShoppingCart, color: 'text-mystic-300' },
    { label: 'Chờ xác nhận', value: stats.pending, icon: Clock, color: 'text-amber-300' },
    { label: 'Đã thanh toán', value: stats.verified, icon: CheckCircle2, color: 'text-emerald-300' },
    { label: 'Đang xử lý', value: stats.processing, icon: PlayCircle, color: 'text-mystic-300' },
    { label: 'Hoàn thành', value: stats.completed, icon: Check, color: 'text-green-300' },
    { label: 'Doanh thu đã xác nhận', value: formatVND(stats.revenue), icon: DollarSign, color: 'text-gold-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon className={`w-4 h-4 ${c.color}`} />
              <span className="text-xs text-gray-400">{c.label}</span>
            </div>
            <div className={`font-display text-xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-mystic-400" /> Thống kê 7 ngày gần nhất
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111126', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px' }}
              labelStyle={{ color: '#e5e7eb' }}
            />
            <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Đơn hàng" />
            <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Doanh thu (VND)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============================================================
// Orders Tab
// ============================================================
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [events, setEvents] = useState<OrderEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [note, setNote] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filter !== 'ALL') {
      query = query.eq('order_status', filter as OrderStatus)
    }
    if (search) {
      query = query.or(`order_code.ilike.%${search}%,customer_code.ilike.%${search}%,target_email.ilike.%${search}%`)
    }
    const { data } = await query.limit(100)
    setOrders((data as Order[]) ?? [])
    setLoading(false)
  }, [filter, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders])

  const selectOrder = async (order: Order) => {
    setSelected(order)
    const { data } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
    setEvents((data as OrderEvent[]) ?? [])
  }

  const doAction = async (action: string, orderId: string) => {
    setActionLoading(true)
    try {
      if (action === 'verify') {
        await supabase.rpc('verify_payment', { p_order_id: orderId, p_admin_note: note || null })
      } else if (action === 'reject') {
        await supabase.rpc('reject_payment', { p_order_id: orderId, p_admin_note: note || null })
      } else if (action === 'process') {
        await supabase.rpc('update_order_status', { p_order_id: orderId, p_new_status: 'PROCESSING', p_note: note || null })
      } else if (action === 'complete') {
        await supabase.rpc('update_order_status', { p_order_id: orderId, p_new_status: 'COMPLETED', p_note: note || null })
      } else if (action === 'cancel') {
        await supabase.rpc('update_order_status', { p_order_id: orderId, p_new_status: 'CANCELLED', p_note: note || null })
      } else if (action === 'refund') {
        await supabase.rpc('update_order_status', { p_order_id: orderId, p_new_status: 'REFUNDED', p_note: note || null })
      }
      setNote('')
      await fetchOrders()
      if (selected) await selectOrder({ ...selected, order_status: 'COMPLETED' })
      if (selected) {
        const { data: updated } = await supabase.from('orders').select('*').eq('id', selected.id).maybeSingle()
        if (updated) setSelected(updated as Order)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const filters = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
    { value: 'CUSTOMER_REPORTED_PAID', label: 'Khách báo đã thanh toán' },
    { value: 'PAYMENT_VERIFIED', label: 'Đã thanh toán' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
  ]

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, mã KH, email..."
            className="input-field pl-10"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field sm:w-56">
          {filters.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="text-mystic-300 animate-pulse">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-gray-500 text-sm">Không có đơn hàng</div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-base font-bold">{order.product_name_snapshot}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${ORDER_STATUS_COLORS[order.order_status]}`}>
                    {ORDER_STATUS_LABELS[order.order_status]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <span className="font-mono text-gold-300 font-bold">#{order.order_code}</span>
                  <span>Mã KH: {order.customer_code}</span>
                  <span>{formatDate(order.created_at)}</span>
                  {order.target_email && <span className="text-white font-medium">Gmail: {order.target_email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gold-300 font-bold text-base sm:text-lg">{formatVND(order.total_amount)}</div>
                <button onClick={() => selectOrder(order)} className="btn-outline px-3.5 py-2 text-sm font-semibold">
                  <Eye className="w-4 h-4" /> Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-night-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelected(null)}>
          <div className="glass-card rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-mystic-500/15 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">Chi tiết đơn hàng</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-base">
                <div><div className="text-sm font-semibold text-mystic-300">Mã đơn hàng</div><div className="text-gold-300 font-mono font-bold text-lg">{selected.order_code}</div></div>
                <div><div className="text-sm font-semibold text-mystic-300">Mã khách hàng</div><div className="text-white font-mono text-base">{selected.customer_code}</div></div>
                <div className="col-span-2"><div className="text-sm font-semibold text-mystic-300">Sản phẩm</div><div className="text-white font-bold text-lg">{selected.product_name_snapshot}</div></div>
                <div><div className="text-sm font-semibold text-mystic-300">Tổng tiền</div><div className="text-gold-300 font-bold text-xl">{formatVND(selected.total_amount)}</div></div>
                <div><div className="text-sm font-semibold text-mystic-300">Trạng thái</div><span className={`text-xs sm:text-sm px-3 py-1 rounded-full border font-bold ${ORDER_STATUS_COLORS[selected.order_status]}`}>{ORDER_STATUS_LABELS[selected.order_status]}</span></div>
                {selected.target_email && (
                  <div className="col-span-2 glass-card p-3 bg-night-950/80 rounded-xl border border-mystic-500/30">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-mystic-300">Gmail cần nâng cấp tài khoản:</div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selected.target_email || '')
                          alert('Đã sao chép danh sách Gmail!')
                        }}
                        className="text-xs bg-mystic-500/20 text-mystic-200 px-2.5 py-1 rounded hover:bg-mystic-500/30"
                      >
                        Sao chép Gmail
                      </button>
                    </div>
                    <div className="text-white font-mono font-bold text-base mt-1 select-all">{selected.target_email}</div>
                  </div>
                )}
                <div><div className="text-sm font-semibold text-mystic-300">Hình thức nhận</div><div className="text-white text-base">{selected.delivery_mode}</div></div>
                <div><div className="text-sm font-semibold text-mystic-300">Ngày đặt</div><div className="text-white text-base">{formatDate(selected.created_at)}</div></div>
                {selected.customer_note && <div className="col-span-2"><div className="text-sm font-semibold text-mystic-300">Ghi chú khách</div><div className="text-gray-200 text-base">{selected.customer_note}</div></div>}
              </div>

              {/* Note input */}
              <div>
                <label className="text-sm text-mystic-300 font-semibold mb-1 block">Ghi chú Admin</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú cho thao tác..." className="input-field text-base" />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {(selected.order_status === 'CUSTOMER_REPORTED_PAID' || selected.order_status === 'PENDING_PAYMENT') && (
                  <>
                    <button onClick={() => doAction('verify', selected.id)} disabled={actionLoading} className="btn-gold text-sm px-4 py-2.5 font-bold">
                      <Check className="w-4 h-4" /> Xác nhận đã nhận tiền
                    </button>
                    <button onClick={() => doAction('reject', selected.id)} disabled={actionLoading} className="btn-outline text-sm px-4 py-2.5 border-red-500/40 text-red-300 font-semibold">
                      <X className="w-4 h-4" /> Từ chối / Cần kiểm tra
                    </button>
                  </>
                )}
                {selected.order_status === 'PAYMENT_VERIFIED' && (
                  <button onClick={() => doAction('process', selected.id)} disabled={actionLoading} className="btn-primary text-sm px-4 py-2.5 font-bold">
                    <PlayCircle className="w-4 h-4" /> Bắt đầu xử lý nâng tài khoản
                  </button>
                )}
                {selected.order_status === 'PROCESSING' && (
                  <button onClick={() => doAction('complete', selected.id)} disabled={actionLoading} className="btn-gold text-sm px-4 py-2.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Đã hoàn tất đơn hàng
                  </button>
                )}
                {selected.order_status !== 'CANCELLED' && selected.order_status !== 'COMPLETED' && selected.order_status !== 'REFUNDED' && (
                  <button onClick={() => doAction('cancel', selected.id)} disabled={actionLoading} className="btn-outline text-sm px-4 py-2.5 border-red-500/40 text-red-300 font-semibold">
                    <XCircle className="w-4 h-4" /> Hủy đơn
                  </button>
                )}
                {selected.order_status === 'PAYMENT_VERIFIED' || selected.order_status === 'PROCESSING' ? (
                  <button onClick={() => doAction('refund', selected.id)} disabled={actionLoading} className="btn-outline text-sm px-4 py-2.5 border-orange-500/40 text-orange-300 font-semibold">
                    <DollarSign className="w-4 h-4" /> Hoàn tiền
                  </button>
                ) : null}
              </div>

              {/* Event history */}
              <div>
                <h4 className="text-xs text-mystic-300 font-medium mb-2">Lịch sử trạng thái</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {events.map((e) => (
                    <div key={e.id} className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="text-mystic-400">●</span>
                      <span>{ORDER_STATUS_LABELS[e.old_status ?? ''] || 'Tạo'} → {ORDER_STATUS_LABELS[e.new_status]}</span>
                      <span className="text-gray-600">{formatDate(e.created_at)}</span>
                      {e.note && <span className="text-gray-500">- {e.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Products Tab
// ============================================================
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: true })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  if (loading) return <div className="text-mystic-300 animate-pulse">Đang tải...</div>

  return (
    <div className="space-y-4">
      <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary text-sm">
        <Plus className="w-4 h-4" /> Thêm sản phẩm
      </button>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="glass-card rounded-xl p-4">
            {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-white text-sm font-medium">{p.name}</h3>
              {p.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-mystic-500/20 text-mystic-300 flex-shrink-0">{BADGE_LABELS[p.badge]}</span>}
            </div>
            <div className="text-xs text-gray-400 space-y-0.5 mb-3">
              <div>Giá: <span className="text-gold-300">{formatVND(p.price)}</span></div>
              <div>Thời hạn: {p.duration}</div>
              <div>Trạng thái: {p.status === 'active' ? 'Hiện' : 'Ẩn'} | {STOCK_LABELS[p.stock_status]}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(p); setShowForm(true) }} className="btn-outline text-xs px-3 py-1.5 flex-1">
                <Pencil className="w-3 h-3" /> Sửa
              </button>
              <button onClick={async () => {
                if (confirm('Xóa sản phẩm này?')) {
                  // Soft delete: set inactive
                  await supabase.from('products').update({ status: 'inactive' }).eq('id', p.id)
                  fetchProducts()
                }
              }} className="btn-outline text-xs px-3 py-1.5 border-red-500/30 text-red-300">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <ProductForm product={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSaved={() => { setShowForm(false); setEditing(null); fetchProducts() }} />}
    </div>
  )
}

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    product_type: product?.product_type ?? '',
    duration: product?.duration ?? '',
    price: product?.price ?? 0,
    delivery_mode: product?.delivery_mode ?? '',
    description: product?.description ?? '',
    warranty_note: product?.warranty_note ?? '',
    warranty_policy: product?.warranty_policy ?? '',
    badge: product?.badge ?? ('' as string),
    status: product?.status ?? ('active' as 'active' | 'inactive'),
    stock_status: product?.stock_status ?? ('in_stock' as 'in_stock' | 'out_of_stock' | 'preorder'),
    image_url: product?.image_url ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const data: Record<string, unknown> = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      product_type: form.product_type || null,
      duration: form.duration || null,
      price: Number(form.price),
      delivery_mode: form.delivery_mode || null,
      description: form.description || null,
      warranty_note: form.warranty_note || null,
      warranty_policy: form.warranty_policy || null,
      badge: form.badge || null,
      status: form.status,
      stock_status: form.stock_status,
      image_url: form.image_url || null,
    }
    if (product) {
      // Update via service_role through edge function or direct (admin can't write to products via RLS)
      // We need to use the supabase client - but RLS blocks writes. Products are service_role only.
      // For demo purposes, we'll use an edge function. For now, we use the admin API.
      // Actually, the admin IS authenticated, but products only have SELECT policy for authenticated.
      // We need to call an edge function. Let's do it directly for now using the rpc.
      // Since we can't write to products from the client, we'll skip this and note it needs an edge function.
      // For the admin UI, we'll use the supabase admin client which isn't available in browser.
      // We need an edge function for product CRUD. Let's note this limitation.
      alert('Cập nhật sản phẩm cần edge function. Vui lòng xem hướng dẫn cấp quyền Admin.')
    } else {
      alert('Thêm sản phẩm cần edge function. Vui lòng xem hướng dẫn cấp quyền Admin.')
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-night-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-mystic-500/15 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-3">
          <Field label="Tên sản phẩm" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Slug (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại" value={form.product_type} onChange={(v) => setForm({ ...form, product_type: v })} />
            <Field label="Thời hạn" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá (VND)" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) })} />
            <Field label="Hình thức nhận" value={form.delivery_mode} onChange={(v) => setForm({ ...form, delivery_mode: v })} />
          </div>
          <Field label="URL hình ảnh" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
          <div>
            <label className="text-xs text-mystic-300 font-medium mb-1 block">Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="text-xs text-mystic-300 font-medium mb-1 block">Chính sách bảo hành</label>
            <textarea value={form.warranty_policy} onChange={(e) => setForm({ ...form, warranty_policy: e.target.value })} rows={3} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-mystic-300 font-medium mb-1 block">Tag</label>
              <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="input-field text-sm">
                <option value="">Không</option>
                <option value="BAN_CHAY">Bán chạy</option>
                <option value="PHO_BIEN">Phổ biến</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-mystic-300 font-medium mb-1 block">Trạng thái</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })} className="input-field text-sm">
                <option value="active">Hiện</option>
                <option value="inactive">Ẩn</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-mystic-300 font-medium mb-1 block">Hàng</label>
              <select value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value as 'in_stock' | 'out_of_stock' | 'preorder' })} className="input-field text-sm">
                <option value="in_stock">Còn hàng</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="preorder">Đặt trước</option>
              </select>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-mystic-300 font-medium mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input-field text-sm" />
    </div>
  )
}

// ============================================================
// Customers Tab
// ============================================================
function CustomersTab() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setCustomers((data as Profile[]) ?? [])
      setLoading(false)
    })()
  }, [])

  const filtered = customers.filter((c) => {
    if (!search) return true
    return c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_code?.includes(search) ||
      c.full_name?.toLowerCase().includes(search.toLowerCase())
  })

  if (loading) return <div className="text-mystic-300 animate-pulse">Đang tải...</div>

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm khách hàng..." className="input-field pl-10" />
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mystic-500/20">
                <th className="text-left px-4 py-3 text-xs font-semibold text-mystic-200">Mã KH</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-mystic-200">Tên</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-mystic-200 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-mystic-200 hidden sm:table-cell">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-mystic-500/10 hover:bg-mystic-500/5">
                  <td className="px-4 py-3 text-white font-mono text-sm">{c.customer_code}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{c.full_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">{c.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">{c.created_at ? formatDate(c.created_at) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Bank Tab
// ============================================================
function BankTab() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const { data } = await supabase.from('payment_methods').select('*').order('created_at')
    setMethods((data as PaymentMethod[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  if (loading) return <div className="text-mystic-300 animate-pulse text-base">Đang tải...</div>

  return (
    <div className="space-y-6">
      {/* Tài khoản Eximbank chính thức theo yêu cầu */}
      <div className="glass-card rounded-2xl p-6 border-2 border-gold-400/40 bg-night-950/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-400/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-xl">Eximbank</span>
              <p className="text-sm text-gold-300 font-semibold">Tài khoản thanh toán chính thức trên website</p>
            </div>
          </div>
          <span className="text-sm font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Đang hoạt động
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-base pt-2 border-t border-mystic-500/15">
          <div className="glass-card p-3.5 bg-night-900/60 rounded-xl">
            <div className="text-sm text-gray-400">Số tài khoản nhận tiền:</div>
            <div className="text-2xl font-mono font-bold text-gold-300">0357722698</div>
          </div>
          <div className="glass-card p-3.5 bg-night-900/60 rounded-xl">
            <div className="text-sm text-gray-400">Chủ tài khoản:</div>
            <div className="text-xl font-bold text-white">HOANG JAMES</div>
          </div>
        </div>

        <div className="text-sm text-gray-300">
          Cú pháp khách chuyển tiền: <strong className="text-gold-300 font-mono">mã_đơn_chuyentien</strong> (Ví dụ: <span className="font-mono text-white">0128192_chuyentien</span>).
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-base font-bold text-white">Các tài khoản phụ khác trong Database:</h4>
        {methods.map((m) => (
          <div key={m.id} className="glass-card rounded-xl p-5 border border-mystic-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-white text-lg">{m.bank_name}</span>
              <span className={`text-sm px-3 py-1 rounded-full font-semibold ${m.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                {m.is_active ? 'Đang sử dụng' : 'Tắt'}
              </span>
            </div>
            <div className="text-base space-y-1 text-gray-300">
              <div>STK: <span className="text-white font-mono font-bold">{m.account_number}</span></div>
              <div>Chủ TK: <span className="text-white">{m.account_holder}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Policy Tab
// ============================================================
function PolicyTab() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [saving, setSaving] = useState(false)
  const keys = ['warranty_policy', 'terms_of_use', 'intro_text', 'faq', 'footer_text']

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('key, value').in('key', keys)
      const map: SiteSettings = {}
      ;(data ?? []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value })
      setSettings(map)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // Note: site_settings is admin-only write via service_role
    // For now, this needs an edge function
    alert('Lưu chính sách cần edge function với service_role. Vui lòng xem hướng dẫn.')
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-amber-300/70 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Lưu chính sách cần edge function với service_role.
      </p>
      {keys.map((key) => (
        <div key={key}>
          <label className="text-xs text-mystic-300 font-medium mb-1 block capitalize">{key.replace(/_/g, ' ')}</label>
          <textarea
            value={settings[key] ?? ''}
            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
            rows={4}
            className="input-field resize-none text-sm"
          />
        </div>
      ))}
      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu
      </button>
    </div>
  )
}

// ============================================================
// Contact Tab
// ============================================================
function ContactTab() {
  const [settings, setSettings] = useState<SiteSettings>({})

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('key, value').in('key', ['zalo_1', 'zalo_2', 'facebook_1', 'facebook_2', 'zalo_link_1', 'zalo_link_2'])
      const map: SiteSettings = {}
      ;(data ?? []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value })
      setSettings(map)
    })()
  }, [])

  const contactItems = [
    { key: 'zalo_1', label: 'Zalo 1', icon: MessageCircle },
    { key: 'zalo_2', label: 'Zalo 2', icon: MessageCircle },
    { key: 'facebook_1', label: 'Facebook 1', icon: Facebook },
    { key: 'facebook_2', label: 'Facebook 2', icon: Facebook },
    { key: 'zalo_link_1', label: 'Link Zalo 1', icon: MessageCircle },
    { key: 'zalo_link_2', label: 'Link Zalo 2', icon: MessageCircle },
  ]

  return (
    <div className="space-y-4">
      <p className="text-xs text-amber-300/70 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Lưu liên hệ cần edge function với service_role.
      </p>
      {contactItems.map((item) => (
        <div key={item.key}>
          <label className="text-xs text-mystic-300 font-medium mb-1 block flex items-center gap-1">
            <item.icon className="w-3 h-3" /> {item.label}
          </label>
          <input
            value={settings[item.key] ?? ''}
            onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
            className="input-field text-sm"
          />
        </div>
      ))}
    </div>
  )
}
