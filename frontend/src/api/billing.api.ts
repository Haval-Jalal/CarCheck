import apiClient from './client'
import type {
  TierInfoResponse,
  SubscriptionResponse,
  SubscribeRequest,
  CheckoutResponse,
} from '@/types/billing.types'

export const billingApi = {
  getTiers: () =>
    apiClient.get<TierInfoResponse[]>('/billing/tiers'),

  getSubscription: () =>
    apiClient.get<SubscriptionResponse>('/billing/subscription'),

  createCheckout: (data: SubscribeRequest) =>
    apiClient.post<CheckoutResponse>('/billing/checkout', data),

  cancelSubscription: () =>
    apiClient.post('/billing/cancel'),
}
