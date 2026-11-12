/*
# Seed Data: Products, Payment Methods, Site Settings

## Overview
Seeds the 7 required products with exact prices, 2 bank payment methods, and default site settings.

## Products (7 total, exact prices in VND as integers)
1. Gemini Pro 4Argon + Gg Pro 5TB (Host) — 12 tháng — Mail được cấp — 199000đ — BAN_CHAY
2. CapCut Pro — 1 tháng — Mail được cấp — 39000đ — BAN_CHAY
3. Gemini Pro 4Argon + Gg Pro 5TB (Member) — 1 tháng — Mail chính chủ — 49000đ — PHO_BIEN
4. Gemini Pro 4Argon + Gg Pro 5TB (Member) — 3 tháng — Mail riêng — 122000đ — PHO_BIEN
5. Gemini Pro 4Argon + Gg Pro 5TB (Member) — 6 tháng — Mail riêng — 249000đ — no badge
6. Canva Pro — 1 tháng — 49000đ — no badge
7. Canva Business — 1 tháng — 49000đ — no badge

## Payment Methods (2)
- Techcombank: 19075938838012 — TRAN VU NHAT QUANG
- MB Bank: 0334164570 — DINH CHI THANH

## Site Settings
Default content for warranty policy, terms of use, intro, FAQ, footer, contact info
*/

