import { X, Clock, Mail, Tag, Shield, FileText, ShoppingBag, Sparkles, Check } from 'lucide-react'
import type { Product } from '@/types'
import { formatVND, BADGE_LABELS, BADGE_COLORS, STOCK_LABELS, STOCK_COLORS } from '@/lib/utils'

interface Props {
  product: Product | null
  onClose: () => void
  onBuy: (product: Product) => void
}

export default function ProductDetailModal({ product, onClose, onBuy }: Props) {
  if (!product) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-night-900/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-2xl">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-mystic-900 to-night-800 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-mystic-500/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night-800 via-transparent to-transparent" />
          {product.badge && (
            <div className="absolute top-4 right-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg ${BADGE_COLORS[product.badge]}`}>
                {BADGE_LABELS[product.badge]}
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-night-900/60 backdrop-blur-sm flex items-center justify-center hover:bg-night-900/80 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">{product.name}</h2>
              {product.product_type && (
                <span className="text-xs text-mystic-300 uppercase tracking-wide mt-1 inline-block">
                  {product.product_type}
                </span>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-display text-2xl font-bold text-gold-300 text-glow-gold">
                {formatVND(product.price)}
              </div>
              <div className={`text-xs ${STOCK_COLORS[product.stock_status]}`}>
                {STOCK_LABELS[product.stock_status]}
              </div>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {product.duration && (
              <div className="glass-card p-3 bg-night-900/40">
                <div className="flex items-center gap-2 text-mystic-300 text-xs mb-1">
                  <Clock className="w-4 h-4" /> Thời hạn
                </div>
                <div className="text-white text-sm font-medium">{product.duration}</div>
              </div>
            )}
            {product.delivery_mode && (
              <div className="glass-card p-3 bg-night-900/40">
                <div className="flex items-center gap-2 text-abyss-300 text-xs mb-1">
                  <Mail className="w-4 h-4" /> Hình thức nhận
                </div>
                <div className="text-white text-sm font-medium">{product.delivery_mode}</div>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-display font-semibold text-white text-sm mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-mystic-400" /> Nội dung quyền lợi
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Warranty */}
          {product.warranty_policy && (
            <div className="mb-6 glass-card p-4 bg-emerald-500/5 border-emerald-500/20">
              <h3 className="font-display font-semibold text-emerald-300 text-sm mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Bảo hành
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{product.warranty_policy}</p>
            </div>
          )}

          {/* Terms */}
          <div className="mb-6 glass-card p-4 bg-abyss-500/5 border-abyss-500/20">
            <h3 className="font-display font-semibold text-abyss-300 text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Điều kiện sử dụng
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Đây là dịch vụ do bên thứ ba cung cấp, không phải website chính thức của Google.
              Thành viên phải đáp ứng điều kiện tham gia Family Group hiện hành.
              Cần cùng quốc gia với người quản lý nhóm.
              Tài khoản Google Workspace hoặc tài khoản do tổ chức quản lý có thể không đủ điều kiện.
              Cần kiểm tra giới hạn thay đổi nhóm gia đình trong 12 tháng.
              Một số quyền lợi AI có giới hạn dùng chung cho cả nhóm.
            </p>
          </div>

          {/* Buy button */}
          <button
            onClick={() => onBuy(product)}
            disabled={product.stock_status === 'out_of_stock'}
            className="btn-primary w-full text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-5 h-5" />
            MUA NGAY – {formatVND(product.price)}
          </button>
        </div>
      </div>
    </div>
  )
}
