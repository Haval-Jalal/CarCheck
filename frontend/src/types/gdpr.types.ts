export interface UserDataExport {
  profile: UserProfileData
  searchHistory: SearchHistoryExport[]
  favorites: FavoriteExport[]
  subscriptions: SubscriptionExport[]
  exportedAt: string
}

export interface UserProfileData {
  id: string
  email: string
  emailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: string
}

export interface SearchHistoryExport {
  carId: string
  searchedAt: string
}

export interface FavoriteExport {
  carId: string
  createdAt: string
}

export interface SubscriptionExport {
  tier: string
  isActive: boolean
  startDate: string
  endDate: string | null
}

export interface DataDeletionResponse {
  success: boolean
  message: string
  requestedAt: string
}
