import apiClient from './client'
import type { AddFavoriteRequest, FavoriteResponse, FavoritePageResponse } from '@/types/favorite.types'
import type { PaginationParams } from '@/types/api.types'

export const favoritesApi = {
  getFavorites: (params?: PaginationParams) =>
    apiClient.get<FavoritePageResponse>('/favorites', { params }),

  addFavorite: (data: AddFavoriteRequest) =>
    apiClient.post<FavoriteResponse>('/favorites', data),

  removeFavorite: (carId: string) =>
    apiClient.delete(`/favorites/${carId}`),
}
