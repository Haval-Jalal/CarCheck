import { useParams, Link } from 'react-router'
import { Car, BarChart3, Banknote, ClipboardList, Shield, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { NegotiationTips } from '@/features/car/components/negotiation-tips'
import { usePublicCarAnalysis } from '@/hooks/use-car-analysis'
import { getScoreColor, getScoreBgColor } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AnalysisBreakdown } from '@/types/car.types'

const FACTOR_GROUPS = [
  {
    title: 'Fordonets skick',
    icon: <Car className="h-4 w-4" />,
    items: [
      { key: 'ageScore' as keyof AnalysisBreakdown, label: 'Ålder', weight: '12%' },
      { key: 'mileageScore' as keyof AnalysisBreakdown, label: 'Miltal', weight: '12%' },
      { key: 'inspectionScore' as keyof AnalysisBreakdown, label: 'Besiktning', weight: '10%' },
    ],
  },
  {
    title: 'Ekonomi & juridik',
    icon: <Banknote className="h-4 w-4" />,
    items: [
      { key: 'debtFinanceScore' as keyof AnalysisBreakdown, label: 'Skuld & ekonomi', weight: '15%' },
      { key: 'marketValueScore' as keyof AnalysisBreakdown, label: 'Marknadsvärde', weight: '5%' },
      { key: 'environmentScore' as keyof AnalysisBreakdown, label: 'Miljö & skatt', weight: '5%' },
    ],
  },
  {
    title: 'Historik & underhåll',
    icon: <ClipboardList className="h-4 w-4" />,
    items: [
      { key: 'insuranceScore' as keyof AnalysisBreakdown, label: 'Försäkring', weight: '9%' },
      { key: 'serviceHistoryScore' as keyof AnalysisBreakdown, label: 'Servicehistorik', weight: '8%' },
      { key: 'ownerHistoryScore' as keyof AnalysisBreakdown, label: 'Ägarhistorik', weight: '5%' },
    ],
  },
  {
    title: 'Säkerhet & tillförlitlighet',
    icon: <Shield className="h-4 w-4" />,
    items: [
      { key: 'drivetrainScore' as keyof AnalysisBreakdown, label: 'Drivlina', weight: '8%' },
      { key: 'recallScore' as keyof AnalysisBreakdown, label: 'Återkallelser', weight: '6%' },
      { key: 'theftSecurityScore' as keyof AnalysisBreakdown, label: 'Stöld & säkerhet', weight: '5%' },
    ],
  },
]

export function SharePage() {
  const { carId } = useParams<{ carId: string }>()
  const { data: analysis, isLoading, error } = usePublicCarAnalysis(carId)

  const scoreRounded = analysis ? Math.round(analysis.score) : 0
  const hasPurchaseBlock = analysis?.breakdown.debtFinanceScore === 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold">
            <Car className="h-4 w-4 text-blue-500" />
            CarCheck
          </Link>
          <Button asChild size="sm">
            <Link to="/register">Skapa konto gratis</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="mb-2 text-4xl">404</p>
            <h1 className="mb-2 text-xl font-bold">Analysen hittades inte</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Länken kan vara ogiltig eller så har analysen tagits bort.
            </p>
            <Button asChild>
              <Link to="/">Tillbaka till startsidan</Link>
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold">
                {analysis.brand} {analysis.model} — Analys
              </h1>
              <p className="text-muted-foreground">{analysis.registrationNumber}</p>
            </div>

            {/* Purchase block */}
            {hasPurchaseBlock && (
              <Alert variant="destructive">
                <AlertTitle>Köpspärr registrerad</AlertTitle>
                <AlertDescription>
                  Fordonet har en aktiv köpspärr hos Kronofogden. Köp avråds starkt.
                </AlertDescription>
              </Alert>
            )}

            {/* Score + Recommendation */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div
                    className={cn(
                      'flex h-28 w-28 items-center justify-center rounded-full border-4',
                      scoreRounded >= 70 ? 'border-green-500' : scoreRounded >= 40 ? 'border-yellow-500' : 'border-red-500'
                    )}
                  >
                    <span className={cn('text-4xl font-bold', getScoreColor(scoreRounded))}>
                      {scoreRounded}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">av 100</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4" />
                    Rekommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={cn('text-sm px-3 py-1', getScoreBgColor(scoreRounded))}>
                    {analysis.recommendation}
                  </Badge>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Baserat på en viktad analys av tolv kategorier.
                  </p>
                  <p className="mt-3 text-xs italic text-muted-foreground/70">
                    Analysen baseras på tillgänglig fordonsdata och ersätter inte en professionell besiktning.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Negotiation tips */}
            <NegotiationTips breakdown={analysis.breakdown} details={analysis.details} />

            {/* Factor breakdown (read-only, no drill-down) */}
            <div className="grid gap-4 md:grid-cols-2">
              {FACTOR_GROUPS.map((group) => (
                <Card key={group.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {group.icon}
                      {group.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {group.items.map(({ key, label, weight }) => {
                      const value = Math.round(analysis.breakdown[key])
                      return (
                        <div key={key} className="flex items-center gap-2 rounded-lg px-2 py-2.5">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{label}</span>
                              <span className="text-muted-foreground">{value}/100 ({weight})</span>
                            </div>
                            <Progress value={value} className="h-2" />
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
              <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
                <div className="flex-1">
                  <h2 className="text-lg font-bold">Vill du göra en egen analys?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Skapa ett gratis konto och sök på vilken bil som helst — du får rekommendation,
                    förhandlingstips och sparad historik.
                  </p>
                </div>
                <Button asChild className="shrink-0">
                  <Link to="/register">Kom igång gratis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
