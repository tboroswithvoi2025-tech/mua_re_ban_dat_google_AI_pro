import { Link } from 'react-router-dom'
import {
  Sparkles,
  Phone,
  MessageCircle,
  Facebook,
  ExternalLink,
  Building2,
} from 'lucide-react'
import Hero from '@/components/sections/Hero'
import { FOUNDERS, DEFAULT_BANK } from '@/lib/utils'

export default function Home() {
  return (
    <main className="space-y-16 pb-16">
      {/* 1. Hero Section - Tiêu đề to nhất + 3 cam kết ở giữa + Nút khám phá sản phẩm */}
      <Hero />

      {/* 2. THÔNG TIN LIÊN HỆ 2 FOUNDERS Ở CUỐI TRANG CHỦ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="glass-card p-8 sm:p-10 rounded-3xl border-2 border-gold-500/30 bg-night-900/80 space-y-8 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mystic-500/20 border border-mystic-400/30">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-bold text-mystic-200 uppercase tracking-wider">Hỗ Trợ Trực Tiếp</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-glow">
              Liên Hệ Trực Tiếp 2 Founders
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              Nếu bạn cần mua số lượng lớn, cần tư vấn gói Google AI Pro hoặc cần hỗ trợ kích hoạt khẩn cấp, vui lòng liên hệ trực tiếp với chúng tôi:
            </p>
          </div>

          {/* Cards 2 founders */}
          <div className="grid md:grid-cols-2 gap-6">
            {FOUNDERS.map((founder, i) => (
              <div
                key={i}
                className="glass-card p-6 rounded-2xl border border-mystic-500/25 space-y-5 bg-night-950/60"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mystic-600 to-abyss-600 flex items-center justify-center text-white font-display text-xl font-bold border border-mystic-400/30 shadow-md">
                    {founder.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{founder.name}</h3>
                    <p className="text-sm text-mystic-300 font-medium">{founder.role}</p>
                  </div>
                </div>

                <div className="glass-card p-3.5 bg-night-900/80 rounded-xl flex items-center justify-between border border-mystic-500/20">
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Phone className="w-4 h-4 text-mystic-400" />
                    <span>SĐT / Zalo:</span>
                  </div>
                  <a
                    href={`tel:${founder.phone}`}
                    className="font-mono text-base font-bold text-gold-300 hover:underline"
                  >
                    {founder.phone}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={founder.zaloLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>Chat Zalo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={founder.facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-2.5 text-sm font-bold flex items-center justify-center gap-2 text-white border-blue-500/40 hover:bg-blue-500/10"
                  >
                    <Facebook className="w-4 h-4 text-blue-400" />
                    <span>Facebook</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Ngân hàng Eximbank tóm tắt */}
          <div className="pt-4 border-t border-mystic-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <Building2 className="w-7 h-7 text-gold-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">Tài khoản thanh toán chính thức:</div>
                <div className="text-sm text-gray-300">
                  {DEFAULT_BANK.bank_name} - STK: <strong className="font-mono text-gold-300">{DEFAULT_BANK.account_number}</strong> ({DEFAULT_BANK.account_holder})
                </div>
              </div>
            </div>
            <Link to="/contact" className="btn-outline px-5 py-2.5 text-sm font-bold text-white flex-shrink-0">
              Xem trang liên hệ đầy đủ
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
