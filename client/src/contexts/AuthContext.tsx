import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { setApiToken } from '../services/api'

type AuthContextType = {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  const login = useCallback((t: string) => {
    setApiToken(t)
    setToken(t)
  }, [])

  const logout = useCallback(() => {
    setApiToken(null)
    setToken(null)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('token')
    setToken(stored)
    setApiToken(stored)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
