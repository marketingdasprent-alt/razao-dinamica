import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Perfil } from '@/lib/types'

interface AuthState {
  session: Session | null
  loading: boolean
  profile: Perfil | null
  isAdmin: boolean
  profileError: string
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState>({ session: null, loading: true, profile: null, isAdmin: false, profileError: '', refreshProfile: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [profileError, setProfileError] = useState('')
  const current = useRef<Session | null>(null)
  const generation = useRef(0)

  const refreshProfile = useCallback(async () => {
    const version = ++generation.current
    const user = current.current?.user
    if (!user) { setProfile(null); setProfileError(''); setLoading(false); return }
    const { data, error } = await supabase.from('perfis').select('*').eq('id', user.id).maybeSingle()
    if (version !== generation.current) return
    setProfile(error ? null : data as Perfil | null)
    setProfileError(error ? 'Não foi possível verificar o acesso. Tente novamente ou contacte o administrador.' : '')
    setLoading(false)
  }, [])

  useEffect(() => {
    let disposed = false
    let authEventSeen = false
    function accept(next: Session | null) {
      if (disposed) return
      const changed = current.current?.user.id !== next?.user.id
      current.current = next
      setSession(next)
      if (changed) { setProfile(null); setLoading(true) }
      setTimeout(() => { if (!disposed) void refreshProfile() }, 0)
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => { authEventSeen = true; accept(next) })
    supabase.auth.getSession().then(({ data }) => { if (!authEventSeen) accept(data.session) })
    const refresh = () => { if (!disposed) void refreshProfile() }
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener('focus', refresh)
    return () => { disposed = true; ++generation.current; sub.subscription.unsubscribe(); clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [refreshProfile])

  return <AuthContext.Provider value={{ session, loading, profile, profileError, refreshProfile, isAdmin: !!profile?.ativo && !profile.exigir_troca_senha && profile.papel === 'admin' }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
