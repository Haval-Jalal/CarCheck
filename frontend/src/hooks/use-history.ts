import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/api/history.api'

export function useHistory(page: number, pageSize = 20) {
  return useQuery({
    queryKey: ['history', { page, pageSize }],
    queryFn: () => historyApi.getHistory({ page, pageSize }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}
