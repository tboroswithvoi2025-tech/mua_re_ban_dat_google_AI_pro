import { Sparkles, Heart, Building2, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DEFAULT_BANK, FOUNDERS } from '@/lib/utils'

export default function Footer() {
  return (
    <footer className="relative border-t border-mystic-500/20 mt-20 bg-night-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-gold-400" />
              <div>
                <div className="font-display font-bold text-lg text-white">Mua bán Google AI pro, CapCut pro, Canva pro</div>
                <div className="font-display text-xs sm:text-sm text-mystic-300">Fantasy Digital Marketplace</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Hệ thống cung cấp tài khoản Google AI Pro, CapCut Pro và Canva Pro chất lượng cao với giá rẻ nhất thị trường. Nguồn hàng chủ động, cam kết bảo hành trách nhiệm và hỗ trợ kỹ thuật trực tiếp từ 2 founders.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-3">Điều hướng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Liên hệ 2 Founders
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ & Thanh toán */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-3">Hỗ trợ & Thanh toán</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span>
                  {DEFAULT_BANK.bank_name}: <strong className="font-mono text-gold-300">{DEFAULT_BANK.account_number}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-mystic-400 flex-shrink-0 mt-0.5" />
                <span>Zalo Quang (Founder): {FOUNDERS[0].phone}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-mystic-400 flex-shrink-0 mt-0.5" />
                <span>Zalo Hoàng (Co-Founder): {FOUNDERS[1].phone}</span>
              </li>
              <li className="text-xs text-gray-400 pt-1">
                * Chuyển khoản theo cú pháp: <strong className="text-white font-mono">mã_đơn_chuyentien</strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-mystic-500/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Mua bán Google AI pro, CapCut pro, Canva pro. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-sm">
            Made with <Heart className="w-4 h-4 text-mystic-400" /> for Digital Marketplace
          </p>
        </div>
      </div>
    </footer>
  )
}
