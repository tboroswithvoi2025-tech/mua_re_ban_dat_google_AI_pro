import { useState } from 'react'
import { X, ShoppingBag, AlertCircle, Loader2, Check, Mail, Info } from 'lucide-react'
import type { Product, Order } from '@/types'
import { formatVND, BADGE_LABELS, BADGE_COLORS } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Props {
  product: Product | null
  onClose: () => void
  onOrderCreated: (order: Order) => void
  requireAuth: () => void
}

export default function OrderModal({ product, onClose, onOrderCreated, requireAuth }: Props) {
  const { user, profile } = useAuth()
  const [targetEmail, setTargetEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!product) return null

  const needsEmail = product.delivery_mode === 'Mail chính chủ' || product.delivery_mode === 'Mail riêng'

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async () => {
    setError('')

    if (!user) {
      requireAuth()
      return
    }

    if (needsEmail) {
      if (!validateEmail(targetEmail)) {
        setError('Vui lòng nhập email đúng định dạng.')
        return
      }
      if (targetEmail !== confirmEmail) {
        setError('Email xác nhận không khớp.')
        return
      }
    }

    if (!agreed) {
      setError('Vui lòng xác nhận đã đọc điều kiện và chính sách.')
      return
    }

    setLoading(true)
    try {
      const { data, error: rpcError } = await supabase.rpc('create_order', {
        p_product_id: product.id,
        p_target_email: needsEmail ? targetEmail.trim() : null,
        p_customer_note: note.trim() || null,
      })

      if (rpcError) throw rpcError
      if (data) {
        onOrderCreated(data as Order)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-night-900/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-mystic-500/15">
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-mystic-400" />
            Đặt hàng
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Product summary */}
          <div className="glass-card p-4 bg-night-900/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display font-semibold text-white text-sm">{product.name}</div>
                {product.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${BADGE_COLORS[product.badge]}`}>
                    {BADGE_LABELS[product.badge]}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-gold-300">{formatVND(product.price)}</div>
                <div className="text-xs text-gray-400">{product.duration}</div>
              </div>
            </div>
          </div>

          {/* Account email (from login) */}
          <div>
            <label className="text-xs text-mystic-300 font-medium mb-1 block">Gmail đăng nhập website</label>
            <div className="input-field flex items-center gap-2 bg-night-900/60">
              <Mail className="w-4 h-4 text-mystic-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm truncate">{user?.email || 'Chưa đăng nhập'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Lấy tự động từ tài khoản Google của bạn</p>
          </div>

          {/* Delivery mode info */}
          {product.delivery_mode && (
            <div className="glass-card p-3 bg-mystic-500/5 border-mystic-500/20">
              <div className="flex items-center gap-2 text-mystic-200 text-xs font-medium mb-1">
                <Info className="w-4 h-4" /> Hình thức nhận hàng
              </div>
              <p className="text-gray-300 text-sm">{product.delivery_mode}</p>
              {product.delivery_mode === 'Mail được cấp' && (
                <p className="text-xs text-abyss-300 mt-1">
                  Tài khoản hoặc email do nhà cung cấp cấp sẵn. Không cần nhập Gmail nhận.
                </p>
              )}
            </div>
          )}

          {/* Target email (if needed) */}
          {needsEmail && (
            <>
              <div>
                <label className="text-xs text-mystic-300 font-medium mb-1 block">
                  Gmail nhận quyền thành viên *
                </label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="nhận.dịch.vụ@gmail.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs text-mystic-300 font-medium mb-1 block">
                  Nhập lại Gmail để xác nhận *
                </label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="nhận.dịch.vụ@gmail.com"
                  className="input-field"
                />
              </div>
            </>
          )}

          {/* Note */}
          <div>
            <label className="text-xs text-mystic-300 font-medium mb-1 block">Ghi chú (tùy chọn)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm cho đơn hàng..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-mystic-500/30 bg-night-900 text-mystic-500 focus:ring-mystic-500/20"
            />
            <span className="text-xs text-gray-400 leading-relaxed">
              Tôi đã đọc và đồng ý với điều kiện sử dụng và chính sách bảo hành.
              Tôi hiểu rằng đây là dịch vụ do bên thứ ba cung cấp.
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="glass-card p-3 bg-red-500/10 border-red-500/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang tạo đơn hàng...</>
            ) : (
              <><Check className="w-5 h-5" /> Xác nhận đơn hàng</>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Giá được lấy từ database. Bạn không thể sửa giá.
          </p>
        </div>
      </div>
    </div>
  )
}
