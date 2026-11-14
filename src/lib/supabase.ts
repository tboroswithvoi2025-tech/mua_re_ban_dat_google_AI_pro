import { createClient } from '@supabase/supabase-js'

// Cấu hình URL và Anon key mặc định của dự án để đảm bảo web luôn hoạt động
// ngay cả khi chạy trên Bolt.new, Netlify, Vercel hoặc GitHub Pages mà không có file .env
const DEFAULT_SUPABASE_URL = 'https://tdjmehccuevqwjitryun.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkam1laGNjdWV2cXdqaXRyeXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0Nzg0NzYsImV4cCI6MjExMDA1NDQ3Nn0.i_mJmf3toj27CQynYvZvsWobInmBVml1ouYBsM0MyXc'

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
