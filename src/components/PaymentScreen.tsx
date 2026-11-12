import { useState, useEffect } from 'react'
import { X, Copy, Check, Loader2, Building2, AlertCircle, ArrowRight, Info } from 'lucide-react'
import type { Order } from '@/types'
import { formatVND } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { PaymentMethod } from '@/types'

interface Props {
  order: Order | null
  onClose: () => void
  onPaymentReported: () => void
}

export default function PaymentScreen({ order, onClose, onPaymentReported }: Props) {
  const { profile } = useAuth()
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState('')
  const [error, setError] = useState('')
  const [reported, setReported] = useState(false)

  useEffect(() => {
    if (order) {
      setReported(order.order_status !== 'PENDING_PAYMENT')
      ;(async () => {
        const { data } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
        setMethods((data as PaymentMethod[]) ?? [])
      })()
    }
  }, [order])

  if (!order) return null

  const transferContent = `${profile?.customer_code ?? ''} ${order.order_code} THANHTOAN`

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const handleReportPayment = async () => {
    setLoading(true)
    setError('')
    try {
      const { error: rpcError } = await supabase.rpc('report_payment', {
        p_order_id: order.id,
      })
      if (rpcError) throw rpcError
      setReported(true)
      onPaymentReported()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.')
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
        className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-mystic-500/15">
          <h2 className="font-display text-xl font-bold text-white">Thanh toán đơn hàng</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order summary */}
          <div className="glass-card p-4 bg-night-900/40">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-mystic-300 mb-0.5">Mã đơn hàng</div>
                <div className="text-white font-mono font-bold">{order.order_code}</div>
              </div>
              <div>
                <div className="text-xs text-mystic-300 mb-0.5">Mã khách hàng</div>
                <div className="text-white font-mono font-bold">{order.customer_code}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-mystic-300 mb-0.5">Sản phẩm</div>
                <div className="text-white">{order.product_name_snapshot}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gold-300 mb-0.5">Số tiền phải thanh toán</div>
                <div className="font-display text-2xl font-bold text-gold-300 text-glow-gold">
                  {formatVND(order.total_amount)}
                </div>
              </div>
            </div>
          </div>

          {/* Transfer content */}
          <div className="glass-card p-4 bg-mystic-500/10 border-mystic-500/30">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-mystic-300 font-medium mb-1">Nội dung chuyển khoản</div>
                <div className="text-white font-mono font-bold text-sm break-all">{transferContent}</div>
              </div>
              <button
                onClick={() => copyToClipboard(transferContent, 'content')}
                className="btn-outline px-3 py-2 text-xs flex-shrink-0"
              >
                {copiedField === 'content' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bank methods */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-mystic-400" /> Phương thức thanh toán
            </h3>
            {methods.map((method) => (
              <div key={method.id} className="glass-card p-4 bg-night-900/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-white text-base">{method.bank_name}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Số tài khoản</div>
                      <div className="text-white font-mono">{method.account_number}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(method.account_number, `acc-${method.id}`)}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      {copiedField === `acc-${method.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Sao chép
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Chủ tài khoản</div>
                      <div className="text-white">{method.account_holder}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(method.account_holder, `holder-${method.id}`)}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      {copiedField === `holder-${method.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="glass-card p-3 bg-abyss-500/5 border-abyss-500/20 flex items-start gap-2">
            <Info className="w-4 h-4 text-abyss-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Chuyển khoản chính xác số tiền và nội dung trên. Sau khi chuyển, nhấn nút bên dưới để báo đã thanh toán.
              Admin sẽ kiểm tra và xác nhận tiền thực sự đã vào tài khoản.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="glass-card p-3 bg-red-500/10 border-red-500/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Reported state */}
          {reported ? (
            <div className="glass-card p-4 bg-emerald-500/10 border-emerald-500/30 text-center">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 font-medium text-sm">
                Bạn đã báo chuyển khoản thành công.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Đơn hàng đang chờ Admin xác nhận. Bạn sẽ nhận thông báo khi thanh toán được xác nhận.
              </p>
            </div>
          ) : (
            <button
              onClick={handleReportPayment}
              disabled={loading}
              className="btn-gold w-full text-base disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</>
              ) : (
                <>TÔI ĐÃ CHUYỂN KHOẢN <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
