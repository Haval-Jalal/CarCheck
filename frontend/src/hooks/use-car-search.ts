import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { carsApi } from '@/api/cars.api'
import { queryKeys } from '@/lib/query-keys'
import type { CarSearchRequest, CarSearchResponse } from '@/types/car.types'

export function useCarSearch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CarSearchRequest) => carsApi.search(data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.history.all })
    },
  })
}

export function useCarById(carId: string | undefined, initialData?: CarSearchResponse) {
  return useQuery({
    queryKey: queryKeys.cars.byId(carId!),
    queryFn: () => carsApi.getById(carId!).then((r) => r.data),
    enabled: !!carId,
    initialData,
  })
}
