import apiClient from './client'
import type { BulkSearchRequest, BulkSearchResponse } from '@/types/business.types'

export const businessApi = {
  bulkSearch: (data: BulkSearchRequest) =>
    apiClient.post<BulkSearchResponse>('/business/bulk-search', data),
}
