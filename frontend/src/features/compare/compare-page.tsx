import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, ArrowUpDown, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCarSearch, useCarById } from '@/hooks/use-car-search'
import { useCarAnalysis } from '@/hooks/use-car-analysis'
import { getScoreColor, getScoreBgColor } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'
import type { AnalysisBreakdown } from '@/types/car.types'

const FACTORS: { key: keyof AnalysisBreakdown; label: string }[] = [
  { key: 'ageScore', label: 'Ålder' },
  { key: 'mileageScore', label: 'Miltal' },
  { key: 'inspectionScore', label: 'Besiktning' },
  { key: 'debtFinanceScore', label: 'Skuld & ekonomi' },
  { key: 'marketValueScore', label: 'Marknadsvärde' },
  { key: 'environmentScore', label: 'Miljö & skatt' },
  { key: 'insuranceScore', label: 'Försäkring' },
  { key: 'serviceHistoryScore', label: 'Servicehistorik' },
  { key: 'ownerHistoryScore', label: 'Ägarhistorik' },
  { key: 'drivetrainScore', label: 'Drivlina' },
  { key: 'recallScore', label: 'Återkallelser' },
  { key: 'theftSecurityScore', label: 'Stöld & säkerhet' },
]

function ScoreCircle({ score }: { score: number }) {
  const rounded = Math.round(score)
  return (
    <div
      className={cn(
        'mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4',
        rounded >= 70 ? 'border-green-500' : rounded >= 40 ? 'border-yellow-500' : 'border-red-500'
      )}
    >
      <span className={cn('text-2xl font-bold', getScoreColor(rounded))}>{rounded}</span>
    </div>
  )
}

function FactorBar({ value, opponent }: { value: number; opponent: number | null }) {
  const rounded = Math.round(value)
  const isWinner = opponent !== null && value >= opponent
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-semibold', isWinner && opponent !== value && 'text-green-600 dark:text-green-400')}>
          {rounded}
        </span>
      </div>
      <Progress
        value={rounded}
        className={cn(
          'h-2',
          rounded >= 70 ? '[&>div]:bg-green-500' : rounded >= 40 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
        )}
      />
    </div>
  )
}

function CarSearchBox({
  label,
  onFound,
}: {
  label: string
  onFound: (carId: string) => void
}) {
  const [regNumber, setRegNumber] = useState('')
  const search = useCarSearch()

  const errorMessage = search.error
    ? (search.error as AxiosError<ApiError>).response?.data?.error || 'Sökningen misslyckades.'
    : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNumber.trim()) return
    search.mutate(
      { registrationNumber: regNumber.trim() },
      { onSuccess: (data) => onFound(data.carId) }
    )
  }

  return (
    <form onSubmit={handleSearch} className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        <Input
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
          placeholder="ABC 123"
          maxLength={10}
          className="text-center font-mono text-lg font-bold tracking-widest"
        />
        <Button type="submit" disabled={search.isPending || !regNumber.trim()}>
          {search.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sök'}
        </Button>
      </div>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
        </Alert>
      )}
    </form>
  )
}

export function ComparePage() {
  const [carId1, setCarId1] = useState<string | null>(null)
  const [carId2, setCarId2] = useState<string | null>(null)

  const car1 = useCarById(carId1 ?? undefined)
  const car2 = useCarById(carId2 ?? undefined)
  const analysis1 = useCarAnalysis(carId1 ?? undefined)
  const analysis2 = useCarAnalysis(carId2 ?? undefined)

  const bothLoading = carId1 && carId2 && (analysis1.isLoading || analysis2.isLoading)
  const bothReady = analysis1.data && analysis2.data
  const a1 = analysis1.data
  const a2 = analysis2.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Jämför bilar</h1>
          <p className="text-muted-foreground">Sök två bilar och se dem sida vid sida</p>
        </div>
      </div>

      {/* Search inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <CarSearchBox label="Bil 1" onFound={setCarId1} />
            {car1.data && (
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {car1.data.brand} {car1.data.model} {car1.data.year}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <CarSearchBox label="Bil 2" onFound={setCarId2} />
            {car2.data && (
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {car2.data.brand} {car2.data.model} {car2.data.year}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {bothLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Hämtar analyser…
        </div>
      )}

      {/* Comparison result */}
      {bothReady && a1 && a2 && (
        <>
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpDown className="h-4 w-4" />
                Sammanfattning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                {/* Car 1 */}
                <div className="space-y-3 text-center">
                  <div>
                    <p className="font-bold">{a1.brand} {a1.model}</p>
                    <p className="text-xs text-muted-foreground">{a1.registrationNumber} · {a1.year}</p>
                  </div>
                  <ScoreCircle score={a1.score} />
                  <Badge className={cn('text-xs', getScoreBgColor(Math.round(a1.score)))}>
                    {a1.recommendation}
                  </Badge>
                </div>

                {/* VS */}
                <div className="text-center text-xs font-bold text-muted-foreground">VS</div>

                {/* Car 2 */}
                <div className="space-y-3 text-center">
                  <div>
                    <p className="font-bold">{a2.brand} {a2.model}</p>
                    <p className="text-xs text-muted-foreground">{a2.registrationNumber} · {a2.year}</p>
                  </div>
                  <ScoreCircle score={a2.score} />
                  <Badge className={cn('text-xs', getScoreBgColor(Math.round(a2.score)))}>
                    {a2.recommendation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Factor comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Faktor för faktor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_120px_1fr] gap-3 text-xs font-semibold text-muted-foreground">
                  <span className="truncate">{a1.brand} {a1.model}</span>
                  <span className="text-center">Faktor</span>
                  <span className="truncate text-right">{a2.brand} {a2.model}</span>
                </div>

                {FACTORS.map(({ key, label }) => {
                  const v1 = a1.breakdown[key]
                  const v2 = a2.breakdown[key]
                  const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0
                  return (
                    <div key={key} className="grid grid-cols-[1fr_120px_1fr] items-center gap-3">
                      <div className={cn(winner === 1 && 'opacity-100', winner === 2 && 'opacity-50')}>
                        <FactorBar value={v1} opponent={v2} />
                      </div>
                      <p className={cn(
                        'text-center text-xs font-medium',
                        winner === 1 ? 'text-green-600 dark:text-green-400' :
                        winner === 2 ? 'text-red-500' : 'text-muted-foreground'
                      )}>
                        {label}
                      </p>
                      <div className={cn(winner === 2 && 'opacity-100', winner === 1 && 'opacity-50')}>
                        <FactorBar value={v2} opponent={v1} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Verdict */}
          {Math.round(a1.score) !== Math.round(a2.score) && (
            <Card className={cn(
              'border-2',
              Math.round(a1.score) > Math.round(a2.score)
                ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                : 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
            )}>
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground">Sammantaget bättre alternativ</p>
                <p className="mt-1 text-xl font-bold">
                  {Math.round(a1.score) > Math.round(a2.score)
                    ? `${a1.brand} ${a1.model} (${a1.registrationNumber})`
                    : `${a2.brand} ${a2.model} (${a2.registrationNumber})`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.abs(Math.round(a1.score) - Math.round(a2.score))} poäng bättre
                </p>
              </CardContent>
            </Card>
          )}

          {/* Links to full analyses */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to={`/car/${carId1}/analysis`}>Fullständig analys — {a1.registrationNumber}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/car/${carId2}/analysis`}>Fullständig analys — {a2.registrationNumber}</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
