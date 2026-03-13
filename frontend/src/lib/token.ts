/**
 * In-memory access token storage.
 * The refresh token is stored in an HttpOnly cookie (server-side) and never
 * accessible from JavaScript — mitigating XSS token theft.
 */

let _accessToken: string | null = null
let _expiresAt: string | null = null

export interface TokenData {
  accessToken: string
  expiresAt: string
}

export function getTokens(): TokenData | null {
  if (!_accessToken) return null
  return { accessToken: _accessToken, expiresAt: _expiresAt || '' }
}

export function setTokens(data: TokenData): void {
  _accessToken = data.accessToken
  _expiresAt = data.expiresAt
}

export function clearTokens(): void {
  _accessToken = null
  _expiresAt = null
}
