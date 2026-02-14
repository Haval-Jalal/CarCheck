const ACCESS_TOKEN_KEY = 'carcheck_at'
const REFRESH_TOKEN_KEY = 'carcheck_rt'
const EXPIRES_AT_KEY = 'carcheck_exp'

export interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export function getTokens(): TokenData | null {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY)
  if (!accessToken || !refreshToken) return null
  return { accessToken, refreshToken, expiresAt: expiresAt || '' }
}

export function setTokens(data: TokenData): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
  localStorage.setItem(EXPIRES_AT_KEY, data.expiresAt)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}
