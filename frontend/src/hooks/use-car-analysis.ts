import { useQuery } from '@tanstack/react-query'
import { carsApi } from '@/api/cars.api'
import { queryKeys } from '@/lib/query-keys'

// Analysis results are stable — cache for 30 minutes to avoid unnecessary re-fetches.
const ANALYSIS_STALE_TIME = 30 * 60 * 1000

export function useCarAnalysis(carId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cars.analysis(carId!),
    queryFn: () => carsApi.getAnalysis(carId!).then((r) => r.data),
    enabled: !!carId,
    staleTime: ANALYSIS_STALE_TIME,
  })
}

export function usePublicCarAnalysis(carId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cars.publicAnalysis(carId!),
    queryFn: () => carsApi.getPublicAnalysis(carId!).then((r) => r.data),
    enabled: !!carId,
    staleTime: ANALYSIS_STALE_TIME,
  })
}
