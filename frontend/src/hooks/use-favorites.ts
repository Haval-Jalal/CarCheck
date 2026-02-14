import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '@/api/favorites.api'

export function useFavorites(page: number, pageSize = 20) {
  return useQuery({
    queryKey: ['favorites', { page, pageSize }],
    queryFn: () => favoritesApi.getFavorites({ page, pageSize }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (carId: string) => favoritesApi.addFavorite({ carId }).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (carId: string) => favoritesApi.removeFavorite(carId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}
