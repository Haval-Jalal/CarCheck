import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  BarChart3,
  Car,
  Banknote,
  ClipboardList,
  Shield,
  AlertTriangle,
  ChevronRight,
  Share2,
} from 'lucide-react'
import { useCarAnalysis } from '@/hooks/use-car-analysis'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ErrorDisplay } from '@/components/common/error-display'
import { getScoreColor, getScoreBgColor } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FactorDetailSheet } from './components/factor-detail-sheet'
import { NegotiationTips } from './components/negotiation-tips'
import { FutureCosts } from './components/future-costs'
import { DealScore } from './components/deal-score'
import type { AnalysisBreakdown } from '@/types/car.types'

interface CategoryItem {
  key: keyof AnalysisBreakdown
  label: string
  weight: string
}

interface CategoryGroup {
  title: string
  icon: React.ReactNode
  items: CategoryItem[]
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: 'Fordonets skick',
    icon: <Car className="h-4 w-4" />,
    items: [
      { key: 'ageScore', label: 'Ålder', weight: '12%' },
      { key: 'mileageScore', label: 'Miltal', weight: '12%' },
      { key: 'inspectionScore', label: 'Besiktning', weight: '10%' },
    ],
  },
  {
    title: 'Ekonomi & juridik',
    icon: <Banknote className="h-4 w-4" />,
    items: [
      { key: 'debtFinanceScore', label: 'Skuld & ekonomi', weight: '15%' },
      { key: 'marketValueScore', label: 'Marknadsvärde', weight: '5%' },
      { key: 'environmentScore', label: 'Miljö & skatt', weight: '5%' },
    ],
  },
  {
    title: 'Historik & underhåll',
    icon: <ClipboardList className="h-4 w-4" />,
    items: [
      { key: 'insuranceScore', label: 'Försäkring', weight: '9%' },
      { key: 'serviceHistoryScore', label: 'Servicehistorik', weight: '8%' },
      { key: 'ownerHistoryScore', label: 'Ägarhistorik', weight: '5%' },
    ],
  },
  {
    title: 'Säkerhet & tillförlitlighet',
    icon: <Shield className="h-4 w-4" />,
    items: [
      { key: 'drivetrainScore', label: 'Drivlina', weight: '8%' },
      { key: 'recallScore', label: 'Återkallelser', weight: '6%' },
      { key: 'theftSecurityScore', label: 'Stöld & säkerhet', weight: '5%' },
    ],
  },
]

export function CarAnalysisPage() {
  const { carId } = useParams<{ carId: string }>()
  const { data: analysis, isLoading, error } = useCarAnalysis(carId)
  const [selectedFactor, setSelectedFactor] = useState<{
    key: keyof AnalysisBreakdown
    label: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/share/${carId}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [carId])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />
  if (!analysis) return null

  const scoreRounded = Math.round(analysis.score)
  const hasPurchaseBlock = analysis.breakdown.debtFinanceScore === 0

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

      {/* Purchase block warning */}
      {hasPurchaseBlock && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Köpspärr registrerad</AlertTitle>
          <AlertDescription>
            Fordonet har en aktiv köpspärr hos Kronofogden. Köp avråds starkt
            — kontrollera skuldsituationen innan vidare åtgärder.
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
              Baserat på en viktad analys av tolv kategorier: ålder, miltal,
              besiktning, skuld, försäkring, servicehistorik, drivlina,
              återkallelser, ägarhistorik, marknadsvärde, miljö och säkerhet.
            </p>
            <p className="mt-3 text-xs text-muted-foreground/70 italic">
              Denna analys baseras uteslutande på tillgänglig fordonsdata och utgör inte
              en bedömning av fordonets faktiska skick. En professionell besiktning
              rekommenderas alltid innan köpbeslut. CarCheck ansvarar inte för fordonets
              verkliga kondition.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deal Score */}
      <DealScore qualityScore={analysis.score} details={analysis.details} />

      {/* Negotiation tips */}
      <NegotiationTips breakdown={analysis.breakdown} details={analysis.details} />

      {/* Future costs estimate */}
      <FutureCosts
        breakdown={analysis.breakdown}
        details={analysis.details}
        year={analysis.year}
        mileage={analysis.details?.mileageHistory?.at(-1)?.mileage ?? 0}
      />

      {/* Grouped breakdown — 2x2 grid, clickable rows */}
      <div className="grid gap-4 md:grid-cols-2">
        {CATEGORY_GROUPS.map((group) => (
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
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedFactor({ key, label })}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-muted-foreground">
                          {value}/100 ({weight})
                        </span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/dashboard">Ny sökning</Link>
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          {copied ? 'Kopierad!' : 'Dela analys'}
        </Button>
      </div>

      {/* Factor detail sheet */}
      <FactorDetailSheet
        open={selectedFactor !== null}
        onOpenChange={(open) => !open && setSelectedFactor(null)}
        factorKey={selectedFactor?.key ?? null}
        factorLabel={selectedFactor?.label ?? ''}
        score={selectedFactor ? analysis.breakdown[selectedFactor.key] : 0}
        details={analysis.details}
        year={analysis.year}
      />
    </div>
  )
}
