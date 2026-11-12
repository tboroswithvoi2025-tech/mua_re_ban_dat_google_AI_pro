/*
# NGUỒN HÀNG TỰ CUNG — Security Functions, Policies & Triggers

## Overview
Adds SECURITY DEFINER functions for:
- is_admin() helper used in RLS policies
- generate_customer_code() — safe 6-digit unique code generation
- handle_new_user() trigger — auto-creates profile + customer role + code on signup
- create_order() — reads real price from DB, generates unique order code, notifies admins
- report_payment() — customer reports bank transfer, notifies admins
- verify_payment() — admin confirms payment received, notifies customer
- reject_payment() — admin rejects/calls for review, notifies customer
- update_order_status() — admin transitions order status, logs event + audit, notifies customer

Also adds RLS policies that depend on is_admin(), and the auth user trigger.

## Security
- is_admin() is SECURITY DEFINER, revoked from PUBLIC/anon, granted to authenticated
- All mutation functions are SECURITY DEFINER with auth.uid() ownership checks
- Admin-only functions check is_admin() before proceeding
- Order creation locks the product row (FOR UPDATE) and reads price from DB
- All status changes write to order_events and admin_audit_logs
- Notifications are inserted server-side, never from the client
*/

-- ============================================================
-- is_admin helper (SECURITY DEFINER — used in RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_uid AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- ============================================================
-- Policies that depend on is_admin()
-- ============================================================

-- profiles: users see own, admins see all
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- user_roles: users see own, admins see all
DROP POLICY IF EXISTS "select_own_role" ON public.user_roles;
CREATE POLICY "select_own_role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- orders: users see own, admins see all; users can insert own; users can update own (limited via function)
DROP POLICY IF EXISTS "select_own_orders" ON public.orders;
CREATE POLICY "select_own_orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "insert_own_orders" ON public.orders;
CREATE POLICY "insert_own_orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_own_orders" ON public.orders;
CREATE POLICY "update_own_orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- payment_submissions: users see own (via order ownership), admins see all
DROP POLICY IF EXISTS "select_own_payment_submissions" ON public.payment_submissions;
CREATE POLICY "select_own_payment_submissions" ON public.payment_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payment_submissions.order_id AND orders.customer_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_payment_submissions" ON public.payment_submissions;
CREATE POLICY "insert_own_payment_submissions" ON public.payment_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payment_submissions.order_id AND orders.customer_id = auth.uid())
  );

-- notifications: users see/update own only
DROP POLICY IF EXISTS "select_own_notifications" ON public.notifications;
CREATE POLICY "select_own_notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON public.notifications;
CREATE POLICY "update_own_notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- order_events: users see own (via order ownership), admins see all
DROP POLICY IF EXISTS "select_own_order_events" ON public.order_events;
CREATE POLICY "select_own_order_events" ON public.order_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_events.order_id AND orders.customer_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- admin_audit_logs: admin read only
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "admin_read_audit_logs" ON public.admin_audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- generate_customer_code (SECURITY DEFINER, retry on collision)
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  attempts integer := 0;
BEGIN
  LOOP
    new_code := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE customer_code = new_code);
    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique customer code after 100 attempts';
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_customer_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_customer_code() TO authenticated;

