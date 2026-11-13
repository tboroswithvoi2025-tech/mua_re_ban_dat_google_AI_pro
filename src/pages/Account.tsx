import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Hash, Calendar, Package, ArrowRight, LogIn, CreditCard } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-mystic-300 font-bold text-lg animate-pulse">Đang tải hồ sơ...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <User className="w-14 h-14 text-mystic-400 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-white">Mua Hàng Trực Tiếp</h2>
          <p className="text-gray-300 text-base">Website hỗ trợ mua hàng trực tiếp không cần tài khoản. Bạn có thể tra cứu đơn hàng bằng mã đơn 7 chữ số.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/orders" className="btn-primary w-full text-base py-3">
              Tra cứu đơn hàng
            </Link>
            <Link to="/products" className="btn-outline w-full text-base py-3">
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-mystic-500/25">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Avatar'}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-mystic-400/40 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-mystic-500 to-abyss-500 flex items-center justify-center shadow-xl">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {profile?.full_name || 'Khách hàng'}
              </h1>
              <div className="space-y-1.5 text-base text-gray-300">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-5 h-5 text-mystic-400" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gold-300">
                  <Hash className="w-5 h-5" />
                  <span>Mã khách hàng:</span>
                  <span className="font-mono font-bold text-lg bg-night-950 px-2.5 py-0.5 rounded border border-gold-400/30">
                    {profile?.customer_code}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 text-abyss-400" />
                  <span>Ngày tham gia: {profile?.created_at ? formatDateShort(profile.created_at) : '-'}</span>
                </div>
              </div>
            </div>
            <div className="text-center glass-card px-6 py-4 rounded-2xl border border-mystic-500/20 bg-night-950/50">
              <div className="text-3xl font-bold text-gold-300 font-display">{orderCount}</div>
              <div className="text-sm font-semibold text-gray-300 mt-1">Tổng đơn hàng</div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-mystic-500/25 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-mystic-400" /> Đơn hàng gần đây
            </h2>
            <Link
              to="/orders"
              className="text-sm sm:text-base font-bold text-mystic-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Package className="w-12 h-12 text-mystic-500/40 mx-auto" />
              <p className="text-gray-400 text-base">Bạn chưa có đơn hàng nào.</p>
              <button
                onClick={() => navigate('/products')}
                className="btn-primary text-sm px-6 py-2.5 font-bold"
              >
                Khám phá sản phẩm ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isPending =
                  order.order_status === 'PENDING_PAYMENT' || order.order_status === 'CUSTOMER_REPORTED_PAID'

                return (
                  <div
                    key={order.id}
                    className="glass-card p-4 sm:p-5 bg-night-900/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-mystic-500/15"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-white font-bold text-base sm:text-lg">{order.product_name_snapshot}</div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gold-300 font-mono font-bold">Mã đơn: #{order.order_code}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{formatDateShort(order.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                      <div className="sm:text-right">
                        <div className="text-gold-300 text-lg font-bold">{formatVND(order.total_amount)}</div>
                        <span
                          className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full border inline-block mt-1 ${
                            ORDER_STATUS_COLORS[order.order_status]
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.order_status]}
                        </span>
                      </div>

                      {isPending && (
                        <Link
                          to={`/payment/${order.order_code}`}
                          className="btn-gold px-3.5 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 flex-shrink-0"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Thanh toán</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
