export type CompanyMemberRole = 0 | 1 // 0 = Member, 1 = Admin

export interface CompanyMemberResponse {
  memberId: string
  userId: string
  email: string
  role: CompanyMemberRole
  joinedAt: string
}

export interface PendingInviteResponse {
  inviteId: string
  email: string
  role: CompanyMemberRole
  expiresAt: string
  createdAt: string
}

export interface CompanyResponse {
  id: string
  name: string
  orgNumber: string | null
  logoUrl: string | null
  createdAt: string
  members: CompanyMemberResponse[]
  pendingInvites: PendingInviteResponse[]
}

export interface CreateCompanyRequest {
  name: string
  orgNumber?: string
}

export interface InviteMemberRequest {
  email: string
  role: CompanyMemberRole
}

export interface AcceptInviteRequest {
  token: string
}

export const COMPANY_MEMBER_ROLE = {
  MEMBER: 0 as CompanyMemberRole,
  ADMIN: 1 as CompanyMemberRole,
}

export function roleLabel(role: CompanyMemberRole): string {
  return role === COMPANY_MEMBER_ROLE.ADMIN ? 'Administratör' : 'Medlem'
}
