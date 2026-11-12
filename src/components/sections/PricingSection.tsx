import { useEffect, useState } from 'react'
import { Tag, ShieldCheck, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, SiteSettings } from '@/types'
import { formatVND, BADGE_LABELS, BADGE_COLORS } from '@/lib/utils'

export default function PricingSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
      setProducts((prods as Product[]) ?? [])

      const { data: settings } = await supabase.from('site_settings').select('key, value')
      const map: SiteSettings = {}
      ;(settings ?? []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value })
      setSettings(map)
      setLoading(false)
    })()
  }, [])

  return (
    <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-400/20 mb-4">
            <Tag className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-gold-200">Bảng giá</span>
          </div>
          <h2 className="section-title">Bảng giá tổng hợp</h2>
          <p className="section-subtitle">Giá được lấy trực tiếp từ database, cập nhật theo thời gian thực</p>
        </div>

        {/* Pricing table */}
        <div className="glass-card rounded-2xl overflow-hidden mb-16">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mystic-500/20">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-mystic-200">Sản phẩm</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-mystic-200 hidden sm:table-cell">Thời hạn</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gold-200">Giá</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-500">Đang tải...</td></tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-mystic-500/10 hover:bg-mystic-500/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{p.name}</span>
                          {p.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${BADGE_COLORS[p.badge]}`}>
                              {BADGE_LABELS[p.badge]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm hidden sm:table-cell">{p.duration}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-display font-bold text-gold-300 text-glow-gold">{formatVND(p.price)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warranty & Terms */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Warranty */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">Chính sách bảo hành</h3>
            </div>
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>{settings.warranty_policy || 'Chính sách bảo hành đang được cập nhật.'}</p>
              <div className="glass-card p-4 bg-night-900/40">
                <h4 className="text-mystic-200 font-medium mb-2">Sản phẩm có bảo hành</h4>
                <ul className="space-y-1 text-gray-400 text-xs">
                  <li>• Thời hạn bảo hành theo thời hạn gói dịch vụ</li>
                  <li>• Phạm vi: lỗi do nhà cung cấp, mất quyền lợi không do lỗi khách hàng</li>
                  <li>• Cách gửi yêu cầu: liên hệ Zalo hoặc Facebook</li>
                </ul>
              </div>
              <div className="glass-card p-4 bg-night-900/40 border-red-500/20">
                <h4 className="text-red-300 font-medium mb-2">Không được bảo hành</h4>
                <ul className="space-y-1 text-gray-400 text-xs">
                  <li>• Vi phạm điều kiện sử dụng của nhà cung cấp</li>
                  <li>• Thay đổi nhóm gia đình quá giới hạn</li>
                  <li>• Hành vi gian lận hoặc vi phạm điều khoản</li>
                </ul>
              </div>
              <p className="text-xs text-amber-300/70 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Sản phẩm chưa được cấu hình chính sách sẽ hiển thị trạng thái "đang cập nhật".
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-abyss-500/15 border border-abyss-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-abyss-300" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">Điều kiện sử dụng</h3>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed space-y-3">
              {(settings.terms_of_use || 'Điều kiện sử dụng đang được cập nhật.').split('.').filter((s) => s.trim()).map((sentence, i) => (
                <p key={i} className="flex items-start gap-2">
                  <span className="text-mystic-400 flex-shrink-0 mt-0.5">◆</span>
                  <span>{sentence.trim()}.</span>
                </p>
              ))}
              <p className="text-xs text-amber-300/70 flex items-start gap-2 pt-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Đây là dịch vụ do bên thứ ba cung cấp, không phải website chính thức của Google.
                Không sử dụng logo thương hiệu theo cách khiến khách hiểu nhầm website là đại lý chính thức.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
