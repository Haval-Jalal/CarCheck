import apiClient from './client'
import type { SearchHistoryPageResponse } from '@/types/history.types'
import type { PaginationParams } from '@/types/api.types'

export const historyApi = {
  getHistory: (params?: PaginationParams) =>
    apiClient.get<SearchHistoryPageResponse>('/history', { params }),
}
