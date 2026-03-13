import apiClient from './client'
import type {
  RegisterRequest,
  LoginRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthTokenResponse,
  UserResponse,
} from '@/types/auth.types'

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<UserResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthTokenResponse>('/auth/login', data),

  // Refresh token is in an HttpOnly cookie — no body needed
  refresh: () =>
    apiClient.post<AuthTokenResponse>('/auth/refresh', {}),

  // Logout revokes the HttpOnly cookie on the server side
  logout: () =>
    apiClient.post('/auth/logout'),

  logoutAll: () =>
    apiClient.post('/auth/logout-all'),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post('/auth/change-password', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    apiClient.get('/auth/verify-email', { params: { token } }),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-verification', { email }),
}
