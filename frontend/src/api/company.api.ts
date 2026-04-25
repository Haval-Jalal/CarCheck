import apiClient from './client'
import type {
  CompanyResponse,
  CreateCompanyRequest,
  InviteMemberRequest,
  AcceptInviteRequest,
} from '@/types/company.types'

export const companyApi = {
  getCompany: () =>
    apiClient.get<CompanyResponse>('/company'),

  createCompany: (data: CreateCompanyRequest) =>
    apiClient.post<CompanyResponse>('/company', data),

  invite: (data: InviteMemberRequest) =>
    apiClient.post<{ message: string }>('/company/invite', data),

  acceptInvite: (data: AcceptInviteRequest) =>
    apiClient.post<{ message: string }>('/company/accept-invite', data),

  removeMember: (memberId: string) =>
    apiClient.delete<{ message: string }>(`/company/members/${memberId}`),

  exportHistory: () =>
    apiClient.get<Blob>('/company/export-history', { responseType: 'blob' }),
}
