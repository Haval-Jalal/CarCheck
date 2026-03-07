import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billingApi } from '@/api/billing.api'
import { queryKeys } from '@/lib/query-keys'

export function useTiers() {
  return useQuery({
    queryKey: queryKeys.billing.tiers,
    queryFn: () => billingApi.getTiers().then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  })
}

export function useCreditPackages() {
  return useQuery({
    queryKey: [...queryKeys.billing.tiers, 'credit-packages'],
    queryFn: () => billingApi.getCreditPackages().then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.billing.subscription,
    queryFn: () => billingApi.getSubscription().then((r) => r.data),
  })
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (tier: number) => billingApi.createCheckout({ tier }).then((r) => r.data),
  })
}

export function useBuyCredits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (packSize: number) => billingApi.buyCredits({ packSize }).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => billingApi.cancelSubscription(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription })
    },
  })
}
