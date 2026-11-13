import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Search, ArrowRight, CreditCard, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types'
import { formatVND, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Tất cả đơn hàng' },
  { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'CUSTOMER_REPORTED_PAID', label: 'Đã báo chuyển tiền' },
  { value: 'PAYMENT_VERIFIED', label: 'Đã thanh toán' },
  { value: 'PROCESSING', label: 'Đang xử lý nâng acc' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

export default function Orders() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('ALL')
  const [searchCode, setSearchCode] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')
    const cleanCode = searchCode.trim().replace(/^#/, '')
    if (!cleanCode) {
      setSearchError('Vui lòng nhập mã đơn hàng 7 chữ số.')
      return
    }

    setSearching(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', cleanCode)
      .maybeSingle()

    setSearching(false)
    if (error || !data) {
      setSearchError('Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại.')
    } else {
      navigate(`/payment/${data.order_code}`)
    }
  }

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
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-mystic-300 font-bold text-lg animate-pulse">Đang tải danh sách đơn hàng...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white text-glow mb-2">Tra Cứu Đơn Hàng</h1>
          <p className="text-base text-gray-300">Nhập mã đơn 7 chữ số để kiểm tra tiến độ kích hoạt hoặc thanh toán đơn hàng</p>
        </div>

        {/* Ô TÌM KIẾM THEO MÃ ĐƠN HÀNG */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-mystic-500/30 bg-night-900/60 shadow-xl">
          <form onSubmit={handleSearchOrder} className="space-y-3">
            <label className="text-base font-bold text-white block">Tra cứu nhanh bằng Mã đơn hàng:</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã 7 chữ số (ví dụ: 0128192)..."
                className="input-field text-base sm:text-lg font-mono flex-1"
              />
              <button
                type="submit"
                disabled={searching}
                className="btn-primary text-base px-6 py-3 font-bold flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Search className="w-5 h-5" />
                <span>{searching ? 'Đang tìm...' : 'Tra cứu đơn'}</span>
              </button>
            </div>
            {searchError && (
              <div className="flex items-center gap-2 text-red-300 text-sm pt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </form>
        </div>

        {/* DANH SÁCH ĐƠN HÀNG NẾU CÓ PHIÊN HOẶC ĐÃ ĐẶT */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white">Đơn hàng vừa đặt trên trình duyệt này:</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-2.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === f.value
                      ? 'bg-mystic-600 text-white shadow-lg'
                      : 'glass-card text-gray-300 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {orders.map((order) => {
                const isPending = order.order_status === 'PENDING_PAYMENT' || order.order_status === 'CUSTOMER_REPORTED_PAID'

                return (
                  <div
                    key={order.id}
                    className="glass-card glass-card-hover rounded-2xl p-6 border border-mystic-500/20 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-mystic-500/15">
                      <div>
                        <div className="text-xs text-gray-400">Mã đơn hàng:</div>
                        <div className="font-mono text-xl font-bold text-gold-300">#{order.order_code}</div>
                        <div className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                            ORDER_STATUS_COLORS[order.order_status]
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          {ORDER_STATUS_LABELS[order.order_status]}
                        </span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="font-display font-bold text-white text-base">{order.product_name_snapshot}</div>
                        {order.delivery_mode && (
                          <div className="text-sm text-gray-300 mt-1">Hình thức: {order.delivery_mode}</div>
                        )}
                        {order.target_email && (
                          <div className="text-sm text-mystic-300 mt-1">Gmail: {order.target_email}</div>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <div className="text-xs text-gray-400">Tổng thanh toán</div>
                        <div className="font-display text-2xl font-bold text-gold-300">
                          {formatVND(order.total_amount)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        to={`/payment/${order.order_code}`}
                        className="btn-outline px-4 py-2 text-sm font-bold inline-flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{isPending ? 'Trang thanh toán' : 'Xem chi tiết đơn'}</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
