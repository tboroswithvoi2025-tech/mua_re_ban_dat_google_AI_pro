import { Sparkles, ArrowRight, Tag, Shield, HeadphonesIcon } from 'lucide-react'

const HERO_BG = 'https://images.pexels.com/photos/11814657/pexels-photo-11814657.jpeg?auto=compress&cs=tinysrgb&w=1600'

export default function Hero() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG}
          alt="Fantasy marketplace"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-900/70 via-night-900/80 to-night-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-mystic-950/40 via-transparent to-abyss-950/40" />
      </div>

      {/* Floating crystals */}
      <div className="absolute top-1/4 left-10 w-20 h-20 opacity-20 animate-float-slow hidden md:block">
        <div className="w-full h-full bg-gradient-to-br from-mystic-400 to-mystic-600 rounded-lg rotate-45 blur-sm" />
      </div>
      <div className="absolute top-1/3 right-16 w-16 h-16 opacity-15 animate-float-medium hidden md:block">
        <div className="w-full h-full bg-gradient-to-br from-gold-300 to-gold-500 rounded-lg rotate-12 blur-sm" />
      </div>
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12 opacity-20 animate-float-fast hidden md:block">
        <div className="w-full h-full bg-gradient-to-br from-abyss-300 to-abyss-500 rounded-full blur-sm" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mystic-500/10 border border-mystic-400/30 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span className="text-sm text-mystic-200 font-medium">Fantasy Digital Marketplace</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white text-glow leading-tight animate-fade-in-up">
          NGUỒN HÀNG
          <br />
          <span className="bg-gradient-to-r from-mystic-300 via-gold-300 to-abyss-300 bg-clip-text text-transparent">
            TỰ CUNG
          </span>
        </h1>

        {/* Headline */}
        <p className="mt-6 text-xl sm:text-2xl md:text-3xl font-display font-medium text-gold-200 text-glow-gold animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          KHAI MỞ THẾ GIỚI CÔNG NGHỆ – TỐI ƯU CHI PHÍ
        </p>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Khám phá những dịch vụ công nghệ và AI cao cấp với mức giá hợp lý.
          Nguồn hàng chủ động, quy trình đặt hàng rõ ràng và hỗ trợ khách hàng trực tiếp.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={() => scrollTo('#products')} className="btn-primary text-base">
            KHÁM PHÁ CỬA HÀNG
            <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => scrollTo('#pricing')} className="btn-outline text-base">
            <Tag className="w-5 h-5" />
            XEM BẢNG GIÁ
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float-medium">
        <div className="w-6 h-10 border-2 border-mystic-400/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-mystic-400/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  )
}
