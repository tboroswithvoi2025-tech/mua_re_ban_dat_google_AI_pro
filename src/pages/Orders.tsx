import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, LogIn, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types'
import { formatVND, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'CUSTOMER_REPORTED_PAID', label: 'Đã báo chuyển khoản' },
  { value: 'PAYMENT_VERIFIED', label: 'Đã thanh toán' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

export default function Orders() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      if (filter !== 'ALL') {
        query = query.eq('order_status', filter as OrderStatus)
      }
      const { data } = await query
      setOrders((data as Order[]) ?? [])
    })()
  }, [user, filter])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><div className="text-mystic-300 animate-pulse">Đang tải...</div></div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <User className="w-12 h-12 text-mystic-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-400 text-sm mb-6">Đăng nhập bằng Google để xem đơn hàng</p>
          <button onClick={signInWithGoogle} className="btn-primary w-full">
            <LogIn className="w-5 h-5" /> Đăng nhập Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-white mb-6">Lịch sử đơn hàng</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.value
                  ? 'bg-mystic-500/30 text-mystic-200 border border-mystic-400/40'
                  : 'bg-night-800/40 text-gray-400 border border-transparent hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-mystic-500/30 mx-auto mb-4" />
            <p className="text-gray-500 text-sm mb-4">Chưa có đơn hàng nào trong mục này</p>
            <Link to="/" className="btn-outline text-sm">Khám phá cửa hàng</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="glass-card rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{order.product_name_snapshot}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono mb-2">{order.order_code}</div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>{formatDate(order.created_at)}</span>
                      {order.target_email && <span>Gmail: {order.target_email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <div className="font-display font-bold text-gold-300">{formatVND(order.total_amount)}</div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${ORDER_STATUS_COLORS[order.order_status]}`}>
                      {ORDER_STATUS_LABELS[order.order_status]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
