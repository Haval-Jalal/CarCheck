import apiClient from './client'
import type {
  TierInfoResponse,
  SubscriptionResponse,
  SubscribeRequest,
  CheckoutResponse,
  CreditPackResponse,
  BuyCreditsRequest,
  CreditsBalanceResponse,
} from '@/types/billing.types'

export const billingApi = {
  getTiers: () =>
    apiClient.get<TierInfoResponse[]>('/billing/tiers'),

  getCreditPackages: () =>
    apiClient.get<CreditPackResponse[]>('/billing/credit-packages'),

  getSubscription: () =>
    apiClient.get<SubscriptionResponse>('/billing/subscription'),

  createCheckout: (data: SubscribeRequest) =>
    apiClient.post<CheckoutResponse>('/billing/checkout', data),

  buyCredits: (data: BuyCreditsRequest) =>
    apiClient.post<CreditsBalanceResponse>('/billing/buy-credits', data),

  cancelSubscription: () =>
    apiClient.post('/billing/cancel'),
}
