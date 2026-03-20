import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useHistory(page)
  const deleteEntry = useDeleteHistoryEntry()
  const clearHistory = useClearHistory()

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    deleteEntry.mutate(id, {
      onSuccess: () => toast.success(t('history.deleteError')),
      onError: () => toast.error(t('history.deleteError')),
    })
  }

  const handleClearAll = () => {
    if (!window.confirm(t('history.clearConfirm'))) return
    clearHistory.mutate(undefined, {
      onSuccess: () => {
        setPage(1)
        toast.success(t('history.clearAll'))
      },
      onError: () => toast.error(t('history.clearError')),
    })
  }

  const anyPending = deleteEntry.isPending || clearHistory.isPending

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div data-tour="history-header">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
            {t('history.title')}
          </h1>
          <p className="text-muted-foreground">{t('history.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {data && (
            <Badge variant="secondary">{data.todayCount} {t('dashboard.recentSearches').toLowerCase()}</Badge>
          )}
          {data && data.items.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={anyPending}
            >
              {t('history.clearAll')}
            </Button>
          )}
        </div>
      </div>

      {data && data.items.length === 0 ? (
        <EmptyState
          icon={History}
          title={t('history.empty')}
          description={t('history.emptySub')}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.recentSearches')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data?.items.map((item) => (
                <Link
                  key={item.id}
                  to={`/car/${item.carId}/analysis`}
                  className="flex items-center justify-between py-3 transition-colors duration-200 hover:bg-muted/50 -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="font-medium">
                      {item.registrationNumber || t('history.unknownCar')}{' '}
                      {item.brand && item.model && (
                        <span className="text-muted-foreground">
                          — {item.brand} {item.model}
                        </span>
                      )}
                    </p>
                    {item.year && (
                      <p className="text-sm text-muted-foreground">{item.year}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(item.searchedAt)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={anyPending}
                      className="text-muted-foreground transition-colors duration-200 hover:text-destructive p-2 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40"
                      aria-label={t('history.deleteError')}
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
                hasMore={page * data.pageSize < data.totalCount}
                onPageChange={setPage}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
