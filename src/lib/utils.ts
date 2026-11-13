export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CUSTOMER_REPORTED_PAID: 'Đã báo chuyển tiền',
  PAYMENT_VERIFIED: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý nâng tài khoản',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REFUND_PENDING: 'Đang hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  CUSTOMER_REPORTED_PAID: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  PAYMENT_VERIFIED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  PROCESSING: 'bg-mystic-500/20 text-mystic-300 border-mystic-500/40',
  COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/40',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/40',
  REFUND_PENDING: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  REFUNDED: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
}

export const BADGE_LABELS: Record<string, string> = {
  BAN_CHAY: 'BÁN CHẠY',
  PHO_BIEN: 'PHỔ BIẾN',
}

export const BADGE_COLORS: Record<string, string> = {
  BAN_CHAY: 'bg-gradient-to-r from-gold-400 to-ember-500 text-night-900',
  PHO_BIEN: 'bg-gradient-to-r from-mystic-400 to-abyss-400 text-white',
}

export const STOCK_LABELS: Record<string, string> = {
  in_stock: 'Còn hàng',
  out_of_stock: 'Hết hàng',
  preorder: 'Đặt trước',
}

export const STOCK_COLORS: Record<string, string> = {
  in_stock: 'text-emerald-400',
  out_of_stock: 'text-red-400',
  preorder: 'text-amber-400',
}

/** Thông tin ngân hàng mặc định theo yêu cầu */
export const DEFAULT_BANK = {
  bank_name: 'Eximbank',
  account_number: '0357722698',
  account_holder: 'TRAN NHAT QUANG',
}

/** Thông tin 2 Founders */
export const FOUNDERS = [
  {
    name: 'Trần Nhật Quang',
    role: 'Founder',
    phone: '0357722698',
    zaloLink: 'https://zalo.me/0357722698',
    facebookLink: 'https://www.facebook.com/tran.nhatquang.5686?rdid=AhLsDHX0R6eqsJay&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19vhp59qQm%23',
    bankName: 'Eximbank',
    accountNumber: '0357722698',
    accountHolder: 'TRAN NHAT QUANG',
  },
  {
    name: 'Hoàng James',
    role: 'Co-Founder',
    phone: '0334164570',
    zaloLink: 'https://zalo.me/0334164570',
    facebookLink: 'https://www.facebook.com/hoang.james.78087',
    bankName: 'MB Bank',
    accountNumber: '0334164570',
    accountHolder: 'HOANG JAMES',
  },
]

/** Sinh mã đơn hàng ngẫu nhiên gồm đúng 7 chữ số (ví dụ: 0128192) */
export function generate7DigitOrderCode(): string {
  // Sinh số ngẫu nhiên từ 0 đến 9999999 và pad thành 7 chữ số
  const num = Math.floor(Math.random() * 10000000)
  return String(num).padStart(7, '0')
}

/** Chuẩn hóa tên sản phẩm: vừa có tên chính vừa có thời hạn trong tên */
export function formatProductName(product: { name: string; duration?: string | null; slug?: string }): string {
  let name = product.name.trim()

  // Chuẩn hóa tên cũ sang thương hiệu mới Google AI Pro
  if (name.includes('Gemini Pro 4Argon + Gg Pro 5TB (Host)')) {
    name = 'Google AI Pro (Host) + Google One 5TB'
  } else if (name.includes('Gemini Pro 4Argon + Gg Pro 5TB (Member)')) {
    if (name.includes('Mail chính chủ') || product.slug?.includes('member-1m')) {
      name = 'Google AI Pro 1 Member (Mail chính chủ)'
    } else {
      name = 'Google AI Pro 1 Member (Mail riêng)'
    }
  }

  // Tách bỏ nếu đã có đuôi gạch nối thời hạn
  const cleanName = name.replace(/\s*[—–-]\s*\d+\s*(tháng|năm|ngày).*$/i, '').trim()

  if (product.duration && !cleanName.toLowerCase().includes(product.duration.toLowerCase())) {
    return `${cleanName} - ${product.duration}`
  }

  return cleanName
}

/** Lấy hình ảnh chuẩn cho từng loại gian hàng */
export function getProductImage(product: { slug?: string; name?: string; image_url?: string | null }): string {
  const name = (product.name || '').toLowerCase()
  const slug = (product.slug || '').toLowerCase()

  // Google AI Pro / Gemini
  if (name.includes('gemini') || name.includes('google ai') || slug.includes('gemini') || slug.includes('google')) {
    // Ảnh Google AI Gemini chính chủ, hiệu ứng vũ trụ AI chuyên nghiệp
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=800'
  }

  // CapCut Pro
  if (name.includes('capcut') || slug.includes('capcut')) {
    // Ảnh CapCut Pro video editing chính thức
    return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=compress&cs=tinysrgb&w=800'
  }

  // Canva Pro
  if (name.includes('canva') || slug.includes('canva')) {
    // Ảnh Canva design toolkit hiện đại
    return 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=compress&cs=tinysrgb&w=800'
  }

  return product.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=800'
}

/** Kiểm tra sản phẩm có cần khách điền địa chỉ Gmail để nâng cấp không */
export function productNeedsEmail(product: { name: string; slug?: string; delivery_mode?: string | null }): boolean {
  const name = (product.name || '').toLowerCase()
  const slug = (product.slug || '').toLowerCase()
  const mode = product.delivery_mode || ''
  const isGoogle = name.includes('google') || name.includes('gemini') || slug.includes('google') || slug.includes('gemini')
  return mode === 'Mail chính chủ' || mode === 'Mail riêng' || (isGoogle && mode !== 'Mail được cấp')
}
