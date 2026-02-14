export interface SearchHistoryResponse {
  id: string
  carId: string
  registrationNumber: string | null
  brand: string | null
  model: string | null
  year: number | null
  searchedAt: string
}

export interface SearchHistoryPageResponse {
  items: SearchHistoryResponse[]
  page: number
  pageSize: number
  todayCount: number
}
