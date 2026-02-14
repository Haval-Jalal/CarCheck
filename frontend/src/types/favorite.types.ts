export interface FavoriteResponse {
  id: string
  carId: string
  registrationNumber: string | null
  brand: string | null
  model: string | null
  year: number | null
  createdAt: string
}

export interface FavoritePageResponse {
  items: FavoriteResponse[]
  page: number
  pageSize: number
}

export interface AddFavoriteRequest {
  carId: string
}
