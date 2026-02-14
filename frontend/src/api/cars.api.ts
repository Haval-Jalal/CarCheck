import apiClient from './client'
import type { CarSearchRequest, CarSearchResponse, CarAnalysisResponse } from '@/types/car.types'

export const carsApi = {
  search: (data: CarSearchRequest) =>
    apiClient.post<CarSearchResponse>('/cars/search', data),

  getAnalysis: (carId: string) =>
    apiClient.get<CarAnalysisResponse>(`/cars/${carId}/analysis`),
}
