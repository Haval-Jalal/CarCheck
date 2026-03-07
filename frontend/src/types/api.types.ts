export interface ApiError {
  error: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface QuotaInfo {
  limit: number | 'unlimited' | 'credits'
  remaining: number | 'unlimited'
  tier: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetsAt: string
}
