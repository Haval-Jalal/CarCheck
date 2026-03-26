import { useMutation } from '@tanstack/react-query'
import { businessApi } from '@/api/business.api'

export function useBulkSearch() {
  return useMutation({
    mutationFn: (registrationNumbers: string[]) =>
      businessApi.bulkSearch({ registrationNumbers }).then(r => r.data),
  })
}
