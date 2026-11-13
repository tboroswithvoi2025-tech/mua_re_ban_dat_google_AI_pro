import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ShoppingBag, AlertCircle, Loader2, Check, Mail, Info, Plus, Minus, ArrowRight } from 'lucide-react'
import type { Product, Order } from '@/types'
import { formatVND, BADGE_LABELS, BADGE_COLORS, formatProductName, generate7DigitOrderCode } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { getOrCreateGuestUser } from '@/lib/guestAuth'

interface Props {
  product: Product | null
  onClose: () => void
  onOrderCreated: (order: Order) => void
}

export default function OrderModal({ product, onClose, onOrderCreated }: Props) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [emails, setEmails] = useState<string[]>([''])
  const [agreed, setAgreed] = useState(false)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Khi thay đổi số lượng, tự động điều chỉnh số lượng ô nhập Gmail
  const handleQuantityChange = (newQty: number) => {
    const qty = Math.max(1, Math.min(20, newQty))
    setQuantity(qty)
    setEmails((prev) => {
      const next = [...prev]
      if (qty > next.length) {
        while (next.length < qty) next.push('')
      } else {
        return next.slice(0, qty)
      }
      return next
    })
  }

  // Cập nhật từng email theo index
  const handleEmailChange = (index: number, value: string) => {
    setEmails((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  // Reset khi mở modal cho sản phẩm mới
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setEmails([''])
      setAgreed(false)
      setNote('')
      setError('')
    }
  }, [product])

  if (!product) return null

  const displayName = formatProductName(product)

  // Kiểm tra gói có cần điền email để nâng cấp không (Google AI Pro Member hoặc Mail riêng / Mail chính chủ)
  const isGoogleAI = displayName.toLowerCase().includes('google') || displayName.toLowerCase().includes('gemini')
  const needsEmail =
    product.delivery_mode === 'Mail chính chủ' ||
    product.delivery_mode === 'Mail riêng' ||
    (isGoogleAI && product.delivery_mode !== 'Mail được cấp')

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  const handleSubmit = async () => {
    setError('')

    // Kiểm tra danh sách email nếu gói cần email nâng cấp
    if (needsEmail) {
      for (let i = 0; i < quantity; i++) {
        const mail = (emails[i] || '').trim()
        if (!mail) {
          setError(`Vui lòng nhập Gmail muốn nâng tài khoản #${i + 1}`)
          return
        }
        if (!validateEmail(mail)) {
          setError(`Gmail #${i + 1} (${mail}) không đúng định dạng. Vui lòng kiểm tra lại.`)
          return
        }
      }
    }

    if (!agreed) {
      setError('Vui lòng xác nhận đã đọc và đồng ý với điều kiện sử dụng.')
      return
    }

    setLoading(true)
    try {
      // 1. Tự động lấy hoặc khởi tạo phiên khách hàng ngầm không cần đăng ký tài khoản
      let currentUser = user
      if (!currentUser) {
        currentUser = await getOrCreateGuestUser()
      }

      // 2. Lấy customer_code
      let customerCode = profile?.customer_code
      if (!customerCode && currentUser) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('customer_code')
          .eq('id', currentUser.id)
          .maybeSingle()
        customerCode = prof?.customer_code || currentUser.id.slice(0, 6).toUpperCase()
      }

      // 3. Sinh mã đơn 7 chữ số ngẫu nhiên theo yêu cầu (ví dụ: 0128192)
      const orderCode7Digits = generate7DigitOrderCode()
      const totalAmount = product.price * quantity
      const targetEmailsJoined = needsEmail ? emails.map((e) => e.trim()).join(', ') : null

      // 4. Tạo đơn hàng vào database Supabase
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode7Digits,
          customer_id: currentUser.id,
          customer_code: customerCode || '000000',
          product_id: product.id,
          product_name_snapshot: `${displayName} (x${quantity})`,
          unit_price: product.price,
          total_amount: totalAmount,
          target_email: targetEmailsJoined,
          delivery_mode: product.delivery_mode,
          customer_note: note.trim()
            ? `${note.trim()} [SL: ${quantity}]`
            : `Số lượng: ${quantity}${targetEmailsJoined ? ` - Mails: ${targetEmailsJoined}` : ''}`,
          order_status: 'PENDING_PAYMENT',
        })
        .select('*')
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error('Lỗi tạo đơn: ' + insertError.message)
      }

      if (newOrder) {
        onOrderCreated(newOrder as Order)
        onClose()
        navigate(`/payment/${newOrder.order_code}`)
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = product.price * quantity

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-night-900/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-mystic-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-mystic-500/20">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-mystic-400" />
            Xác nhận đặt mua
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin tóm tắt sản phẩm */}
          <div className="glass-card p-5 bg-night-900/60 rounded-xl border border-mystic-500/20">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-display font-bold text-white text-base sm:text-lg">{displayName}</div>
                {product.badge && (
                  <span
                    className={`text-sm font-bold px-3 py-0.5 rounded-full inline-block ${BADGE_COLORS[product.badge]}`}
                  >
                    {BADGE_LABELS[product.badge]}
                  </span>
                )}
                {product.duration && (
                  <div className="text-sm text-gray-300">
                    Thời hạn: <strong className="text-mystic-200">{product.duration}</strong>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-400">Đơn giá</div>
                <div className="font-display font-bold text-xl text-gold-300 text-glow-gold">
                  {formatVND(product.price)}
                </div>
              </div>
            </div>
          </div>

          {/* CHỈNH SỐ LƯỢNG MUA */}
          <div className="glass-card p-5 bg-night-900/40 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-base font-bold text-white block">Số lượng mua</label>
                <p className="text-sm text-gray-400">Chọn số lượng tài khoản bạn muốn mua</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl border border-mystic-400/40 flex items-center justify-center text-white hover:bg-mystic-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="font-display text-2xl font-bold text-white w-10 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 20}
                  className="w-10 h-10 rounded-xl border border-mystic-400/40 flex items-center justify-center text-white hover:bg-mystic-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-mystic-500/15 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300">Tổng thanh toán:</span>
              <span className="font-display text-2xl font-bold text-gold-300 text-glow-gold">
                {formatVND(totalPrice)}
              </span>
            </div>
          </div>

          {/* ĐIỀN EMAIL NÂNG ACC THEO SỐ LƯỢNG (Google AI Pro hoặc gói cần mail) */}
          {needsEmail ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-mystic-400" />
                  Gmail muốn nâng cấp tài khoản
                </label>
                <span className="text-sm text-mystic-300 font-medium">
                  (Mua {quantity} đơn → Điền {quantity} Gmail)
                </span>
              </div>

              <div className="space-y-3">
                {Array.from({ length: quantity }, (_, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-sm text-mystic-200 font-medium block">
                      Gmail nâng acc #{idx + 1} *
                    </label>
                    <input
                      type="email"
                      value={emails[idx] || ''}
                      onChange={(e) => handleEmailChange(idx, e.target.value)}
                      placeholder={`nhap.gmail.so.${idx + 1}@gmail.com`}
                      className="input-field text-base"
                      required
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                Admin sẽ trực tiếp cấp quyền AI Pro vào các địa chỉ Gmail bạn đã điền ở trên sau khi nhận chuyển khoản.
              </p>
            </div>
          ) : (
            <div className="glass-card p-4 bg-abyss-500/10 border border-abyss-500/30 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-abyss-200">
                <Info className="w-5 h-5" />
                Hình thức nhận hàng: {product.delivery_mode || 'Mail được cấp'}
              </div>
              <p className="text-sm text-gray-300">
                Gói này do shop chuẩn bị sẵn tài khoản / email cho bạn. Bạn không cần nhập Gmail cá nhân. Thông tin đăng nhập sẽ được gửi ngay sau khi thanh toán.
              </p>
            </div>
          )}

          {/* Ghi chú thêm */}
          <div>
            <label className="text-sm font-semibold text-gray-300 mb-1.5 block">Ghi chú cho Admin (tuỳ chọn)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Cần nâng gấp trong 15 phút, liên hệ qua Zalo..."
              className="input-field text-base"
            />
          </div>

          {/* Cam kết điều khoản */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-mystic-500/30 bg-night-900 text-mystic-500 focus:ring-mystic-500"
            />
            <label htmlFor="agree-terms" className="text-sm text-gray-300 leading-snug cursor-pointer">
              Tôi xác nhận thông tin Gmail điền là chính xác và đồng ý với điều kiện sử dụng cũng như chính sách bảo hành của shop.
            </label>
          </div>

          {/* Báo lỗi nếu có */}
          {error && (
            <div className="glass-card p-3.5 bg-red-500/15 border border-red-500/40 rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-200 font-medium">{error}</span>
            </div>
          )}

          {/* Nút Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full text-base sm:text-lg py-4 font-bold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Đang tạo đơn hàng...
              </>
            ) : (
              <>
                <span>TIẾP TỤC ĐẾN TRANG THANH TOÁN</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
