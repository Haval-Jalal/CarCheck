import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Trash2 } from 'lucide-react'
import { useFavorites, useRemoveFavorite } from '@/hooks/use-favorites'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ErrorDisplay } from '@/components/common/error-display'
import { EmptyState } from '@/components/common/empty-state'
import { PaginationControls } from '@/components/common/pagination-controls'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'

export function FavoritesPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useFavorites(page)
  const removeMutation = useRemoveFavorite()

  const handleRemove = (carId: string) => {
    removeMutation.mutate(carId, {
      onSuccess: () => toast.success(t('favorites.removeSuccess')),
      onError: () => toast.error(t('favorites.removeError')),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="space-y-6">
      <div data-tour="favorites-header">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
          {t('favorites.title')}
        </h1>
        <p className="text-muted-foreground">{t('favorites.subtitle')}</p>
      </div>

      {data && data.items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t('favorites.empty')}
          description={t('favorites.emptySub')}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((fav) => (
              <Card key={fav.id} className="group relative border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 dark:bg-white/[0.03]">
                <CardContent className="pt-4">
                  <Link to={`/car/${fav.carId}/analysis`} className="block">
                    <p className="font-semibold">
                      {fav.registrationNumber || t('favorites.unknownCar')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {fav.brand && fav.model
                        ? `${fav.brand} ${fav.model}`
                        : t('favorites.unknownCar')}
                      {fav.year ? ` (${fav.year})` : ''}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(fav.createdAt)}
                    </p>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-10 w-10 text-muted-foreground transition-colors duration-200 hover:text-destructive"
                    onClick={() => handleRemove(fav.carId)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {data && (
            <PaginationControls
              page={page}
              hasMore={data.items.length === data.pageSize}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