-- ============================================================
-- Products
-- ============================================================
INSERT INTO public.products (name, slug, product_type, duration, price, delivery_mode, description, warranty_note, warranty_policy, badge, status, stock_status, image_url) VALUES
(
  'Gemini Pro 4Argon + Gg Pro 5TB (Host)',
  'gemini-pro-4argon-host-12m',
  'Host',
  '12 tháng',
  199000,
  'Mail được cấp',
  'Gói Host cao cấp bao gồm Gemini Pro 4Argon và Google One Pro 5TB. Tài khoản hoặc email do nhà cung cấp cấp sẵn, khách không cần dùng Gmail cá nhân.',
  'Bảo hành đầy đủ trong suốt thời hạn sử dụng.',
  'Sản phẩm có bảo hành. Thời hạn bảo hành: theo thời hạn gói (12 tháng). Phạm vi: lỗi do nhà cung cấp, mất quyền lợi không do lỗi khách hàng. Không bảo hành: vi phạm điều kiện sử dụng của Google, thay đổi nhóm gia đình quá giới hạn, hành vi gian lận. Cách gửi yêu cầu: liên hệ Zalo hoặc Facebook được cung cấp.',
  'BAN_CHAY',
  'active',
  'in_stock',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'CapCut Pro',
  'capcut-pro-1m',
  NULL,
  '1 tháng',
  39000,
  'Mail được cấp',
  'Tài khoản CapCut Pro trong 1 tháng. Tài khoản hoặc email do nhà cung cấp cấp sẵn.',
  'Bảo hành trong thời hạn sử dụng.',
  'Sản phẩm có bảo hành. Thời hạn: 1 tháng. Phạm vi: mất quyền lợi do lỗi hệ thống cung cấp. Không bảo hành: đổi mật khẩu tự ý, vi phạm điều khoản CapCut. Cách gửi yêu cầu: liên hệ Zalo hoặc Facebook.',
  'BAN_CHAY',
  'active',
  'in_stock',
  'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Gemini Pro 4Argon + Gg Pro 5TB (Member) — 1 tháng',
  'gemini-pro-4argon-member-1m',
  'Member',
  '1 tháng',
  49000,
  'Mail chính chủ',
  'Gói Member Gemini Pro 4Argon + Google One Pro 5TB trong 1 tháng. Yêu cầu Gmail chính chủ của khách hàng.',
  'Bảo hành đầy đủ.',
  'Sản phẩm có bảo hành. Thời hạn: 1 tháng. Phạm vi: lỗi do nhà cung cấp, mất quyền lợi không do lỗi khách hàng. Không bảo hành: vi phạm điều kiện Google, thay đổi nhóm gia đình quá giới hạn. Cách gửi yêu cầu: liên hệ Zalo hoặc Facebook.',
  'PHO_BIEN',
  'active',
  'in_stock',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Gemini Pro 4Argon + Gg Pro 5TB (Member) — 3 tháng',
  'gemini-pro-4argon-member-3m',
  'Member',
  '3 tháng',
  122000,
  'Mail riêng',
  'Gói Member Gemini Pro 4Argon + Google One Pro 5TB trong 3 tháng. Sử dụng email riêng do khách cung cấp.',
  'Bảo hành đầy đủ.',
  'Sản phẩm có bảo hành. Thời hạn: 3 tháng. Phạm vi: lỗi do nhà cung cấp, mất quyền lợi không do lỗi khách hàng. Không bảo hành: vi phạm điều kiện Google, thay đổi nhóm gia đình quá giới hạn. Cách gửi yêu cầu: liên hệ Zalo hoặc Facebook.',
  'PHO_BIEN',
  'active',
  'in_stock',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Gemini Pro 4Argon + Gg Pro 5TB (Member) — 6 tháng',
  'gemini-pro-4argon-member-6m',
  'Member',
  '6 tháng',
  249000,
  'Mail riêng',
  'Gói Member Gemini Pro 4Argon + Google One Pro 5TB trong 6 tháng. Sử dụng email riêng do khách cung cấp.',
  'Bảo hành đầy đủ.',
  'Sản phẩm có bảo hành. Thời hạn: 6 tháng. Phạm vi: lỗi do nhà cung cấp, mất quyền lợi không do lỗi khách hàng. Không bảo hành: vi phạm điều kiện Google, thay đổi nhóm gia đình quá giới hạn. Cách gửi yêu cầu: liên hệ Zalo hoặc Facebook.',
  NULL,
  'active',
  'in_stock',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Canva Pro',
  'canva-pro-1m',
  NULL,
  '1 tháng',
  49000,
  'Mail được cấp',
  'Tài khoản Canva Pro trong 1 tháng. Tài khoản hoặc email do nhà cung cấp cấp sẵn.',
  'Bảo hành trong thời hạn sử dụng.',
  'Sản phẩm có bảo hành. Thời hạn: 1 tháng. Phạm vi: mất quyền lợi do lỗi hệ thống cung cấp. Không bảo hành: đổi mật khẩu tự ý, vi phạm điều khoản Canva. Cách gửi yêu cầu: liên hệ Zalo hoặc Facebook.',
  NULL,
  'active',
  'in_stock',
  'https://images.pexels.com/photos/6952686/pexels-photo-6952686.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Canva Business',
  'canva-business-1m',
  NULL,
  '1 tháng',
  49000,
  'Mail được cấp',
  'Tài khoản Canva Business trong 1 tháng. Tài khoản hoặc email do nhà cung cấp cấp sẵn.',
  'Bảo hành trong thời hạn sử dụng.',
  'Sản phẩm có bảo hành. Thời hạn: 1 tháng. Phạm vi: mất quyền lợi do lỗi hệ thống cung cấp. Không bảo hành: đổi mật khẩu tự ý, vi phạm điều khoản Canva. Cách gửi yêu cầu: liên hệ Zalo hoặc Facebook.',
  NULL,
  'active',
  'in_stock',
  'https://images.pexels.com/photos/6952686/pexels-photo-6952686.jpeg?auto=compress&cs=tinysrgb&w=800'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Payment Methods
-- ============================================================
INSERT INTO public.payment_methods (bank_name, account_number, account_holder, is_active) VALUES
('Techcombank', '19075938838012', 'TRAN VU NHAT QUANG', true),
('MB Bank', '0334164570', 'DINH CHI THANH', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Site Settings
-- ============================================================
INSERT INTO public.site_settings (key, value) VALUES
('warranty_policy', 'Chính sách bảo hành được áp dụng cho các sản phẩm có ghi chú bảo hành. Thời hạn bảo hành theo thời hạn gói dịch vụ. Phạm vi bảo hành: lỗi do nhà cung cấp, mất quyền lợi không do lỗi khách hàng. Không bảo hành: vi phạm điều kiện sử dụng, hành vi gian lận, thay đổi nhóm gia đình quá giới hạn. Cách gửi yêu cầu bảo hành: liên hệ qua Zalo hoặc Facebook.'),
('terms_of_use', 'Điều kiện sử dụng sản phẩm Google AI: Đây là dịch vụ do bên thứ ba cung cấp, không phải website chính thức của Google. Thành viên phải đáp ứng điều kiện tham gia Family Group hiện hành. Cần cùng quốc gia với người quản lý nhóm. Tài khoản Google Workspace hoặc tài khoản do tổ chức quản lý có thể không đủ điều kiện. Cần kiểm tra giới hạn thay đổi nhóm gia đình trong 12 tháng. Một số quyền lợi AI có giới hạn dùng chung cho cả nhóm. Không đảm bảo mỗi thành viên được một hạn mức AI độc lập nếu Google không xác nhận.'),
('intro_text', 'NGUỒN HÀNG TỰ CUNG là khu chợ kỹ thuật số phong cách Fantasy, cung cấp các dịch vụ công nghệ và AI cao cấp với mức giá hợp lý. Nguồn hàng chủ động, quy trình đặt hàng rõ ràng và hỗ trợ khách hàng trực tiếp.'),
('faq', 'Câu hỏi thường gặp:|1. Làm thế nào để đặt hàng? — Chọn sản phẩm, nhấn MUA NGAY, đăng nhập Google và làm theo hướng dẫn.|2. Thanh toán bằng cách nào? — Chuyển khoản ngân hàng theo thông tin trên màn hình thanh toán.|3. Bao lâu thì nhận được dịch vụ? — Sau khi Admin xác nhận thanh toán, dịch vụ được cấp trong thời gian sớm nhất.|4. Có bảo hành không? — Xem chi tiết tại phần Chính sách bảo hành.'),
('footer_text', 'NGUỒN HÀNG TỰ CUNG — Fantasy Digital Marketplace. Khu chợ kỹ thuật số cao cấp.'),
('zalo_1', '0357722698'),
('zalo_2', '0334164570'),
('facebook_1', 'https://www.facebook.com/hoang.james.78087'),
('facebook_2', 'https://www.facebook.com/tran.nhatquang.5686?rdid=AhLsDHX0R6eqsJay&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19vhp59qQm%23'),
('zalo_link_1', 'https://zalo.me/0357722698'),
('zalo_link_2', 'https://zalo.me/0334164570')
ON CONFLICT (key) DO NOTHING;
