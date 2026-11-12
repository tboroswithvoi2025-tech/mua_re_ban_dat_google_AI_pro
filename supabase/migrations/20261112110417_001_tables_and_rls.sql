/*
# NGUỒN HÀNG TỰ CUNG — Tables & RLS

Creates all 10 tables with primary keys, foreign keys, constraints, indexes,
RLS policies, and grants. SECURITY DEFINER functions come in a follow-up migration
to avoid ordering issues (they reference tables created here).

## Tables
1. profiles — customer info from Google OAuth, unique 6-digit customer_code
2. user_roles — admin/customer role (backend-only modification)
3. products — 7 digital products, admin-editable
4. orders — customer orders with price snapshot + status workflow
5. payment_methods — bank transfer info, admin-managed
6. payment_submissions — customer "I paid" reports + admin verification
7. notifications — realtime user notifications
8. order_events — status change history per order
9. admin_audit_logs — all admin actions
10. site_settings — key-value store for policies, contact, FAQ, footer

## Security
- RLS enabled on every table
- Grant minimum privileges per role
- is_admin() helper created in the functions migration (002) and used by policies added there
- This migration creates tables + base grants + simple policies; function-dependent policies are in 002
*/

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  customer_code text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO service_role;

-- ============================================================
-- 2. user_roles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO service_role;

-- ============================================================
-- 3. products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  product_type text,
  duration text,
  price integer NOT NULL CHECK (price >= 0),
  delivery_mode text,
  description text,
  warranty_note text,
  warranty_policy text,
  badge text CHECK (badge IN ('BAN_CHAY', 'PHO_BIEN', NULL)),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  stock_status text NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'preorder')),
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO service_role;

DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products" ON public.products
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 4. orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_code text NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name_snapshot text NOT NULL,
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  target_email text,
  delivery_mode text,
  customer_note text,
  order_status text NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (order_status IN (
    'PENDING_PAYMENT','CUSTOMER_REPORTED_PAID','PAYMENT_VERIFIED',
    'PROCESSING','COMPLETED','CANCELLED','REFUND_PENDING','REFUNDED'
  )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(order_code);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT SELECT, UPDATE ON public.orders TO service_role;

-- ============================================================
-- 5. payment_methods
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.payment_methods TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO service_role;

DROP POLICY IF EXISTS "public_read_payment_methods" ON public.payment_methods;
CREATE POLICY "public_read_payment_methods" ON public.payment_methods
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 6. payment_submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount >= 0),
  transfer_reference text,
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFIED', 'REJECTED')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  admin_note text
);

CREATE INDEX IF NOT EXISTS idx_payment_submissions_order ON public.payment_submissions(order_id);

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.payment_submissions TO authenticated;
GRANT SELECT, UPDATE ON public.payment_submissions TO service_role;

-- ============================================================
-- 7. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO service_role;

-- ============================================================
-- 8. order_events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  note text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order ON public.order_events(order_id);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.order_events TO authenticated;
GRANT SELECT, INSERT ON public.order_events TO service_role;

-- ============================================================
-- 9. admin_audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_logs(created_at);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.admin_audit_logs TO service_role;

-- ============================================================
-- 10. site_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO service_role;

DROP POLICY IF EXISTS "public_read_settings" ON public.site_settings;
CREATE POLICY "public_read_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER payment_methods_updated_at BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
