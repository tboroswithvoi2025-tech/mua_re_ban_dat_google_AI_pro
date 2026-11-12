export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  customer_code: string
  created_at: string
  updated_at: string
}

export interface UserRole {
  user_id: string
  role: 'admin' | 'customer'
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  product_type: string | null
  duration: string | null
  price: number
  delivery_mode: string | null
  description: string | null
  warranty_note: string | null
  warranty_policy: string | null
  badge: 'BAN_CHAY' | 'PHO_BIEN' | null
  status: 'active' | 'inactive'
  stock_status: 'in_stock' | 'out_of_stock' | 'preorder'
  image_url: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CUSTOMER_REPORTED_PAID'
  | 'PAYMENT_VERIFIED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'

export interface Order {
  id: string
  order_code: string
  customer_id: string
  customer_code: string
  product_id: string
  product_name_snapshot: string
  unit_price: number
  total_amount: number
  target_email: string | null
  delivery_mode: string | null
  customer_note: string | null
  order_status: OrderStatus
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  bank_name: string
  account_number: string
  account_holder: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentSubmission {
  id: string
  order_id: string
  amount: number
  transfer_reference: string | null
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  submitted_at: string
  verified_at: string | null
  verified_by: string | null
  admin_note: string | null
}

export interface Notification {
  id: string
  user_id: string
  title: string
  content: string | null
  is_read: boolean
  created_at: string
}

export interface OrderEvent {
  id: string
  order_id: string
  old_status: string | null
  new_status: string
  note: string | null
  changed_by: string | null
  created_at: string
}

export interface SiteSettings {
  [key: string]: string
}
