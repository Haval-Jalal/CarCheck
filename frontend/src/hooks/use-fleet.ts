import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fleetApi } from '@/api/fleet.api'
import { queryKeys } from '@/lib/query-keys'
import type { AddFleetVehicleRequest } from '@/types/fleet.types'

export function useFleet() {
  return useQuery({
    queryKey: queryKeys.fleet.list,
    queryFn: fleetApi.getFleet,
    retry: false,
  })
}

export function useAddFleetVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddFleetVehicleRequest) => fleetApi.addVehicle(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.fleet.list }),
  })
}

export function useRemoveFleetVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vehicleId: string) => fleetApi.removeVehicle(vehicleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.fleet.list }),
  })
}
