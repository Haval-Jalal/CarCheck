export type FleetVehicleStatus = 'Ok' | 'NeedsAttention' | 'Critical' | 'NotAnalyzed' | 'StaleData'

export interface FleetVehicleResponse {
  id: string
  registrationNumber: string
  nickname: string | null
  addedAt: string
  latestScore: number | null
  latestRecommendation: string | null
  analyzedAt: string | null
  status: FleetVehicleStatus
}

export interface AddFleetVehicleRequest {
  registrationNumber: string
  nickname?: string
}
