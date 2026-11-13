import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import {
  formatVND,
  formatProductName,
  getProductImage,
  productNeedsEmail,
  generate7DigitOrderCode,
} from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getOrCreateGuestUser } from '@/lib/guestAuth'

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, updateSingleEmail, removeFromCart, clearCart, totalAmount, totalCount } =
    useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  const handleCheckout = async () => {
    setError('')

    if (items.length === 0) {
      setError('Giỏ hàng đang trống.')
      return
    }

    // 1. Kiểm tra toàn bộ Gmail của các sản phẩm cần email nâng cấp
    const allEmailsList: string[] = []
    for (const item of items) {
      if (productNeedsEmail(item.product)) {
        const pName = formatProductName(item.product)
        for (let i = 0; i < item.quantity; i++) {
          const mail = (item.targetEmails[i] || '').trim()
          if (!mail) {
            setError(`Vui lòng nhập đầy đủ Gmail nâng cấp cho "${pName}" (Email #${i + 1})`)
            return
          }
          if (!validateEmail(mail)) {
            setError(`Gmail #${i + 1} (${mail}) cho "${pName}" không đúng định dạng.`)
            return
          }
          allEmailsList.push(mail)
        }
      }
    }

    setLoading(true)

    try {
      // 2. Lấy hoặc tạo phiên khách hàng ngầm
      let currentUser = user
      if (!currentUser) {
        currentUser = await getOrCreateGuestUser()
      }

      // 3. Lấy customer_code
      let customerCode = profile?.customer_code
      if (!customerCode && currentUser) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('customer_code')
          .eq('id', currentUser.id)
          .maybeSingle()
        customerCode = prof?.customer_code || currentUser.id.slice(0, 6).toUpperCase()
      }

      // 4. Sinh mã đơn hàng 7 chữ số ngẫu nhiên
      const orderCode7Digits = generate7DigitOrderCode()

      // Tóm tắt danh sách sản phẩm
      const productSnapshot = items
        .map((item) => `${formatProductName(item.product)} (x${item.quantity})`)
        .join(' + ')

      const targetEmailsJoined = allEmailsList.length > 0 ? allEmailsList.join(', ') : null

      // Chi tiết breakdown cho ghi chú đơn hàng
      const itemsBreakdown = items
        .map(
          (item) =>
            `- ${formatProductName(item.product)} x${item.quantity}: ${formatVND(item.product.price * item.quantity)}`
        )
        .join('\n')

      const combinedCustomerNote = note.trim()
        ? `${note.trim()}\n\n[Chi tiết giỏ hàng]:\n${itemsBreakdown}`
        : `[Chi tiết giỏ hàng]:\n${itemsBreakdown}`

      // 5. Tạo đơn hàng tổng vào Supabase
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode7Digits,
          customer_id: currentUser.id,
          customer_code: customerCode || '000000',
          product_id: items[0].product.id, // ID sản phẩm chính
          product_name_snapshot: productSnapshot,
          unit_price: totalAmount,
          total_amount: totalAmount,
          target_email: targetEmailsJoined,
          delivery_mode: items.length === 1 ? items[0].product.delivery_mode : 'Đơn tổng nhiều gói',
          customer_note: combinedCustomerNote,
          order_status: 'PENDING_PAYMENT',
        })
        .select('*')
        .single()

      if (insertError) {
        console.error('Insert order error:', insertError)
        throw new Error('Lỗi tạo đơn hàng: ' + insertError.message)
      }

      if (newOrder) {
        clearCart()
        closeCart()
        navigate(`/payment/${newOrder.order_code}`)
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-night-950/80 backdrop-blur-md transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl glass-card bg-night-900/95 border-l border-mystic-500/30 shadow-2xl flex flex-col justify-between">
          {/* Header giỏ hàng lớn */}
          <div className="p-6 border-b border-mystic-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mystic-500/20 border border-mystic-400/30 flex items-center justify-center text-gold-300">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Giỏ Hàng Của Bạn</h2>
                <p className="text-xs sm:text-sm text-mystic-300 font-medium">
                  {totalCount} sản phẩm đã chọn
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Danh sách sản phẩm trong giỏ */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-night-950 flex items-center justify-center text-mystic-500/40 border border-mystic-500/20">
                  <Package className="w-10 h-10" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Giỏ hàng của bạn đang trống</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Hãy ghé qua trang sản phẩm để chọn gói Google AI Pro, CapCut hoặc Canva phù hợp nhất.
                </p>
                <Link
                  to="/products"
                  onClick={closeCart}
                  className="btn-primary text-sm px-6 py-2.5 font-bold inline-flex items-center gap-2"
                >
                  <span>Khám phá sản phẩm</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map((item) => {
                  const displayName = formatProductName(item.product)
                  const displayImg = getProductImage(item.product)
                  const needsEmail = productNeedsEmail(item.product)
                  const subtotal = item.product.price * item.quantity

                  return (
                    <div
                      key={item.product.id}
                      className="glass-card p-4 sm:p-5 rounded-2xl border border-mystic-500/20 bg-night-950/60 space-y-3"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        {/* Ảnh sản phẩm */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-night-900 flex-shrink-0 border border-mystic-500/20">
                          <img src={displayImg} alt={displayName} className="w-full h-full object-cover" />
                        </div>

                        {/* Thông tin sản phẩm & điều khiển số lượng */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-display font-bold text-white text-base leading-snug line-clamp-2">
                                {displayName}
                              </h4>
                              {item.product.duration && (
                                <span className="text-xs text-mystic-300 font-medium">
                                  Hạn: {item.product.duration}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-gray-400 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                              title="Xóa khỏi giỏ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            {/* Bộ điều khiển số lượng */}
                            <div className="flex items-center gap-2 bg-night-900/90 rounded-lg p-1 border border-mystic-500/20">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 rounded flex items-center justify-center text-white hover:bg-mystic-500/20 font-bold"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center font-mono font-bold text-sm text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= 50}
                                className="w-7 h-7 rounded flex items-center justify-center text-white hover:bg-mystic-500/20 font-bold disabled:opacity-30"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Thành tiền */}
                            <div className="font-display font-bold text-lg text-gold-300">
                              {formatVND(subtotal)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ô nhập Gmail nâng cấp theo số lượng sản phẩm này */}
                      {needsEmail && (
                        <div className="pt-2 border-t border-mystic-500/15 space-y-2 bg-night-900/40 p-3 rounded-xl">
                          <div className="flex items-center justify-between text-xs font-semibold text-mystic-200">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-mystic-400" />
                              Gmail nhận nâng cấp ({item.quantity} email):
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {Array.from({ length: item.quantity }, (_, idx) => (
                              <input
                                key={idx}
                                type="email"
                                value={item.targetEmails[idx] || ''}
                                onChange={(e) => updateSingleEmail(item.product.id, idx, e.target.value)}
                                placeholder={`Nhập Gmail #${idx + 1} cần nâng cấp...`}
                                className="input-field text-sm py-1.5 px-3 bg-night-950/80"
                                required
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Ghi chú đơn hàng cho Admin */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-300 block">
                    Ghi chú đơn hàng (tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Cần nâng gấp, liên hệ Zalo..."
                    className="input-field text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Giỏ hàng & Nút Thanh Toán */}
          {items.length > 0 && (
            <div className="p-6 border-t border-mystic-500/20 bg-night-950/90 space-y-4">
              {/* Tổng kết tiền */}
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Tổng số lượng:</span>
                  <span className="font-bold text-white">{totalCount} sản phẩm</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Phí kích hoạt & hỗ trợ:</span>
                  <span className="text-emerald-400 font-semibold">Miễn phí</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-mystic-500/15">
                  <span className="font-display font-bold text-base text-white">Tổng thanh toán:</span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-gold-300 text-glow-gold">
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Thông báo lỗi nếu có */}
              {error && (
                <div className="glass-card p-3 bg-red-500/15 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-200 text-xs sm:text-sm font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nút bấm Thanh toán */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full py-4 text-base sm:text-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.4)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tạo đơn hàng...</span>
                  </>
                ) : (
                  <>
                    <span>TIẾP TỤC ĐẾN TRANG THANH TOÁN</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Thanh toán bảo mật qua Eximbank - Hỗ trợ 2 Founders 24/7</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
