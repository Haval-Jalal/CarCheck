export interface CarSearchRequest {
  registrationNumber: string
  captchaToken?: string | null
}

export interface CarSearchResponse {
  carId: string
  registrationNumber: string
  brand: string
  model: string
  year: number
  mileage: number
  fuelType: string | null
  horsePower: number | null
  color: string | null
  marketValueSek: number | null
}

export interface CarAnalysisResponse {
  analysisId: string
  carId: string
  registrationNumber: string
  brand: string
  model: string
  year: number
  score: number
  recommendation: string
  breakdown: AnalysisBreakdown
  createdAt: string
}

export interface AnalysisBreakdown {
  ageScore: number
  mileageScore: number
  insuranceScore: number
  recallScore: number
  inspectionScore: number
}
