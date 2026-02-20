import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '@/api/favorites.api'
import { queryKeys } from '@/lib/query-keys'

export function useFavorites(page: number, pageSize = 20) {
  return useQuery({
    queryKey: queryKeys.favorites.list(page, pageSize),
    queryFn: () => favoritesApi.getFavorites({ page, pageSize }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useCheckFavorite(carId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.favorites.check(carId!),
    queryFn: () => favoritesApi.checkFavorite(carId!).then((r) => r.data.isFavorite),
    enabled: !!carId,
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (carId: string) => favoritesApi.addFavorite({ carId }).then((r) => r.data),
    onSuccess: (_data, carId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.check(carId) })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (carId: string) => favoritesApi.removeFavorite(carId),
    onSuccess: (_data, carId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.check(carId) })
    },
  })
}
