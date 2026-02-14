import { useParams, Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { useCarAnalysis } from '@/hooks/use-car-analysis'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ErrorDisplay } from '@/components/common/error-display'
import { getScoreColor, getScoreBgColor } from '@/lib/format'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, { label: string; weight: string }> = {
  ageScore: { label: 'Ålder', weight: '25%' },
  mileageScore: { label: 'Miltal', weight: '25%' },
  insuranceScore: { label: 'Försäkring', weight: '20%' },
  recallScore: { label: 'Återkallelser', weight: '15%' },
  inspectionScore: { label: 'Besiktning', weight: '15%' },
}

export function CarAnalysisPage() {
  const { carId } = useParams<{ carId: string }>()
  const { data: analysis, isLoading, error } = useCarAnalysis(carId)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />
  if (!analysis) return null

  const scoreRounded = Math.round(analysis.score)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/car/${carId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {analysis.brand} {analysis.model} — Analys
          </h1>
          <p className="text-muted-foreground">{analysis.registrationNumber}</p>
        </div>
      </div>

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
              Baserat på en viktad analys av fem kategorier: ålder, miltal,
              försäkringshistorik, återkallelser och besiktningsresultat.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detaljerad uppdelning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(CATEGORY_LABELS).map(([key, { label, weight }]) => {
            const value = Math.round(
              analysis.breakdown[key as keyof typeof analysis.breakdown]
            )
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {value}/100 ({weight})
                  </span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/dashboard">Ny sökning</Link>
        </Button>
      </div>
    </div>
  )
}
