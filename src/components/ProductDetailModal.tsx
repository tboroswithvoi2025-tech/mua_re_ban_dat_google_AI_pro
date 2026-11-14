import { useState, useEffect } from 'react'
import { X, Clock, Mail, Tag, Shield, FileText, ShoppingBag, ShoppingCart, Plus, Minus, Check } from 'lucide-react'
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
  product: Product | null
  onClose: () => void
  onBuy?: (product: Product) => void
}

export default function ProductDetailModal({ product, onClose }: Props) {
  const { addToCart, openCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (product) {
      setQty(1)
      setAdded(false)
    }
  }, [product])

  if (!product) return null

  const displayName = formatProductName(product)
  const displayImg = getProductImage(product)

  const handleAddToCart = () => {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart(product, qty)
    onClose()
    openCart()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-night-900/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-mystic-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-60 sm:h-72 overflow-hidden rounded-t-2xl bg-night-950">
          <img src={displayImg} alt={displayName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/30 to-transparent" />
          {product.badge && (
            <div className="absolute top-4 right-4">
              <span className={`text-sm font-bold px-4 py-1.5 rounded-full shadow-lg ${BADGE_COLORS[product.badge]}`}>
                {BADGE_LABELS[product.badge]}
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-night-900/70 backdrop-blur-md flex items-center justify-center text-white hover:bg-night-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Thời hạn sử dụng trực tiếp trên ảnh */}
          {product.duration && (
            <div className="absolute bottom-4 right-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-night-950/85 backdrop-blur-md border border-gold-400/50 text-gold-300 font-extrabold text-sm shadow-xl">
                <Clock className="w-4 h-4 text-gold-400" />
                <span>Thời hạn: {product.duration}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">{displayName}</h2>
              {product.product_type && (
                <span className="text-sm font-bold text-mystic-300 uppercase tracking-wider mt-1.5 inline-block">
                  Phân loại: {product.product_type}
                </span>
              )}
            </div>
            <div className="sm:text-right flex-shrink-0">
              <div className="font-display text-3xl font-bold text-gold-300 text-glow-gold">
                {formatVND(product.price)}
              </div>
              <div className={`text-sm font-semibold mt-1 ${STOCK_COLORS[product.stock_status]}`}>
                {STOCK_LABELS[product.stock_status]}
              </div>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {product.duration && (
              <div className="glass-card p-4 bg-night-900/60 rounded-xl">
                <div className="flex items-center gap-2 text-mystic-300 text-sm font-medium mb-1">
                  <Clock className="w-4 h-4" /> Thời hạn dịch vụ
                </div>
                <div className="text-white text-base font-bold">{product.duration}</div>
              </div>
            )}
            {product.delivery_mode && (
              <div className="glass-card p-4 bg-night-900/60 rounded-xl">
                <div className="flex items-center gap-2 text-abyss-300 text-sm font-medium mb-1">
                  <Mail className="w-4 h-4" /> Hình thức nhận
                </div>
                <div className="text-white text-base font-bold">{product.delivery_mode}</div>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-mystic-400" /> Nội dung quyền lợi & Tính năng
              </h3>
              <p className="text-gray-200 text-base leading-relaxed bg-night-900/40 p-4 rounded-xl border border-mystic-500/15">
                {product.description}
              </p>
            </div>
          )}

          {/* Warranty */}
          {product.warranty_policy && (
            <div className="glass-card p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
              <h3 className="font-display font-bold text-emerald-300 text-base flex items-center gap-2">
                <Shield className="w-5 h-5" /> Chính sách bảo hành
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{product.warranty_policy}</p>
            </div>
          )}

          {/* Terms */}
          <div className="glass-card p-5 bg-abyss-500/10 border border-abyss-500/30 rounded-xl space-y-2">
            <h3 className="font-display font-bold text-abyss-300 text-base flex items-center gap-2">
              <FileText className="w-5 h-5" /> Lưu ý khi sử dụng
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Dịch vụ Google AI Pro và Google One 5TB được hỗ trợ kích hoạt trực tiếp theo Gmail bạn cung cấp. Tài khoản nhận quyền không thuộc Google Workspace của tổ chức/trường học và chưa bị vượt quá giới hạn đổi Family Group trong năm.
            </p>
          </div>

          {/* Quantity Selector & Buy Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3.5 bg-night-950/70 rounded-xl border border-mystic-500/20">
              <span className="text-sm font-semibold text-gray-200">Chọn số lượng mua:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="w-9 h-9 rounded-xl border border-mystic-400/40 flex items-center justify-center text-white hover:bg-mystic-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono font-bold text-xl text-gold-300">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(50, qty + 1))}
                  disabled={qty >= 50}
                  className="w-9 h-9 rounded-xl border border-mystic-400/40 flex items-center justify-center text-white hover:bg-mystic-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock_status === 'out_of_stock'}
                className={`py-3.5 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 border transition-all ${
                  added
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'btn-outline text-mystic-200 border-mystic-400/40 hover:bg-mystic-500/15'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Đã thêm vào giỏ!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 text-gold-400" />
                    <span>Thêm vào giỏ ({formatVND(product.price * qty)})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock_status === 'out_of_stock'}
                className="btn-primary py-3.5 px-4 font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-40"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>MUA NGAY</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
