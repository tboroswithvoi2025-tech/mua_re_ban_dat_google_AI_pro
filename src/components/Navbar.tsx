import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Menu, X, Bell, LogOut, User, Package, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'

export default function Navbar() {
  const { user, profile, role, signInWithGoogle, signOut } = useAuth()
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setNotifOpen(false)
  }, [location])

  const navLinks = [
    { label: 'Trang chủ', href: '#hero' },
    { label: 'Bảng giá', href: '#pricing' },
    { label: 'Sản phẩm', href: '#products' },
    { label: 'Chính sách', href: '#policy' },
    { label: 'Liên hệ', href: '#contact' },
  ]

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.querySelector(href)
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-night-900/90 backdrop-blur-xl border-b border-mystic-500/15 shadow-lg shadow-night-900/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="w-7 h-7 text-mystic-400 group-hover:text-gold-400 transition-colors duration-300" />
              <div className="absolute inset-0 blur-md bg-mystic-400/30 group-hover:bg-gold-400/30 transition-colors duration-300" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-base text-white leading-tight tracking-wide">
                NGUỒN HÀNG
              </div>
              <div className="font-display text-xs text-mystic-300 leading-tight tracking-wider">
                TỰ CUNG
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-300 hover:text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ember-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-glow-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-card rounded-xl shadow-2xl">
                      <div className="flex items-center justify-between p-3 border-b border-mystic-500/15">
                        <span className="font-semibold text-white text-sm">Thông báo</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-mystic-300 hover:text-mystic-200"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">Chưa có thông báo</div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`w-full text-left p-3 border-b border-mystic-500/10 hover:bg-white/5 transition-colors ${
                              !n.is_read ? 'bg-mystic-500/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.is_read && (
                                <div className="w-2 h-2 rounded-full bg-mystic-400 mt-1.5 flex-shrink-0" />
                              )}
                              <div className={n.is_read ? 'pl-4' : ''}>
                                <div className="font-medium text-white text-sm">{n.title}</div>
                                <div className="text-gray-400 text-xs mt-0.5">{n.content}</div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Avatar'}
                        className="w-8 h-8 rounded-full object-cover border border-mystic-400/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mystic-500 to-abyss-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-white max-w-[100px] truncate">
                        {profile?.full_name || 'Khách'}
                      </div>
                      <div className="text-xs text-mystic-300">#{profile?.customer_code}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-3 border-b border-mystic-500/15">
                        <div className="text-sm font-medium text-white truncate">{profile?.email}</div>
                        <div className="text-xs text-mystic-300 mt-0.5">Mã KH: {profile?.customer_code}</div>
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" /> Tài khoản
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Package className="w-4 h-4" /> Đơn hàng
                      </Link>
                      {role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-gold-300 hover:bg-white/5 hover:text-gold-200 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" /> Quản trị
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/10 transition-colors border-t border-mystic-500/15"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button onClick={signInWithGoogle} className="btn-primary text-sm px-4 py-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="hidden sm:inline">Đăng nhập Google</span>
                <span className="sm:hidden">Đăng nhập</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
