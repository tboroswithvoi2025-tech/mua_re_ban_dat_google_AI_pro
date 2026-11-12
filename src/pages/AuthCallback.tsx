import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        navigate('/')
      } else {
        navigate('/')
      }
    })()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-mystic-400 mx-auto mb-4 animate-pulse" />
        <div className="flex items-center gap-2 text-mystic-200">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang xử lý đăng nhập...</span>
        </div>
      </div>
    </div>
  )
}
