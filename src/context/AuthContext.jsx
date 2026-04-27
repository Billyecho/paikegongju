import { useEffect, useState } from 'react'
import { AuthContext } from './authContextValue'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [isRecovery, setIsRecovery] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }

    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) {
        console.error('Failed to get Supabase session', error)
      }
      setSession(data.session ?? null)
      setIsRecovery(window.location.hash.includes('type=recovery'))
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setIsRecovery(event === 'PASSWORD_RECOVERY')
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithPassword = async (email, password) => {
    if (!supabase) {
      throw new Error('Supabase 尚未配置')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signUpWithPassword = async (email, password) => {
    if (!supabase) {
      throw new Error('Supabase 尚未配置')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) throw error
    return data
  }

  const sendPasswordReset = async (email) => {
    if (!supabase) {
      throw new Error('Supabase 尚未配置')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })

    if (error) throw error
  }

  const updatePassword = async (password) => {
    if (!supabase) {
      throw new Error('Supabase 尚未配置')
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    setIsRecovery(false)
    if (window.location.hash.includes('type=recovery')) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        isConfigured: isSupabaseConfigured,
        session,
        user: session?.user ?? null,
        loading,
        isRecovery,
        signInWithPassword,
        signUpWithPassword,
        sendPasswordReset,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
