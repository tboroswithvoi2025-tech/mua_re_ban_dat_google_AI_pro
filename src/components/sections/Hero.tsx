import { Sparkles, ArrowRight, ShoppingBag, Boxes, BadgeDollarSign, Headphones } from 'lucide-react'
import { Link } from 'react-router-dom'

const HERO_BG = 'https://images.pexels.com/photos/11814657/pexels-photo-11814657.jpeg?auto=compress&cs=tinysrgb&w=1600'

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG}
          alt="Fantasy marketplace"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-900/70 via-night-900/85 to-night-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-mystic-950/50 via-transparent to-abyss-950/50" />
      </div>

      {/* Floating crystals */}
      <div className="absolute top-1/4 left-10 w-24 h-24 opacity-20 animate-float-slow hidden md:block">
        <div className="w-full h-full bg-gradient-to-br from-mystic-400 to-mystic-600 rounded-2xl rotate-45 blur-sm" />
      </div>
      <div className="absolute top-1/3 right-16 w-20 h-20 opacity-20 animate-float-medium hidden md:block">
        <div className="w-full h-full bg-gradient-to-br from-gold-300 to-gold-500 rounded-2xl rotate-12 blur-sm" />
      </div>
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 opacity-20 animate-float-fast hidden md:block">
        <div className="w-full h-full bg-gradient-to-br from-abyss-300 to-abyss-500 rounded-full blur-sm" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-mystic-500/15 border border-mystic-400/30 mb-6 animate-fade-in">
          <Sparkles className="w-5 h-5 text-gold-400" />
          <span className="text-sm sm:text-base text-mystic-200 font-bold uppercase tracking-wider">
            Fantasy Digital Marketplace
          </span>
        </div>

        {/* Title - Phần chữ to nhất */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-white text-glow leading-tight animate-fade-in-up">
          Mua bán
          <br />
          <span className="bg-gradient-to-r from-mystic-300 via-gold-300 to-abyss-300 bg-clip-text text-transparent">
            Google AI pro, CapCut pro, Canva pro
          </span>
        </h1>

        {/* 3 Cam kết từ Ảnh 1 (thay thế hoàn toàn phần chữ khai mở thế giới công nghệ... bảo hành trách nhiệm) */}
        <div
          className="mt-8 glass-card p-6 sm:p-8 rounded-3xl border border-mystic-500/25 bg-night-900/70 shadow-2xl animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-mystic-500/20">
            <div className="space-y-2 pt-3 md:pt-0">
              <Boxes className="w-10 h-10 text-mystic-400 mx-auto" />
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">
                Nguồn Hàng Chủ Động
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Không qua trung gian, tài khoản ổn định tuyệt đối và kích hoạt nhanh.
              </p>
            </div>

            <div className="space-y-2 pt-5 md:pt-0 md:px-5">
              <BadgeDollarSign className="w-10 h-10 text-gold-400 mx-auto" />
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">
                Giá Siêu Ưu Đãi
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Tối ưu chi phí cho anh em trải nghiệm Google AI Pro và phần mềm đỉnh cao.
              </p>
            </div>

            <div className="space-y-2 pt-5 md:pt-0 md:pl-5">
              <Headphones className="w-10 h-10 text-abyss-400 mx-auto" />
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">
                Hỗ Trợ 2 Founders 24/7
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Kênh Zalo và Facebook trực tiếp, có mặt ngay khi bạn cần hỗ trợ kỹ thuật.
              </p>
            </div>
          </div>
        </div>

        {/* Khung nút KHÁM PHÁ SẢN PHẨM NGAY (giữ nguyên bên dưới 3 cam kết) */}
        <div
          className="mt-8 flex justify-center animate-fade-in-up"
          style={{ animationDelay: '0.25s' }}
        >
          <Link
            to="/products"
            className="btn-primary text-base sm:text-lg px-9 py-4 font-bold flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(139,92,246,0.4)]"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>KHÁM PHÁ SẢN PHẨM NGAY</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
