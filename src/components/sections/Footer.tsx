import { useEffect, useState } from 'react'
import { Sparkles, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { SiteSettings } from '@/types'

export default function Footer() {
  const [footerText, setFooterText] = useState('')

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'footer_text')
        .maybeSingle()
      if (data?.value) setFooterText(data.value)
    })()
  }, [])

  return (
    <footer className="relative border-t border-mystic-500/15 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-mystic-400" />
              <div>
                <div className="font-display font-bold text-white">Mua bán acc Google AI Pro</div>
                <div className="font-display text-xs text-mystic-300">Fantasy Digital Marketplace</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{footerText}</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-mystic-300 text-sm transition-colors">Trang chủ</Link></li>
              <li><Link to="/account" className="text-gray-400 hover:text-mystic-300 text-sm transition-colors">Tài khoản</Link></li>
              <li><Link to="/orders" className="text-gray-400 hover:text-mystic-300 text-sm transition-colors">Đơn hàng</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Thông tin</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Thanh toán chuyển khoản theo đơn hàng</li>
              <li>Hỗ trợ qua Zalo và Facebook</li>
              <li>Bảo hành theo thời hạn gói dịch vụ</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-mystic-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Mua bán acc Google AI Pro. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-mystic-400" /> for digital marketplace
          </p>
        </div>
      </div>
    </footer>
  )
}
