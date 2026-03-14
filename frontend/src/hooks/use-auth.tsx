import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { setTokens, clearTokens } from '@/lib/token'
import type { LoginRequest, RegisterRequest } from '@/types/auth.types'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  userEmail: string | null
  emailVerified: boolean | null
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; email: string; emailVerified: boolean }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'EMAIL_VERIFIED' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { isAuthenticated: true, isLoading: false, userEmail: action.email, emailVerified: action.emailVerified }
    case 'LOGOUT':
      return { isAuthenticated: false, isLoading: false, userEmail: null, emailVerified: null }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'EMAIL_VERIFIED':
      return { ...state, emailVerified: true }
  }
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  markEmailVerified: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function getEmailFromToken(token: string): string | null {
  const payload = parseJwtPayload(token)
  if (!payload) return null
  return (payload.email as string) ?? (payload.sub as string) ?? null
}

function getEmailVerifiedFromToken(token: string): boolean {
  const payload = parseJwtPayload(token)
  if (!payload) return false
  return payload['email_verified'] === 'true' || payload['email_verified'] === true
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isLoading: true,
    userEmail: null,
    emailVerified: null,
  })
  const queryClient = useQueryClient()

  // Restore session from the HttpOnly refresh-token cookie via silent refresh
  useEffect(() => {
    authApi.refresh()
      .then((response) => {
        const { accessToken, expiresAt } = response.data
        setTokens({ accessToken, expiresAt })
        const email = getEmailFromToken(accessToken)
        const emailVerified = getEmailVerifiedFromToken(accessToken)
        dispatch({ type: 'LOGIN_SUCCESS', email: email || '', emailVerified })
      })
      .catch(() => {
        // No valid session (no cookie or expired) — user is logged out
        dispatch({ type: 'SET_LOADING', isLoading: false })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data)
    setTokens({
      accessToken: response.data.accessToken,
      expiresAt: response.data.expiresAt,
    })
    queryClient.clear()
    const email = getEmailFromToken(response.data.accessToken)
    const emailVerified = getEmailVerifiedFromToken(response.data.accessToken)
    dispatch({ type: 'LOGIN_SUCCESS', email: email || data.email, emailVerified })
  }, [queryClient])

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearTokens()
      queryClient.clear()
      dispatch({ type: 'LOGOUT' })
    }
  }, [queryClient])

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll()
    } finally {
      clearTokens()
      queryClient.clear()
      dispatch({ type: 'LOGOUT' })
    }
  }, [queryClient])

  const markEmailVerified = useCallback(() => {
    dispatch({ type: 'EMAIL_VERIFIED' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, logoutAll, markEmailVerified }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
