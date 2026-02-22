import { useQuery } from '@tanstack/react-query'
import { carsApi } from '@/api/cars.api'
import { queryKeys } from '@/lib/query-keys'

export function useCarAnalysis(carId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cars.analysis(carId!),
    queryFn: () => carsApi.getAnalysis(carId!).then((r) => r.data),
    enabled: !!carId,
  })
}

export function usePublicCarAnalysis(carId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cars.publicAnalysis(carId!),
    queryFn: () => carsApi.getPublicAnalysis(carId!).then((r) => r.data),
    enabled: !!carId,
  })
}
