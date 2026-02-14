export interface TierInfoResponse {
  tier: number
  name: string
  dailySearches: number
  monthlySearches: number
  analysisIncluded: boolean
  pricePerMonthSek: number
}

export interface SubscriptionResponse {
  subscriptionId: string
  tier: number
  tierName: string
  isActive: boolean
  startDate: string
  endDate: string | null
  limits: TierLimitsResponse
}

export interface TierLimitsResponse {
  dailySearches: number
  monthlySearches: number
  analysisIncluded: boolean
  pricePerMonthSek: number
}

export interface SubscribeRequest {
  tier: number
}

export interface CheckoutResponse {
  sessionId: string
  checkoutUrl: string
}
