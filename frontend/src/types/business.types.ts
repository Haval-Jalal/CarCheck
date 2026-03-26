export interface BulkSearchRequest {
  registrationNumbers: string[]
}

export interface BulkSearchItemResult {
  registrationNumber: string
  success: boolean
  carId: string | null
  brand: string | null
  model: string | null
  year: number | null
  mileage: number | null
  marketValueSek: number | null
  error: string | null
}

export interface BulkSearchResponse {
  total: number
  succeeded: number
  failed: number
  results: BulkSearchItemResult[]
}
