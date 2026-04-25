import apiClient from './client'
import type { FleetVehicleResponse, AddFleetVehicleRequest } from '@/types/fleet.types'

export const fleetApi = {
  getFleet: () =>
    apiClient.get<FleetVehicleResponse[]>('/fleet').then((r) => r.data),

  addVehicle: (data: AddFleetVehicleRequest) =>
    apiClient.post<FleetVehicleResponse>('/fleet', data).then((r) => r.data),

  removeVehicle: (vehicleId: string) =>
    apiClient.delete(`/fleet/${vehicleId}`),
}
