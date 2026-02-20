import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getTokens, setTokens, clearTokens } from '@/lib/token'
import { useQuotaStore } from '@/stores/quota.store'

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// Request interceptor: attach access token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getTokens()
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

// Response interceptor: extract headers + handle 401 refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    // Extract quota headers from DailyQuotaMiddleware
    const quotaLimit = response.headers['x-dailyquota-limit']
    const quotaRemaining = response.headers['x-dailyquota-remaining']
    const tier = response.headers['x-subscription-tier']
    if (quotaLimit) {
      useQuotaStore.getState().setQuota({
        limit: parseInt(quotaLimit, 10),
        remaining: parseInt(quotaRemaining, 10),
        tier: tier || 'Free',
      })
    }

    // Extract rate-limit headers from RateLimitingMiddleware
    const rlLimit = response.headers['x-ratelimit-limit']
    const rlRemaining = response.headers['x-ratelimit-remaining']
    const rlReset = response.headers['x-ratelimit-reset']
    if (rlLimit) {
      useQuotaStore.getState().setRateLimit({
        limit: parseInt(rlLimit, 10),
        remaining: parseInt(rlRemaining, 10),
        resetsAt: rlReset,
      })
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const tokens = getTokens()
        if (!tokens?.refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: tokens.refreshToken,
        })

        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        })

        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
