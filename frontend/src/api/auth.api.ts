import apiClient from './client'
import type {
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  ChangePasswordRequest,
  AuthResponse,
  UserResponse,
} from '@/types/auth.types'

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<UserResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  refresh: (data: RefreshRequest) =>
    apiClient.post<AuthResponse>('/auth/refresh', data),

  logout: (data: RefreshRequest) =>
    apiClient.post('/auth/logout', data),

  logoutAll: () =>
    apiClient.post('/auth/logout-all'),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post('/auth/change-password', data),
}
