import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { historyApi } from '@/api/history.api'

export function useHistory(page: number, pageSize = 20) {
  return useQuery({
    queryKey: ['history', { page, pageSize }],
    queryFn: () => historyApi.getHistory({ page, pageSize }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useDeleteHistoryEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => historyApi.deleteEntry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}

export function useClearHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => historyApi.clearAll(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}
