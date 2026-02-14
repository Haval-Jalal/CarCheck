import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/auth.api'
import { getTokens, setTokens, clearTokens } from '@/lib/token'
import type { LoginRequest, RegisterRequest } from '@/types/auth.types'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  userEmail: string | null
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; email: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; isLoading: boolean }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { isAuthenticated: true, isLoading: false, userEmail: action.email }
    case 'LOGOUT':
      return { isAuthenticated: false, isLoading: false, userEmail: null }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
  }
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isLoading: true,
    userEmail: null,
  })

  useEffect(() => {
    const tokens = getTokens()
    if (tokens?.accessToken) {
      const email = getEmailFromToken(tokens.accessToken)
      dispatch({ type: 'LOGIN_SUCCESS', email: email || '' })
    } else {
      dispatch({ type: 'SET_LOADING', isLoading: false })
    }
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data)
    setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresAt: response.data.expiresAt,
    })
    const email = getEmailFromToken(response.data.accessToken)
    dispatch({ type: 'LOGIN_SUCCESS', email: email || data.email })
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      const tokens = getTokens()
      if (tokens?.refreshToken) {
        await authApi.logout({ refreshToken: tokens.refreshToken })
      }
    } finally {
      clearTokens()
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll()
    } finally {
      clearTokens()
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, logoutAll }}>
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
