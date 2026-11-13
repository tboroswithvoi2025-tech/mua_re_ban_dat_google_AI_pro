import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, Menu, X, Phone, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const { role } = useAuth()
  const { totalCount, openCart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/products' },
    { label: 'Liên hệ', path: '/contact' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-night-900/95 backdrop-blur-xl border-b border-mystic-500/20 shadow-xl shadow-night-950/60'
          : 'bg-night-900/50 backdrop-blur-md border-b border-mystic-500/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-mystic-400 group-hover:text-gold-400 transition-colors duration-300" />
              <div className="absolute inset-0 blur-md bg-mystic-400/40 group-hover:bg-gold-400/40 transition-colors duration-300" />
            </div>
            <div>
              <div className="font-display font-bold text-sm sm:text-base text-white leading-tight tracking-wide">
                Mua bán
              </div>
              <div className="font-display text-xs sm:text-sm font-semibold text-gold-300 leading-tight tracking-wider">
                Google AI pro • CapCut • Canva
              </div>
            </div>
          </Link>

          {/* Desktop multipage navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-mystic-500/25 text-white border border-mystic-400/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Zalo, Giỏ Hàng & Admin link */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {role === 'admin' && (
              <Link
                to="/admin"
                className="btn-gold text-xs sm:text-sm px-3 py-2 font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* Nút Giỏ Hàng Lớn */}
            <button
              onClick={openCart}
              type="button"
              className="relative p-2 sm:px-3.5 sm:py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 hover:text-white border border-gold-500/30 flex items-center gap-2 transition-all group"
              title="Xem giỏ hàng"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 px-1.5 min-w-[1.2rem] h-4.5 text-[11px] font-bold rounded-full bg-ember-500 text-white flex items-center justify-center animate-glow-pulse shadow-md">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-bold">Giỏ hàng</span>
            </button>

            <a
              href="https://zalo.me/0357722698"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs sm:text-sm px-3 py-2 font-bold inline-flex items-center gap-1.5 text-mystic-200 border-mystic-500/40 hover:bg-mystic-500/10"
            >
              <Phone className="w-4 h-4 text-mystic-400" />
              <span className="hidden md:inline">Zalo</span>
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-mystic-500/20">
            {/* Giỏ hàng mobile */}
            <button
              onClick={() => {
                setMobileOpen(false)
                openCart()
              }}
              className="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-gold-300 bg-gold-500/10 border border-gold-500/30 mb-2"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gold-400" />
                <span>Giỏ hàng của bạn</span>
              </div>
              <span className="font-bold font-mono px-2.5 py-0.5 rounded-full bg-ember-500 text-white text-xs">
                {totalCount}
              </span>
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-mystic-500/25 text-white border border-mystic-400/40'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
