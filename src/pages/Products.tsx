import { useEffect, useState } from 'react'
import {
  Eye,
  ShoppingBag,
  ShoppingCart,
  Clock,
  Mail,
  Package,
  Plus,
  Minus,
  Check,
  ArrowRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import {
  formatVND,
  BADGE_LABELS,
  BADGE_COLORS,
  STOCK_LABELS,
  STOCK_COLORS,
  formatProductName,
  getProductImage,
} from '@/lib/utils'
import { useCart } from '@/context/CartContext'

interface Props {
  onSelectProduct: (product: Product) => void
  onBuyProduct: (product: Product) => void
}

export default function Products({ onSelectProduct }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('ALL')

  // Số lượng sản phẩm hiện sẵn trên từng thẻ
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  // Trạng thái vừa thêm vào giỏ để hiện feedback tạm thời
  const [addedNotice, setAddedNotice] = useState<Record<string, boolean>>({})

  const { addToCart, openCart, totalCount, totalAmount } = useCart()

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      const prods = (data as Product[]) ?? []
      setProducts(prods)

      // Khởi tạo số lượng mặc định là 1 cho từng sản phẩm
      const initialQty: Record<string, number> = {}
      prods.forEach((p) => {
        initialQty[p.id] = 1
      })
      setQuantities(initialQty)
      setLoading(false)
    })()
  }, [])

  const handleQtyChange = (productId: string, newQty: number) => {
    const validQty = Math.max(1, Math.min(50, newQty))
    setQuantities((prev) => ({
      ...prev,
      [productId]: validQty,
    }))
  }

  // Thêm vào giỏ hàng
  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] || 1
    addToCart(product, qty)

    // Hiển thị thông báo "Đã thêm" trên nút trong 1.8s
    setAddedNotice((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => {
      setAddedNotice((prev) => ({ ...prev, [product.id]: false }))
    }, 1800)
  }

  // Mua ngay -> Thêm vào giỏ và mở ngay Giỏ hàng lớn
  const handleBuyNow = (product: Product) => {
    const qty = quantities[product.id] || 1
    addToCart(product, qty)
    openCart()
  }

  const filteredProducts = products.filter((p) => {
    if (filterType === 'ALL') return true
    if (filterType === 'GOOGLE') {
      const n = (p.name || '').toLowerCase()
      const s = (p.slug || '').toLowerCase()
      return n.includes('google') || n.includes('gemini') || s.includes('gemini') || s.includes('google')
    }
    if (filterType === 'CAPCUT') {
      return (p.name || '').toLowerCase().includes('capcut') || (p.slug || '').toLowerCase().includes('capcut')
    }
    if (filterType === 'CANVA') {
      return (p.name || '').toLowerCase().includes('canva') || (p.slug || '').toLowerCase().includes('canva')
    }
    return true
  })

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-500/15 border border-mystic-400/30 mb-4">
            <Package className="w-5 h-5 text-mystic-300" />
            <span className="text-sm font-bold text-mystic-200 uppercase tracking-wider">Khu chợ số Fantasy</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white text-glow mb-4">
            Sản Phẩm Dịch Vụ AI & Phần Mềm
          </h1>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Chọn số lượng và thêm vào giỏ hàng hoặc mua ngay tài khoản Google AI Pro, CapCut Pro và Canva Pro chất lượng cao.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { id: 'ALL', label: 'Tất cả sản phẩm' },
            { id: 'GOOGLE', label: 'Google AI Pro (Gemini)' },
            { id: 'CAPCUT', label: 'CapCut Pro' },
            { id: 'CANVA', label: 'Canva Pro & Business' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                filterType === cat.id
                  ? 'bg-gradient-to-r from-mystic-600 to-abyss-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] border border-mystic-400/50'
                  : 'bg-night-800/80 text-gray-300 border border-mystic-500/20 hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-night-700/50" />
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-night-700/50 rounded w-3/4" />
                  <div className="h-4 bg-night-700/50 rounded w-1/2" />
                  <div className="h-10 bg-night-700/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-gray-400 text-base">
            Không tìm thấy sản phẩm trong danh mục này.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, i) => {
              const displayName = formatProductName(product)
              const displayImg = getProductImage(product)
              const currentQty = quantities[product.id] || 1
              const isAdded = addedNotice[product.id]

              return (
                <div
                  key={product.id}
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden group flex flex-col justify-between border border-mystic-500/20 transition-all duration-300"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image with badges */}
                  <div>
                    <div className="relative h-52 overflow-hidden bg-night-950">
                      <img
                        src={displayImg}
                        alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/40 to-transparent" />

                      {/* Badge Top Right */}
                      {product.badge && (
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-sm font-bold px-3 py-1 rounded-full shadow-lg ${BADGE_COLORS[product.badge]} animate-glow-pulse`}
                          >
                            {BADGE_LABELS[product.badge]}
                          </span>
                        </div>
                      )}

                      {/* Stock Status Top Left */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full bg-night-900/90 backdrop-blur-md border border-white/10 ${STOCK_COLORS[product.stock_status]}`}
                        >
                          {STOCK_LABELS[product.stock_status]}
                        </span>
                      </div>

                      {/* Thời hạn sử dụng trực tiếp trên ảnh */}
                      {product.duration && (
                        <div className="absolute bottom-3 right-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-night-950/85 backdrop-blur-md border border-gold-400/50 text-gold-300 font-extrabold text-xs sm:text-sm shadow-xl">
                            <Clock className="w-3.5 h-3.5 text-gold-400" />
                            <span>{product.duration}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3.5">
                      {/* Product Name with duration included */}
                      <h3 className="font-display font-bold text-white text-base sm:text-lg leading-snug min-h-[3rem] line-clamp-2">
                        {displayName}
                      </h3>

                      {/* Meta Tags */}
                      <div className="space-y-1.5 text-sm text-gray-300">
                        {product.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-mystic-400 flex-shrink-0" />
                            <span className="font-medium">
                              Thời hạn: <strong className="text-white">{product.duration}</strong>
                            </span>
                          </div>
                        )}
                        {product.delivery_mode && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-abyss-400 flex-shrink-0" />
                            <span className="font-medium">
                              Hình thức: <span className="text-gray-200">{product.delivery_mode}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="pt-2 flex items-baseline justify-between border-t border-mystic-500/15">
                        <div>
                          <div className="text-xs text-gray-400">Đơn giá</div>
                          <div className="font-display text-2xl font-bold text-gold-300 text-glow-gold">
                            {formatVND(product.price)}
                          </div>
                        </div>
                        {product.product_type && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-mystic-500/20 text-mystic-200 border border-mystic-400/30 uppercase tracking-wide">
                            {product.product_type}
                          </span>
                        )}
                      </div>

                      {/* CƠ CHẾ CHỌN SỐ LƯỢNG HIỆN SẴN TRÊN TỪNG THẺ */}
                      <div className="p-2.5 bg-night-950/80 rounded-xl border border-mystic-500/25 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Số lượng mua:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, currentQty - 1)}
                            disabled={currentQty <= 1}
                            className="w-7 h-7 rounded-lg border border-mystic-400/30 flex items-center justify-center text-white hover:bg-mystic-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-base text-gold-300">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, currentQty + 1)}
                            disabled={currentQty >= 50}
                            className="w-7 h-7 rounded-lg border border-mystic-400/30 flex items-center justify-center text-white hover:bg-mystic-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Thêm giỏ & Mua ngay & Chi tiết */}
                  <div className="p-5 pt-0 space-y-2">
                    <div className="flex gap-2">
                      {/* Nút thêm vào giỏ */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_status === 'out_of_stock'}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 ${
                          isAdded
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-night-900 hover:bg-mystic-500/15 border-mystic-400/40 text-mystic-200'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Đã thêm!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 text-gold-400" />
                            <span>Thêm vào giỏ</span>
                          </>
                        )}
                      </button>

                      {/* Nút MUA NGAY (Mở giỏ hàng lớn) */}
                      <button
                        type="button"
                        onClick={() => handleBuyNow(product)}
                        disabled={product.stock_status === 'out_of_stock'}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-mystic-600 to-abyss-600 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>MUA NGAY</span>
                      </button>
                    </div>

                    {/* Nút xem chi tiết */}
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="w-full py-1.5 text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem chi tiết tính năng gói</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FLOATING STICKY CART BAR Ở ĐÁY MÀN HÌNH NẾU ĐÃ CÓ SẢN PHẨM TRONG GIỎ */}
      {totalCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] glass-card p-3 sm:p-4 rounded-2xl border-2 border-gold-500/40 bg-night-900/95 shadow-2xl flex items-center justify-between gap-3 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-300 relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[1.2rem] h-4.5 text-[10px] font-bold rounded-full bg-ember-500 text-white flex items-center justify-center">
                {totalCount}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-300 font-medium">Giỏ hàng: <strong className="text-white">{totalCount}</strong> món</div>
              <div className="font-display text-lg font-bold text-gold-300">{formatVND(totalAmount)}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCart}
            className="btn-gold px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 flex-shrink-0 shadow-lg"
          >
            <span>MỞ GIỎ HÀNG & THANH TOÁN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
