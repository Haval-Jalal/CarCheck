import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Search, FileText, CheckCircle, XCircle, Loader2, ExternalLink, Printer } from 'lucide-react'
import { useBulkSearch } from '@/hooks/use-business'
import { useSubscription } from '@/hooks/use-billing'
import type { BulkSearchItemResult } from '@/types/business.types'
import { cn } from '@/lib/utils'

const BUSINESS_TIER = 3

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-500' : score >= 45 ? 'text-yellow-500' : 'text-red-500'
  return (
    <div className={cn('text-2xl font-black tabular-nums', color)}>
      {Math.round(score)}
    </div>
  )
}

function ResultCard({ item }: { item: BulkSearchItemResult }) {
  const navigate = useNavigate()

  if (!item.success) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="pt-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-mono font-bold text-sm">{item.registrationNumber}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.error ?? 'Hittades inte'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border hover:border-blue-500/50 transition-colors">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-mono font-bold text-sm">{item.registrationNumber}</p>
              <p className="text-sm text-muted-foreground truncate">
                {item.brand} {item.model} {item.year && `(${item.year})`}
              </p>
              {item.mileage !== null && (
                <p className="text-xs text-muted-foreground">
                  {item.mileage.toLocaleString('sv-SE')} mil
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              {item.marketValueSek !== null && (
                <p className="text-xs text-muted-foreground">
                  {Math.round(item.marketValueSek / 1000)}k kr
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2"
                onClick={() => navigate(`/car/${item.carId}/analysis`)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Analys
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2"
                onClick={() => window.open(`/business/report/${item.carId}`, '_blank')}
              >
                <Printer className="h-3 w-3 mr-1" />
                Rapport
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BusinessDashboardPage() {
  const navigate = useNavigate()
  const { data: sub, isLoading: subLoading } = useSubscription()
  const bulkSearch = useBulkSearch()
  const [input, setInput] = useState('')

  const isBusinessUser = sub?.tier === BUSINESS_TIER && sub?.isActive

  if (subLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isBusinessUser) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold">Business krävs</h1>
        <p className="text-muted-foreground">
          Bulksökning och professionella rapporter kräver ett aktivt Business-abonnemang.
        </p>
        <Button onClick={() => navigate('/billing')}>
          Se Business-planen
        </Button>
      </div>
    )
  }

  const parseInput = () =>
    input
      .split(/[\n,;]+/)
      .map(r => r.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''))
      .filter(r => r.length >= 2)

  const handleSearch = () => {
    const regs = parseInput()
    if (regs.length === 0) return
    bulkSearch.mutate(regs)
  }

  const results = bulkSearch.data?.results ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-7 w-7 text-blue-500" />
        <div>
          <h1 className="text-2xl font-black">Business-sökning</h1>
          <p className="text-sm text-muted-foreground">
            Sök upp till 50 bilar på en gång
          </p>
        </div>
        <Badge className="ml-auto bg-blue-600 hover:bg-blue-600">Business</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Ange registreringsnummer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={'ABC123\nXYZ456\nDEF789'}
            className="font-mono text-sm min-h-[120px] resize-y"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {parseInput().length} regnummer · ett per rad, eller komma-/semikolonseparerat · max 50
            </p>
            <Button
              onClick={handleSearch}
              disabled={bulkSearch.isPending || parseInput().length === 0}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {bulkSearch.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Söker...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Sök alla
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {bulkSearch.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Sökningen misslyckades. Kontrollera att du har ett aktivt Business-abonnemang.
          </AlertDescription>
        </Alert>
      )}

      {bulkSearch.data && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold">{bulkSearch.data.total} bilar sökta</span>
            <span className="text-green-600 font-medium">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              {bulkSearch.data.succeeded} lyckades
            </span>
            {bulkSearch.data.failed > 0 && (
              <span className="text-red-500 font-medium">
                <XCircle className="h-4 w-4 inline mr-1" />
                {bulkSearch.data.failed} misslyckades
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => {
                results
                  .filter(r => r.success && r.carId)
                  .forEach(r => window.open(`/business/report/${r.carId}`, '_blank'))
              }}
              disabled={results.filter(r => r.success).length === 0}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Öppna alla rapporter
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {results.map(item => (
              <ResultCard key={item.registrationNumber} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