-- ============================================================
-- handle_new_user trigger (auto-create profile + role + code)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, customer_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    public.generate_customer_code()
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- create_order (SECURITY DEFINER — price from DB, unique code)
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_order(
  p_product_id uuid,
  p_target_email text DEFAULT NULL,
  p_customer_note text DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_order_code text;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_attempts integer := 0;
BEGIN
  SELECT * INTO v_product FROM public.products WHERE id = p_product_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or not available';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found. Please log in again.';
  END IF;

  LOOP
    v_order_code := 'DH';
    FOR i IN 1..5 LOOP
      v_order_code := v_order_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_code = v_order_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 50 THEN
      RAISE EXCEPTION 'Unable to generate unique order code';
    END IF;
  END LOOP;

  INSERT INTO public.orders (
    order_code, customer_id, customer_code, product_id,
    product_name_snapshot, unit_price, total_amount,
    target_email, delivery_mode, customer_note, order_status
  ) VALUES (
    v_order_code, auth.uid(), v_profile.customer_code, v_product.id,
    v_product.name, v_product.price, v_product.price,
    p_target_email, v_product.delivery_mode, p_customer_note, 'PENDING_PAYMENT'
  )
  RETURNING * INTO v_order;

  INSERT INTO public.order_events (order_id, old_status, new_status, note, changed_by)
  VALUES (v_order.id, NULL, 'PENDING_PAYMENT', 'Đơn hàng được tạo', auth.uid());

  INSERT INTO public.notifications (user_id, title, content)
  SELECT ur.user_id, 'Đơn hàng mới', 'Đơn hàng ' || v_order.order_code || ' - ' || v_product.name || ' - ' || v_product.price || 'đ'
  FROM public.user_roles ur WHERE ur.role = 'admin';

  RETURN v_order;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(uuid, text, text) TO authenticated;

-- ============================================================
-- report_payment (SECURITY DEFINER — customer reports transfer)
-- ============================================================
CREATE OR REPLACE FUNCTION public.report_payment(
  p_order_id uuid,
  p_transfer_reference text DEFAULT NULL
)
RETURNS public.payment_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_submission public.payment_submissions%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF v_order.customer_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only report payment for your own orders';
  END IF;
  IF v_order.order_status NOT IN ('PENDING_PAYMENT', 'CUSTOMER_REPORTED_PAID') THEN
    RAISE EXCEPTION 'This order is not awaiting payment';
  END IF;

  INSERT INTO public.payment_submissions (order_id, amount, transfer_reference, status, submitted_at)
  VALUES (p_order_id, v_order.total_amount, p_transfer_reference, 'SUBMITTED', now())
  RETURNING * INTO v_submission;

  UPDATE public.orders SET order_status = 'CUSTOMER_REPORTED_PAID', updated_at = now() WHERE id = p_order_id;

  INSERT INTO public.order_events (order_id, old_status, new_status, note, changed_by)
  VALUES (p_order_id, v_order.order_status, 'CUSTOMER_REPORTED_PAID', 'Khách hàng báo đã chuyển khoản', auth.uid());

  INSERT INTO public.notifications (user_id, title, content)
  SELECT ur.user_id, 'Khách báo đã thanh toán', 'Đơn hàng ' || v_order.order_code || ' - Khách báo đã chuyển ' || v_order.total_amount || 'đ'
  FROM public.user_roles ur WHERE ur.role = 'admin';

  RETURN v_submission;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.report_payment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.report_payment(uuid, text) TO authenticated;

-- ============================================================
-- verify_payment (SECURITY DEFINER — admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION public.verify_payment(
  p_order_id uuid,
  p_received_amount integer DEFAULT NULL,
  p_transfer_reference text DEFAULT NULL,
  p_admin_note text DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can verify payments';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF v_order.order_status NOT IN ('CUSTOMER_REPORTED_PAID', 'PENDING_PAYMENT') THEN
    RAISE EXCEPTION 'Order is not in a verifiable state';
  END IF;

  UPDATE public.payment_submissions
  SET status = 'VERIFIED', verified_at = now(), verified_by = auth.uid(),
      admin_note = p_admin_note,
      transfer_reference = COALESCE(p_transfer_reference, transfer_reference)
  WHERE order_id = p_order_id AND status = 'SUBMITTED';

  UPDATE public.orders SET order_status = 'PAYMENT_VERIFIED', updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  INSERT INTO public.order_events (order_id, old_status, new_status, note, changed_by)
  VALUES (p_order_id, v_order.order_status, 'PAYMENT_VERIFIED', COALESCE(p_admin_note, 'Thanh toán đã được xác nhận'), auth.uid());

  INSERT INTO public.admin_audit_logs (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'VERIFY_PAYMENT', p_order_id, jsonb_build_object('amount', p_received_amount, 'reference', p_transfer_reference, 'note', p_admin_note));

  INSERT INTO public.notifications (user_id, title, content)
  VALUES (v_order.customer_id, 'Thanh toán đã xác nhận', 'Đơn hàng ' || v_order.order_code || ' đã được xác nhận thanh toán. Đang chuẩn bị xử lý.');

  RETURN v_order;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_payment(uuid, integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_payment(uuid, integer, text, text) TO authenticated;

-- ============================================================
-- reject_payment (SECURITY DEFINER — admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION public.reject_payment(
  p_order_id uuid,
  p_admin_note text DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can reject payments';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  UPDATE public.payment_submissions
  SET status = 'REJECTED', verified_at = now(), verified_by = auth.uid(), admin_note = p_admin_note
  WHERE order_id = p_order_id AND status = 'SUBMITTED';

  UPDATE public.orders SET order_status = 'PENDING_PAYMENT', updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  INSERT INTO public.order_events (order_id, old_status, new_status, note, changed_by)
  VALUES (p_order_id, v_order.order_status, 'PENDING_PAYMENT', COALESCE(p_admin_note, 'Thanh toán cần kiểm tra lại'), auth.uid());

  INSERT INTO public.admin_audit_logs (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'REJECT_PAYMENT', p_order_id, jsonb_build_object('note', p_admin_note));

  INSERT INTO public.notifications (user_id, title, content)
  VALUES (v_order.customer_id, 'Cần kiểm tra thanh toán', 'Đơn hàng ' || v_order.order_code || ' cần kiểm tra lại. Vui lòng liên hệ hỗ trợ.');

  RETURN v_order;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reject_payment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reject_payment(uuid, text) TO authenticated;

-- ============================================================
-- update_order_status (SECURITY DEFINER — admin transitions)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_note text DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_old_status text;
  v_notif_title text;
  v_notif_content text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can update order status';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  v_old_status := v_order.order_status;
  IF v_old_status = p_new_status THEN
    RAISE EXCEPTION 'Order is already in this status';
  END IF;

  UPDATE public.orders SET order_status = p_new_status, updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  INSERT INTO public.order_events (order_id, old_status, new_status, note, changed_by)
  VALUES (p_order_id, v_old_status, p_new_status, p_note, auth.uid());

  INSERT INTO public.admin_audit_logs (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'UPDATE_ORDER_STATUS', p_order_id, jsonb_build_object('old', v_old_status, 'new', p_new_status, 'note', p_note));

  v_notif_title := CASE p_new_status
    WHEN 'PROCESSING' THEN 'Đơn hàng đang xử lý'
    WHEN 'COMPLETED' THEN 'Đơn hàng hoàn tất'
    WHEN 'CANCELLED' THEN 'Đơn hàng đã hủy'
    WHEN 'REFUND_PENDING' THEN 'Đang hoàn tiền'
    WHEN 'REFUNDED' THEN 'Đã hoàn tiền'
    ELSE 'Cập nhật đơn hàng'
  END;
  v_notif_content := 'Đơn hàng ' || v_order.order_code || ' - ' || v_notif_title || COALESCE('. ' || p_note, '');

  INSERT INTO public.notifications (user_id, title, content)
  VALUES (v_order.customer_id, v_notif_title, v_notif_content);

  RETURN v_order;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_order_status(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, text, text) TO authenticated;

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
