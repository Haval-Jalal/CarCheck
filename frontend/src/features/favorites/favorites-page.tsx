import { useState } from 'react'
import { Link } from 'react-router'
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
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useFavorites(page)
  const removeMutation = useRemoveFavorite()

  const handleRemove = (carId: string) => {
    removeMutation.mutate(carId, {
      onSuccess: () => toast.success('Favorit borttagen'),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Favoriter</h1>
        <p className="text-muted-foreground">Sparade bilar du vill följa</p>
      </div>

      {data && data.items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Inga favoriter ännu"
          description="Sök efter en bil och spara den som favorit."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((fav) => (
              <Card key={fav.id} className="relative">
                <CardContent className="pt-4">
                  <Link to={`/car/${fav.carId}`} className="block">
                    <p className="font-semibold">
                      {fav.registrationNumber || 'Okänt reg.nr'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {fav.brand && fav.model
                        ? `${fav.brand} ${fav.model}`
                        : 'Bilinfo saknas'}
                      {fav.year ? ` (${fav.year})` : ''}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sparad {formatDate(fav.createdAt)}
                    </p>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
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
              hasMore={data.items.length === 20}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
