export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

// accessToken only — refresh token lives in an HttpOnly cookie
export interface AuthTokenResponse {
  accessToken: string
  expiresAt: string
}

/** @deprecated Use AuthTokenResponse. Kept for reference only. */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface UserResponse {
  id: string
  email: string
  emailVerified: boolean
  twoFactorEnabled: boolean
}
