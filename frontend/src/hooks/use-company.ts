import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/api/company.api'
import { queryKeys } from '@/lib/query-keys'
import type { CreateCompanyRequest, InviteMemberRequest } from '@/types/company.types'

export function useCompany() {
  return useQuery({
    queryKey: queryKeys.company.detail,
    queryFn: () => companyApi.getCompany().then((r) => r.data),
    retry: (failureCount, error: unknown) => {
      // Don't retry 404 — user simply has no company yet
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 404) return false
      return failureCount < 2
    },
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) =>
      companyApi.createCompany(data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.company.detail })
    },
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InviteMemberRequest) =>
      companyApi.invite(data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.company.detail })
    },
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) =>
      companyApi.removeMember(memberId).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.company.detail })
    },
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) =>
      companyApi.acceptInvite({ token }).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.company.detail })
    },
  })
}
