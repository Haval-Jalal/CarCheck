import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search } from 'lucide-react'
import { SearchForm } from './components/search-form'
import { QuotaIndicator } from './components/quota-indicator'
import { useCarSearch } from '@/hooks/use-car-search'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

export function DashboardPage() {
  const navigate = useNavigate()
  const searchMutation = useCarSearch()

  const handleSearch = (regNumber: string) => {
    searchMutation.mutate(
      { registrationNumber: regNumber },
      {
        onSuccess: (data) => {
          navigate(`/car/${data.carId}`, { state: { car: data } })
        },
      }
    )
  }

  const errorMessage = searchMutation.error
    ? (searchMutation.error as AxiosError<ApiError>).response?.data?.error ||
      'Sökningen misslyckades. Försök igen.'
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Sök efter en bil för att komma igång</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
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
    </div>
  )
}
