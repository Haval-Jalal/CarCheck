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
  credits: number
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

export interface BuyCreditsRequest {
  packSize: number
}

export interface CheckoutResponse {
  sessionId: string
  checkoutUrl: string
}

export interface CreditPackResponse {
  credits: number
  priceSek: number
  label: string
  isBestValue: boolean
}

export interface CreditsBalanceResponse {
  credits: number
  hasMonthlySubscription: boolean
}

export interface TransactionResponse {
  id: string
  type: 'credits' | 'subscription' | 'trial'
  credits: number | null
  amountSek: number
  description: string
  createdAt: string
}
