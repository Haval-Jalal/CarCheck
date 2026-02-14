import { create } from 'zustand'
import type { QuotaInfo, RateLimitInfo } from '@/types/api.types'

interface QuotaState {
  quota: QuotaInfo | null
  rateLimit: RateLimitInfo | null
  setQuota: (q: QuotaInfo) => void
  setRateLimit: (r: RateLimitInfo) => void
}

export const useQuotaStore = create<QuotaState>((set) => ({
  quota: null,
  rateLimit: null,
  setQuota: (quota) => set({ quota }),
  setRateLimit: (rateLimit) => set({ rateLimit }),
}))
