import { useNavigate, useLocation, Link } from 'react-router'
import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Clock, ChevronRight, Car } from 'lucide-react'
import { SearchForm } from './components/search-form'
import { QuotaIndicator } from './components/quota-indicator'
import { useCarSearch } from '@/hooks/use-car-search'
import { useHistory } from '@/hooks/use-history'
import { formatRelativeTime } from '@/lib/format'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

function RecentSearches() {
  const { data } = useHistory(1, 5)
  const items = data?.items ?? []

  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Senaste sökningar
        </div>
        <Link to="/history" className="text-xs text-blue-500 hover:underline">
          Visa alla
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/car/${item.carId}/analysis`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-blue-500/40 hover:bg-blue-500/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800">
              <Car className="h-5 w-5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-base font-black tracking-widest text-foreground">
                {item.registrationNumber
                  ? item.registrationNumber.replace(/^([A-Za-z]{3})(\d{3})$/, '$1 $2').toUpperCase()
                  : '—'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {item.brand && item.model
                  ? `${item.brand} ${item.model}${item.year ? ` · ${item.year}` : ''}`
                  : 'Okänd bil'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(item.searchedAt)}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchMutation = useCarSearch()

  const didAutoSearch = useRef(false)

  const handleSearch = async (regNumber: string) => {
    try {
      const data = await searchMutation.mutateAsync({ registrationNumber: regNumber })
      navigate(`/car/${data.carId}/analysis`, { state: { car: data } })
    } catch {
      // searchMutation.error hanterar felvisningen
    }
  }

  useEffect(() => {
    const pending = (location.state as { pendingSearch?: string })?.pendingSearch
    if (pending && !didAutoSearch.current) {
      didAutoSearch.current = true
      window.history.replaceState({}, '')
      handleSearch(pending)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const errorMessage = searchMutation.error
    ? (searchMutation.error as AxiosError<ApiError>).response?.data?.error ||
      'Sökningen misslyckades. Försök igen.'
    : null

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="-mx-4 -mt-6 bg-gradient-to-r from-slate-900 to-blue-900 px-4 py-8 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold text-white">Kontrollera en bil</h1>
        <p className="mt-1 text-blue-200">Ange registreringsnummer för att starta analysen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Bilsökning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchForm onSearch={handleSearch} isLoading={searchMutation.isPending} />
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <QuotaIndicator />
        </CardContent>
      </Card>

      <RecentSearches />
    </div>
  )
}
