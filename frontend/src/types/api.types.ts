export interface ApiError {
  error: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface QuotaInfo {
  limit: number
  remaining: number
  tier: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetsAt: string
}
