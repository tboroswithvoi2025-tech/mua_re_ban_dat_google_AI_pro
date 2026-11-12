import { useEffect, useState } from 'react'
import { Eye, ShoppingBag, Clock, Mail, Check, X, Sparkles, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import { formatVND, BADGE_LABELS, BADGE_COLORS, STOCK_LABELS, STOCK_COLORS } from '@/lib/utils'

interface Props {
  onSelectProduct: (product: Product) => void
  onBuyProduct: (product: Product) => void
}

export default function ProductSection({ onSelectProduct, onBuyProduct }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
      setProducts((data as Product[]) ?? [])
      setLoading(false)
    })()
  }, [])

  return (
    <section id="products" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mystic-500/10 border border-mystic-400/20 mb-4">
            <Package className="w-4 h-4 text-mystic-300" />
            <span className="text-sm text-mystic-200">Gian hàng</span>
          </div>
          <h2 className="section-title">Các gian hàng sản phẩm</h2>
          <p className="section-subtitle">Khám phá khu chợ kỹ thuật số phong cách Fantasy</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-night-700/50" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-night-700/50 rounded w-3/4" />
                  <div className="h-3 bg-night-700/50 rounded w-1/2" />
                  <div className="h-8 bg-night-700/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="glass-card glass-card-hover rounded-2xl overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Image with badge */}
                <div className="relative h-48 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-mystic-900 to-night-800 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-mystic-500/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/30 to-transparent" />

                  {/* Badge - top right, not covering image center */}
                  {product.badge && (
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-lg ${BADGE_COLORS[product.badge]} animate-glow-pulse`}>
                        {BADGE_LABELS[product.badge]}
                      </span>
                    </div>
                  )}

                  {/* Stock status - top left */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full bg-night-900/80 backdrop-blur-sm border border-white/10 ${STOCK_COLORS[product.stock_status]}`}>
                      {STOCK_LABELS[product.stock_status]}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display font-semibold text-white text-sm leading-snug min-h-[2.5rem] line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Meta */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    {product.duration && (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-mystic-400" />
                        {product.duration}
                      </div>
                    )}
                    {product.delivery_mode && (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Mail className="w-3.5 h-3.5 text-abyss-400" />
                        {product.delivery_mode}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="font-display text-xl font-bold text-gold-300 text-glow-gold">
                      {formatVND(product.price)}
                    </span>
                    {product.product_type && (
                      <span className="text-[10px] text-mystic-300 uppercase tracking-wide">{product.product_type}</span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-mystic-400/30 text-mystic-200 hover:bg-mystic-500/10 transition-all duration-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      XEM CHI TIẾT
                    </button>
                    <button
                      onClick={() => onBuyProduct(product)}
                      disabled={product.stock_status === 'out_of_stock'}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-mystic-600 to-abyss-600 text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      MUA NGAY
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
