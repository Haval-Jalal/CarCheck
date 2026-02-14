import { useQuery } from '@tanstack/react-query'
import { carsApi } from '@/api/cars.api'

export function useCarAnalysis(carId: string | undefined) {
  return useQuery({
    queryKey: ['cars', carId, 'analysis'],
    queryFn: () => carsApi.getAnalysis(carId!).then((r) => r.data),
    enabled: !!carId,
  })
}
