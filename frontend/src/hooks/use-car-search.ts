import { useMutation } from '@tanstack/react-query'
import { carsApi } from '@/api/cars.api'
import type { CarSearchRequest } from '@/types/car.types'

export function useCarSearch() {
  return useMutation({
    mutationFn: (data: CarSearchRequest) => carsApi.search(data).then((r) => r.data),
  })
}
