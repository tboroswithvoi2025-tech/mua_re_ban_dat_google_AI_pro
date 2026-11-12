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
  CUSTOMER_REPORTED_PAID: 'Đã báo chuyển khoản',
  PAYMENT_VERIFIED: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
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
