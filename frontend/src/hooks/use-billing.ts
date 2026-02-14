import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billingApi } from '@/api/billing.api'

export function useTiers() {
  return useQuery({
    queryKey: ['billing', 'tiers'],
    queryFn: () => billingApi.getTiers().then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => billingApi.getSubscription().then((r) => r.data),
  })
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (tier: number) => billingApi.createCheckout({ tier }).then((r) => r.data),
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => billingApi.cancelSubscription(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] })
    },
  })
}
