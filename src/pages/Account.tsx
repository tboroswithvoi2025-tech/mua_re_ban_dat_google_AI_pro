import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Hash, Calendar, Package, ArrowRight, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { formatVND, formatDateShort, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

export default function Account() {
  const { user, profile, loading, signInWithGoogle } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [orderCount, setOrderCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setOrders((data as Order[]) ?? [])

      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id)
      setOrderCount(count ?? 0)
    })()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-mystic-300 animate-pulse">Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <User className="w-12 h-12 text-mystic-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-400 text-sm mb-6">Đăng nhập bằng Google để xem thông tin tài khoản</p>
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
        {/* Profile header */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Avatar'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-mystic-400/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mystic-500 to-abyss-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-2xl font-bold text-white">{profile?.full_name || 'Khách hàng'}</h1>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
                  <Mail className="w-4 h-4 text-mystic-400" /> {profile?.email}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gold-300">
                  <Hash className="w-4 h-4" /> Mã khách hàng: <span className="font-mono font-bold">{profile?.customer_code}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
                  <Calendar className="w-4 h-4 text-abyss-400" /> Tham gia: {profile?.created_at ? formatDateShort(profile.created_at) : '-'}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-mystic-300 font-display">{orderCount}</div>
              <div className="text-xs text-gray-400">Tổng đơn hàng</div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-mystic-400" /> Đơn hàng gần đây
            </h2>
            <Link to="/orders" className="text-sm text-mystic-300 hover:text-mystic-200 flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-mystic-500/30 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chưa có đơn hàng nào</p>
              <button
                onClick={() => navigate('/')}
                className="btn-outline mt-4 text-sm"
              >
                Khám phá cửa hàng
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.id} className="glass-card p-3 bg-night-900/40 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-medium truncate">{order.product_name_snapshot}</div>
                    <div className="text-xs text-gray-500 font-mono">{order.order_code}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-gold-300 text-sm font-bold">{formatVND(order.total_amount)}</div>
                    <div className="text-xs text-gray-400">{formatDateShort(order.created_at)}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border font-medium flex-shrink-0 ${ORDER_STATUS_COLORS[order.order_status]}`}>
                    {ORDER_STATUS_LABELS[order.order_status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
