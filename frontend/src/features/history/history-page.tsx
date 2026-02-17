import { useState } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { History, Trash2 } from 'lucide-react'
import { useHistory, useDeleteHistoryEntry, useClearHistory } from '@/hooks/use-history'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ErrorDisplay } from '@/components/common/error-display'
import { EmptyState } from '@/components/common/empty-state'
import { PaginationControls } from '@/components/common/pagination-controls'
import { formatRelativeTime } from '@/lib/format'
import { toast } from 'sonner'

export function HistoryPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useHistory(page)
  const deleteEntry = useDeleteHistoryEntry()
  const clearHistory = useClearHistory()

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    deleteEntry.mutate(id, {
      onSuccess: () => toast.success('Sökning borttagen'),
      onError: () => toast.error('Kunde inte ta bort sökning'),
    })
  }

  const handleClearAll = () => {
    if (!window.confirm('Är du säker på att du vill rensa all historik?')) return
    clearHistory.mutate(undefined, {
      onSuccess: () => toast.success('All historik rensad'),
      onError: () => toast.error('Kunde inte rensa historik'),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sökhistorik</h1>
          <p className="text-muted-foreground">Dina tidigare bilsökningar</p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <Badge variant="secondary">{data.todayCount} sökningar idag</Badge>
          )}
          {data && data.items.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={clearHistory.isPending}
            >
              Rensa all historik
            </Button>
          )}
        </div>
      </div>

      {data && data.items.length === 0 ? (
        <EmptyState
          icon={History}
          title="Ingen historik ännu"
          description="Sök efter en bil för att komma igång."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Senaste sökningar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data?.items.map((item) => (
                <Link
                  key={item.id}
                  to={`/car/${item.carId}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="font-medium">
                      {item.registrationNumber || 'Okänt'}{' '}
                      {item.brand && item.model && (
                        <span className="text-muted-foreground">
                          — {item.brand} {item.model}
                        </span>
                      )}
                    </p>
                    {item.year && (
                      <p className="text-sm text-muted-foreground">Årsmodell {item.year}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(item.searchedAt)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      aria-label="Ta bort sökning"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
            {data && (
              <PaginationControls
                page={page}
                hasMore={data.items.length === 20}
                onPageChange={setPage}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
