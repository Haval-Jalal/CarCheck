import apiClient from './client'
import type { UserDataExport, DataDeletionResponse } from '@/types/gdpr.types'

export const gdprApi = {
  exportData: () =>
    apiClient.get<UserDataExport>('/gdpr/export'),

  deleteAccount: (data: { password: string; reason?: string }) =>
    apiClient.delete<DataDeletionResponse>('/gdpr/delete-account', { data }),
}
