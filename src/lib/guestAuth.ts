import { supabase } from './supabase'

/**
 * Đảm bảo luôn có phiên làm việc ẩn cho khách mua hàng mà khách không cần đăng ký tài khoản hay đăng nhập Google.
 */
export async function getOrCreateGuestUser() {
  // 1. Kiểm tra session hiện có
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData?.session?.user) {
    return sessionData.session.user
  }

  // 2. Nếu chưa có, tự động tạo phiên khách hàng ngầm
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const guestEmail = `guest_${Date.now()}_${randomSuffix}@shopguest.local`
  const guestPassword = `GuestPass_${Date.now()}_${randomSuffix}!`

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: guestEmail,
    password: guestPassword,
    options: {
      data: {
        full_name: 'Khách hàng',
      },
    },
  })

  if (signUpError || !signUpData.user) {
    console.error('Auto guest sign up error:', signUpError)
    throw new Error(signUpError?.message || 'Không thể tạo phiên khách hàng ngầm.')
  }

  return signUpData.user
}
