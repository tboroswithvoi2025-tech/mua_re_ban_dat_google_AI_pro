import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: 'admin' | 'customer' | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<'admin' | 'customer' | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(prof as Profile | null)

    const { data: r } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    setRole((r as UserRole)?.role ?? 'customer')
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id)
          setLoading(false)
        })()
      } else {
        setProfile(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
