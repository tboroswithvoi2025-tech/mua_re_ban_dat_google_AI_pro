import { Sparkles, ArrowRight, ShoppingBag } from 'lucide-react'
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-mystic-500/15 border border-mystic-400/30 mb-8 animate-fade-in">
          <Sparkles className="w-5 h-5 text-gold-400" />
          <span className="text-sm sm:text-base text-mystic-200 font-bold uppercase tracking-wider">
            Fantasy Digital Marketplace
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-white text-glow leading-tight animate-fade-in-up">
          Mua bán
          <br />
          <span className="bg-gradient-to-r from-mystic-300 via-gold-300 to-abyss-300 bg-clip-text text-transparent">
            Google AI pro, CapCut pro, Canva pro
          </span>
        </h1>

        {/* Headline */}
        <p
          className="mt-6 text-xl sm:text-2xl md:text-3xl font-display font-bold text-gold-200 text-glow-gold animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          KHAI MỞ THẾ GIỚI CÔNG NGHỆ – TỐI ƯU CHI PHÍ
        </p>

        {/* Subtitle */}
        <p
          className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Khu chợ kỹ thuật số chuyên cung cấp tài khoản Google AI Pro, CapCut Pro và Canva Pro bản quyền với mức giá tối ưu nhất. Nguồn hàng chủ động, kích hoạt tự động và bảo hành trách nhiệm.
        </p>

        {/* Button */}
        <div
          className="mt-10 flex justify-center animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
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
