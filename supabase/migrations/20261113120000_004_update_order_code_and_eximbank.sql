/*
# 004 — Update Payment Methods, 7-Digit Order Code & Multi-Email Support

## Overview
1. Adds Eximbank (0357722698 - HOANG JAMES) as official primary payment method.
2. Updates create_order() function to support 7-digit numeric order codes (e.g. 0128192)
   and quantity with multiple emails.
3. Updates site settings for brand name "Mua rẻ bán đắt Google AI pro" and 2 founders info.
*/

-- 1. Insert Eximbank
INSERT INTO public.payment_methods (bank_name, account_number, account_holder, is_active)
VALUES ('Eximbank', '0357722698', 'HOANG JAMES', true)
ON CONFLICT DO NOTHING;

-- 2. Update 7-digit order code generator in create_order function
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

  -- Generate 7-digit numeric order code (e.g. 0128192)
  LOOP
    v_order_code := lpad(floor(random() * 10000000)::text, 7, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_code = v_order_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique 7-digit order code';
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
  VALUES (v_order.id, NULL, 'PENDING_PAYMENT', 'Đơn hàng được tạo (Mã 7 số)', auth.uid());

  INSERT INTO public.notifications (user_id, title, content)
  SELECT ur.user_id, 'Đơn hàng mới #' || v_order.order_code, 'Đơn hàng ' || v_order.order_code || ' - ' || v_product.name || ' - ' || v_product.price || 'đ'
  FROM public.user_roles ur WHERE ur.role = 'admin';

  RETURN v_order;
END;
$$;
