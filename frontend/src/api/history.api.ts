import apiClient from './client'
import type { SearchHistoryPageResponse } from '@/types/history.types'
import type { PaginationParams } from '@/types/api.types'

export const historyApi = {
  getHistory: (params?: PaginationParams) =>
    apiClient.get<SearchHistoryPageResponse>('/history', { params }),

  deleteEntry: (id: string) =>
    apiClient.delete(`/history/${id}`),

  clearAll: () =>
    apiClient.delete('/history'),
}
