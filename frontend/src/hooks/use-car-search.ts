import { useMutation, useQuery } from '@tanstack/react-query'
import { carsApi } from '@/api/cars.api'
import type { CarSearchRequest, CarSearchResponse } from '@/types/car.types'

export function useCarSearch() {
  return useMutation({
    mutationFn: (data: CarSearchRequest) => carsApi.search(data).then((r) => r.data),
  })
}

export function useCarById(carId: string | undefined, initialData?: CarSearchResponse) {
  return useQuery({
    queryKey: ['car', carId],
    queryFn: () => carsApi.getById(carId!).then((r) => r.data),
    enabled: !!carId,
    initialData,
  })
}
