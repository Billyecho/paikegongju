import { useEffect, useState } from 'react'
import { AuthContext } from './authContextValue'
import { cloudbaseAuth, getCloudbaseUserId, isCloudbaseConfigured } from '../lib/cloudbase'

const allowedAccount = (import.meta.env.VITE_ALLOWED_EMAIL || 'gaoshuangquan@outlook.com').trim().toLowerCase()

function normalizeUser(rawUser) {
  if (!rawUser) return null

  return {
    ...rawUser,
    id: getCloudbaseUserId(rawUser),
    uid: rawUser.uid || rawUser.id || rawUser.username || rawUser.email,
    email: rawUser.email || '',
    username: rawUser.username || rawUser.email || '',
  }
}

function isAllowedUser(rawUser) {
  if (!rawUser) return false

  const candidates = [
    rawUser.email,
    rawUser.username,
    rawUser.id,
    rawUser.uid,
    rawUser.customUserId,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return candidates.includes(allowedAccount)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isCloudbaseConfigured)

  useEffect(() => {
    if (!isCloudbaseConfigured || !cloudbaseAuth) {
      return undefined
    }

    let mounted = true

    const refreshAuthState = async () => {
      try {
        const [loginState, currentUser] = await Promise.all([
          cloudbaseAuth.getLoginState(),
          cloudbaseAuth.getCurrentUser(),
        ])

        if (!mounted) return

        const nextUser = normalizeUser(loginState?.user ?? currentUser)
        const acceptedUser = isAllowedUser(nextUser) ? nextUser : null

        setSession(acceptedUser ? loginState ?? { user: acceptedUser } : null)
        setUser(acceptedUser)
      } catch (error) {
        if (!mounted) return
        console.error('Failed to get CloudBase auth state', error)
        setSession(null)
        setUser(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    refreshAuthState()

    const {
      data: { subscription },
    } = cloudbaseAuth.onAuthStateChange(() => {
      refreshAuthState()
    })

    return () => {
      mounted = false
      subscription?.unsubscribe?.()
    }
  }, [])

  const signInWithPassword = async (identifier, password) => {
    if (!cloudbaseAuth) {
      throw new Error('CloudBase 尚未配置')
    }

    const account = identifier.trim()
    let lastError = null

    const candidates = account.includes('@')
      ? [{ username: account, password }, { email: account, password }]
      : [{ username: account, password }]

    for (const payload of candidates) {
      try {
        await cloudbaseAuth.signInWithPassword(payload)
        return
      } catch (error) {
        lastError = error
      }
    }

    throw lastError || new Error('登录失败')
  }

  const signOut = async () => {
    if (!cloudbaseAuth) return
    await cloudbaseAuth.signOut()
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isConfigured: isCloudbaseConfigured,
        session,
        user,
        loading,
        signInWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
