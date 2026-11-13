import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  Building2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Mail,
  ShoppingBag,
  BellRing,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { formatVND, DEFAULT_BANK, FOUNDERS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function Payment() {
  const { orderCode } = useParams<{ orderCode: string }>()
  const [searchParams] = useSearchParams()
  const code = orderCode || searchParams.get('order') || ''
  const { user } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState('')

  // Đếm số lần spam nút "ĐÃ CHUYỂN" (tối đa 5 lần)
  const [clickCount, setClickCount] = useState<number>(0)
  const [reporting, setReporting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState('')

  // Đọc clickCount từ localStorage theo mã đơn để giữ state khi reload trang
  useEffect(() => {
    if (code) {
      const saved = localStorage.getItem(`payment_clicks_${code}`)
      if (saved) {
        setClickCount(parseInt(saved, 10) || 0)
      }
    }
  }, [code])

  // Tải thông tin đơn hàng
  useEffect(() => {
    if (!code) {
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', code)
        .maybeSingle()

      if (error || !data) {
        setError('Không tìm thấy thông tin đơn hàng hoặc mã đơn không tồn tại.')
      } else {
        setOrder(data as Order)
      }
      setLoading(false)
    }

    fetchOrder()

    // Realtime cập nhật trạng thái đơn hàng khi Admin duyệt
    const channel = supabase
      .channel(`order-payment-${code}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `order_code=eq.${code}` },
        (payload) => {
          if (payload.new) {
            setOrder(payload.new as Order)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [code])

  // Cú pháp chuyển tiền chuẩn: số đơn_chuyentien
  const transferContent = order ? `${order.order_code}_chuyentien` : ''

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2500)
  }

  // Xử lý khi khách bấm nút "ĐÃ CHUYỂN" (cho phép spam tối đa 5 lần)
  const handleReportPaid = async () => {
    if (!order) return
    if (clickCount >= 5) {
      setReportSuccess('Bạn đã gửi tối đa 5 lần thông báo. Vui lòng đợi Admin kiểm tra tài khoản Eximbank!')
      return
    }

    setReporting(true)
    setError('')

    const nextCount = clickCount + 1

    try {
      // 1. Gọi hàm report_payment RPC trên Supabase
      await supabase.rpc('report_payment', {
        p_order_id: order.id,
        p_transfer_reference: `Khách báo chuyển tiền lần ${nextCount}/5 qua Eximbank`,
      })

      // 2. Cập nhật state và localStorage
      setClickCount(nextCount)
      localStorage.setItem(`payment_clicks_${order.order_code}`, String(nextCount))

      setReportSuccess(
        `Đã gửi thông báo cho Admin (Lần ${nextCount}/5)! Admin đang nhận thông báo để vào kiểm tra tài khoản Eximbank.`
      )

      // Cập nhật lại đơn hàng local
      setOrder({ ...order, order_status: 'CUSTOMER_REPORTED_PAID' })
    } catch (err) {
      console.error(err)
      // Nếu RPC gặp lỗi, vẫn ghi nhận lượt thông báo
      setClickCount(nextCount)
      localStorage.setItem(`payment_clicks_${order.order_code}`, String(nextCount))
      setReportSuccess(
        `Đã ghi nhận bạn đã chuyển khoản (Lần ${nextCount}/5). Vui lòng đợi Admin duyệt đơn!`
      )
    } finally {
      setReporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="flex items-center gap-3 text-mystic-300 text-lg">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span>Đang tải thông tin thanh toán...</span>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 max-w-lg w-full text-center space-y-4">
          <AlertCircle className="w-14 h-14 text-amber-400 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-white">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-300 text-base">{error || 'Vui lòng kiểm tra lại đường dẫn thanh toán.'}</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 mt-4 text-base">
            <ShoppingBag className="w-5 h-5" />
            <span>Xem danh sách sản phẩm</span>
          </Link>
        </div>
      </div>
    )
  }

  const isCompleted = order.order_status === 'COMPLETED'
  const isVerified = order.order_status === 'PAYMENT_VERIFIED' || order.order_status === 'PROCESSING'

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header trang thanh toán */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-400/30 mb-2">
            <Building2 className="w-5 h-5 text-gold-400" />
            <span className="text-sm font-bold text-gold-200 uppercase tracking-wider">Cổng Thanh Toán</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white text-glow">
            Thanh Toán Đơn Hàng #{order.order_code}
          </h1>
          <p className="text-base text-gray-300">
            Vui lòng chuyển khoản chính xác số tiền và nội dung bên dưới để hệ thống kích hoạt tài khoản
          </p>
        </div>

        {/* Trạng thái đơn hàng */}
        <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-mystic-500/30">
          <div>
            <div className="text-sm text-gray-400 mb-1">Trạng thái hiện tại:</div>
            <span
              className={`text-base font-bold px-4 py-1.5 rounded-full border inline-flex items-center gap-2 ${
                ORDER_STATUS_COLORS[order.order_status]
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Clock className="w-5 h-5" />}
              {ORDER_STATUS_LABELS[order.order_status]}
            </span>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Tổng tiền thanh toán</div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-gold-300 text-glow-gold">
              {formatVND(order.total_amount)}
            </div>
          </div>
        </div>

        {/* Thông báo đã hoàn tất đơn */}
        {isCompleted && (
          <div className="glass-card p-6 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-display text-2xl font-bold text-white">Đơn hàng đã hoàn thành!</h3>
            <p className="text-base text-emerald-200">
              Admin đã hoàn tất nâng cấp tài khoản cho các email trong đơn hàng này. Chúc bạn trải nghiệm AI Pro tuyệt vời!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* CỘT TRÁI: THÔNG TIN TÀI KHOẢN NGÂN HÀNG EXIMBANK */}
          <div className="glass-card p-7 rounded-2xl space-y-6 border border-gold-500/30 bg-night-900/60">
            <div className="flex items-center gap-3 pb-4 border-b border-mystic-500/20">
              <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gold-300" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Thông tin chuyển khoản</h3>
                <p className="text-sm text-gray-400">Ngân hàng thụ hưởng chính thức</p>
              </div>
            </div>

            {/* Ngân hàng */}
            <div className="space-y-1">
              <div className="text-sm text-gray-400 font-medium">Ngân hàng:</div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <span>{DEFAULT_BANK.bank_name}</span>
                <span className="text-sm text-mystic-300 font-normal">(Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam)</span>
              </div>
            </div>

            {/* Số tài khoản */}
            <div className="glass-card p-4 bg-night-950/70 rounded-xl space-y-1.5 border border-mystic-500/30">
              <div className="text-sm text-mystic-300 font-medium">Số tài khoản:</div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-gold-300 tracking-wider">
                  {DEFAULT_BANK.account_number}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEFAULT_BANK.account_number, 'stk')}
                  className="btn-outline px-3.5 py-2 text-sm flex items-center gap-1.5 font-bold flex-shrink-0"
                >
                  {copiedField === 'stk' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao chép STK</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chủ tài khoản */}
            <div className="space-y-1">
              <div className="text-sm text-gray-400 font-medium">Chủ tài khoản:</div>
              <div className="text-lg font-bold text-white uppercase tracking-wide">
                {DEFAULT_BANK.account_holder}
              </div>
            </div>

            {/* CÚ PHÁP CHUYỂN TIỀN (QUAN TRỌNG) */}
            <div className="glass-card p-5 bg-mystic-500/15 border-2 border-mystic-400/50 rounded-xl space-y-2">
              <div className="text-sm font-bold text-gold-300 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
                Cú pháp chuyển tiền bắt buộc:
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="font-mono text-xl sm:text-2xl font-bold text-white bg-night-950 px-4 py-2 rounded-lg border border-mystic-400/30 select-all break-all">
                  {transferContent}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transferContent, 'content')}
                  className="btn-gold px-4 py-2.5 text-sm font-bold flex items-center gap-1.5 flex-shrink-0"
                >
                  {copiedField === 'content' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Chép cú pháp</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 mt-2">
                * Nhập đúng nội dung: <strong className="text-gold-300 font-mono">{transferContent}</strong> để hệ thống tự động đối chiếu tiền vào tài khoản!
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT ĐƠN & NÚT "ĐÃ CHUYỂN" (SPAM TỐI ĐA 5 LẦN) */}
          <div className="glass-card p-7 rounded-2xl space-y-6 flex flex-col justify-between border border-mystic-500/30">
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-mystic-500/20">
                <div className="w-12 h-12 rounded-xl bg-mystic-500/20 border border-mystic-400/40 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-mystic-300" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Chi tiết đơn hàng</h3>
                  <p className="text-sm text-gray-400">Mã đơn: <strong className="font-mono text-gold-300">{order.order_code}</strong></p>
                </div>
              </div>

              {/* Tên sản phẩm & số lượng */}
              <div className="space-y-1">
                <div className="text-sm text-gray-400 font-medium">Sản phẩm đã chọn:</div>
                <div className="text-lg font-bold text-white">{order.product_name_snapshot}</div>
                <div className="text-sm text-mystic-300">
                  Hình thức nhận: <span className="text-gray-200">{order.delivery_mode || 'Mail chính chủ'}</span>
                </div>
              </div>

              {/* Danh sách Gmail nâng cấp */}
              {order.target_email && (
                <div className="glass-card p-4 bg-night-900/60 rounded-xl space-y-2 border border-mystic-500/20">
                  <div className="text-sm font-bold text-mystic-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-mystic-400" />
                    Gmail yêu cầu nâng cấp:
                  </div>
                  <div className="space-y-1">
                    {order.target_email.split(',').map((email, idx) => (
                      <div key={idx} className="text-sm text-gray-200 font-mono bg-night-950/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="text-mystic-400 font-bold">#{idx + 1}</span>
                        <span>{email.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ghi chú nếu có */}
              {order.customer_note && (
                <div className="text-sm text-gray-400">
                  <span className="font-medium text-gray-300">Ghi chú:</span> {order.customer_note}
                </div>
              )}

              {/* CẢNH BÁO / HƯỚNG DẪN */}
              <div className="glass-card p-4 bg-abyss-500/10 border border-abyss-500/25 rounded-xl space-y-2">
                <div className="text-sm font-bold text-abyss-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Quy trình kích hoạt:
                </div>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Chuyển khoản theo STK Eximbank và nội dung trên.</li>
                  <li>Nhấn nút <strong className="text-gold-300">"ĐÃ CHUYỂN"</strong> bên dưới.</li>
                  <li>Admin sẽ kiểm tra biến động số dư Eximbank và tiến hành nâng cấp tài khoản ngay lập tức.</li>
                </ol>
              </div>
            </div>

            {/* KHU VỰC NÚT "ĐÃ CHUYỂN" (SPAM TỐI ĐA 5 LẦN) */}
            <div className="space-y-4 pt-4 border-t border-mystic-500/20">
              {/* Thông báo phản hồi sau khi ấn */}
              {reportSuccess && (
                <div className="glass-card p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-100 font-medium leading-relaxed">{reportSuccess}</p>
                </div>
              )}

              {/* Nút bấm ĐÃ CHUYỂN */}
              <button
                type="button"
                onClick={handleReportPaid}
                disabled={reporting || isCompleted || clickCount >= 5}
                className={`w-full py-4 rounded-xl font-display font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white cursor-not-allowed opacity-80'
                    : clickCount >= 5
                    ? 'bg-night-800 text-gray-400 border border-mystic-500/20 cursor-not-allowed'
                    : 'btn-gold shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {reporting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Đang gửi thông báo cho Admin...</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-white" />
                    <span>ĐƠN HÀNG ĐÃ HOÀN TẤT</span>
                  </>
                ) : (
                  <>
                    <BellRing className="w-6 h-6 text-night-900" />
                    <span>TÔI ĐÃ CHUYỂN KHOẢN ({clickCount}/5 LẦN)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                <span>Bạn có thể nhấn tối đa 5 lần để nhắc Admin</span>
                <span className="font-semibold text-gold-300">Đã ấn: {clickCount}/5 lần</span>
              </div>

              {/* Liên hệ hỗ trợ trực tiếp 2 founders */}
              <div className="pt-2 text-center text-sm text-gray-400">
                Cần hỗ trợ kích hoạt gấp? Nhắn Zalo:{' '}
                <a
                  href={FOUNDERS[0].zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mystic-300 font-bold hover:underline"
                >
                  {FOUNDERS[0].phone} (Quang - Founder)
                </a>{' '}
                hoặc{' '}
                <a
                  href={FOUNDERS[1].zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mystic-300 font-bold hover:underline"
                >
                  {FOUNDERS[1].phone} (Hoàng - Co-Founder)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
