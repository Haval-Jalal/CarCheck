import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getTokens, setTokens, clearTokens } from '@/lib/token'
import { useQuotaStore } from '@/stores/quota.store'
import { toast } from 'sonner'

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  // Needed so the browser sends the HttpOnly refresh-token cookie on cross-origin requests
  withCredentials: true,
})

// Request interceptor: attach in-memory access token
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
      const parsedRemaining = quotaRemaining === 'unlimited' ? 'unlimited' : (parseInt(quotaRemaining, 10) || 0)
      useQuotaStore.getState().setQuota({
        limit: quotaLimit === 'unlimited' ? 'unlimited'
          : quotaLimit === 'credits' ? 'credits'
          : (parseInt(quotaLimit, 10) || 0),
        remaining: parsedRemaining,
        tier: tier || 'Free',
      })
    }

    // Extract rate-limit headers from RateLimitingMiddleware
    const rlLimit = response.headers['x-ratelimit-limit']
    const rlRemaining = response.headers['x-ratelimit-remaining']
    const rlReset = response.headers['x-ratelimit-reset']
    if (rlLimit) {
      useQuotaStore.getState().setRateLimit({
        limit: parseInt(rlLimit, 10) || 0,
        remaining: parseInt(rlRemaining, 10) || 0,
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
        // Refresh token is in an HttpOnly cookie — sent automatically (withCredentials: true)
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })

        setTokens({
          accessToken: data.accessToken,
          expiresAt: data.expiresAt,
        })

        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        const from = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?from=${from}`
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 402 = out of credits/quota — navigate to billing
    if (error.response?.status === 402) {
      toast.error('Du har inga sökningar kvar.', {
        action: { label: 'Köp sökningar', onClick: () => { window.location.href = '/billing' } },
        duration: 6000,
      })
    }

    return Promise.reject(error)
  }
)

export default apiClient
