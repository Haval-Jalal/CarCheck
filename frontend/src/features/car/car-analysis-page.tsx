import { useState, useCallback, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router'
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
  Users,
  ShieldCheck,
  Cog,
  Tag,
  ClipboardCheck,
  Lightbulb,
  Calculator,
  DollarSign,
  FileText,
  Printer,
  Heart,
  Fuel,
  Palette,
  Gauge,
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
import { InspectionChecklist } from './components/inspection-checklist'
import { Warranties } from './components/warranties'
import { TimingBelt } from './components/timing-belt'
import { KnownProblemsStats } from './components/known-problems-stats'
import { NewPriceSpec } from './components/new-price-spec'
import { useCheckFavorite, useAddFavorite, useRemoveFavorite } from '@/hooks/use-favorites'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatSek, formatMil, translateColor } from '@/lib/format'
import type { AnalysisBreakdown, CarSearchResponse } from '@/types/car.types'

// ── Section types ─────────────────────────────────────────────────────────────

type SectionId =
  | 'oversikt'
  | 'garantier'
  | 'kamrem'
  | 'nypris'
  | 'kanda-problem'
  | 'forhandlingstips'
  | 'kostnadsprognos'
  | 'deal-score'
  | 'besiktningschecklista'
  | 'pdf'

interface SectionDef {
  id: SectionId
  label: string
  icon: React.ReactNode
}

const SECTIONS: SectionDef[] = [
  { id: 'oversikt', label: 'Översikt & Analys', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'garantier', label: 'Garantier', icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'kamrem', label: 'Kamrem / Kedja', icon: <Cog className="h-4 w-4" /> },
  { id: 'kanda-problem', label: 'Kända problem', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'nypris', label: 'Nypris', icon: <Tag className="h-4 w-4" /> },
  { id: 'forhandlingstips', label: 'Förhandlingstips', icon: <Lightbulb className="h-4 w-4" /> },
  { id: 'kostnadsprognos', label: 'Kostnadsprognos', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'deal-score', label: 'Deal Score', icon: <Calculator className="h-4 w-4" /> },
  { id: 'besiktningschecklista', label: 'Checklista', icon: <ClipboardCheck className="h-4 w-4" /> },
  { id: 'pdf', label: 'Skriv ut / PDF', icon: <FileText className="h-4 w-4" /> },
]

// ── 12-faktor grupper ─────────────────────────────────────────────────────────

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

// ── Score gauge (alltid synlig) ───────────────────────────────────────────────

function ScoreGauge({ score, recommendation }: { score: number; recommendation: string }) {
  const ringColor =
    score >= 70 ? 'border-green-500' :
    score >= 40 ? 'border-yellow-500' :
    'border-red-500'

  const markerColor =
    score >= 70 ? '#22c55e' :
    score >= 40 ? '#eab308' :
    '#ef4444'

  return (
    <div data-tour="analysis-score" className="rounded-xl border border-border bg-card px-4 py-4 space-y-3 sm:px-5 sm:space-y-4">
      <div className="flex items-center gap-4">
        {/* Score circle */}
        <div className={cn(
          'flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 sm:h-20 sm:w-20',
          ringColor,
        )}>
          <span className={cn('text-2xl font-bold tabular-nums sm:text-3xl', getScoreColor(score))}>
            {score}
          </span>
        </div>

        {/* Label + gradient bar */}
        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn('text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1', getScoreBgColor(score))}>
              {recommendation}
            </Badge>
            <span className="text-xs text-muted-foreground">av 100</span>
          </div>

          {/* Gradient bar */}
          <div className="space-y-1">
            <div
              className="relative h-3 w-full rounded-full"
              style={{
                background: 'linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)',
              }}
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md"
                style={{
                  left: `${score}%`,
                  backgroundColor: markerColor,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground select-none">
              <span>Undvik</span>
              <span>50</span>
              <span className="hidden xs:inline">Rekommenderas</span>
              <span className="xs:hidden">Topp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CarAnalysisPage() {
  const { carId } = useParams<{ carId: string }>()
  const location = useLocation()
  const carState = (location.state as { car?: CarSearchResponse })?.car
  const { data: analysis, isLoading, error } = useCarAnalysis(carId)
  const [activeSection, setActiveSection] = useState<SectionId>('oversikt')
  const [selectedFactor, setSelectedFactor] = useState<{
    key: keyof AnalysisBreakdown
    label: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const queryClient = useQueryClient()
  const { data: isFavorite } = useCheckFavorite(carId)
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const handleToggleFavorite = () => {
    if (!carId) return
    queryClient.setQueryData(['favorite-check', carId], !isFavorite)
    if (isFavorite) {
      removeFavorite.mutate(carId, {
        onSuccess: () => toast.success('Borttagen från favoriter'),
        onError: () => {
          queryClient.setQueryData(['favorite-check', carId], true)
          toast.error('Kunde inte ta bort favorit')
        },
      })
    } else {
      addFavorite.mutate(carId, {
        onSuccess: () => toast.success('Sparad som favorit'),
        onError: () => {
          queryClient.setQueryData(['favorite-check', carId], false)
          toast.error('Kunde inte spara favorit')
        },
      })
    }
  }

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/share/${carId}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [carId])

  useEffect(() => {
    if (analysis) {
      document.title = `${analysis.brand} ${analysis.model} (${analysis.registrationNumber}) — CarCheck`
      return () => { document.title = 'CarCheck' }
    }
  }, [analysis])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />
  if (!analysis) return null

  const scoreRounded = Math.round(analysis.score)
  const hasPurchaseBlock = analysis.breakdown.debtFinanceScore === 0
  const currentMileageKm = (analysis.details?.mileageHistory?.at(-1)?.mileage ?? 0) * 10

  const visibleSections = SECTIONS.filter((s) => {
    if (s.id === 'nypris' && analysis.year < 2020) return false
    return true
  })

  // ── Section content ─────────────────────────────────────────────────────────

  function renderSection() {
    switch (activeSection) {

      case 'oversikt':
        return (
          <div className="space-y-5">
            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { label: 'Märke & Modell', value: `${analysis!.brand} ${analysis!.model}`, icon: <Car className="h-3.5 w-3.5" /> },
                { label: 'Årsmodell', value: String(analysis!.year), icon: null },
                { label: 'Registreringsnummer', value: analysis!.registrationNumber, icon: null },
                { label: 'Miltal', value: formatMil(analysis!.details?.mileageHistory?.at(-1)?.mileage ?? analysis!.mileage), icon: <Gauge className="h-3.5 w-3.5" /> },
                ...(analysis!.fuelType ? [{ label: 'Bränsle', value: analysis!.fuelType, icon: <Fuel className="h-3.5 w-3.5" /> }] : []),
                ...(analysis!.horsePower ? [{ label: 'Hästkrafter', value: `${analysis!.horsePower} hk`, icon: null }] : []),
                ...(analysis!.color ? [{ label: 'Färg', value: translateColor(analysis!.color), icon: <Palette className="h-3.5 w-3.5" /> }] : []),
                ...((analysis!.details?.marketValueSek ?? carState?.marketValueSek) ? [{ label: 'Marknadsvärde', value: formatSek((analysis!.details?.marketValueSek ?? carState?.marketValueSek)!), icon: null }] : []),
              ].map((f) => (
                <div key={f.label} className="rounded-lg border border-border bg-card px-4 py-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">{f.icon}{f.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>

            {analysis!.searchCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-400">
                <Users className="h-4 w-4 shrink-0" />
                {analysis!.searchCount}{' '}
                {analysis!.searchCount === 1 ? 'person' : 'personer'} har sökt på denna bil
              </div>
            )}

            {/* 12-faktor detaljanalys */}
            <div data-tour="analysis-factors" className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Detaljanalys — 12 faktorer</p>
              <div className="grid gap-3 md:grid-cols-2">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.title} className="rounded-xl border border-border bg-card p-4 space-y-1">
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {group.icon}
                      {group.title}
                    </div>
                    {group.items.map(({ key, label, weight }) => {
                      const value = Math.round(analysis!.breakdown[key])
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedFactor({ key, label })}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{label}</span>
                              <span className="text-xs text-muted-foreground">
                                {value}/100
                                <span className="ml-1 text-muted-foreground/60">({weight})</span>
                              </span>
                            </div>
                            <Progress value={value} className="h-1.5" />
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground/50 italic">
              Analysen baseras på tillgänglig fordonsdata och ersätter inte en professionell besiktning.
            </p>
          </div>
        )

      case 'garantier':
        return (
          <Warranties
            brand={analysis!.brand}
            firstRegistrationDate={analysis!.details?.firstRegistrationDate ?? null}
            mileageKm={currentMileageKm}
          />
        )

      case 'kamrem':
        return (
          <TimingBelt
            brand={analysis!.brand}
            fuelType={null}
            year={analysis!.year}
            mileageKm={currentMileageKm}
          />
        )

      case 'nypris':
        return (
          <NewPriceSpec
            brand={analysis!.brand}
            model={analysis!.model}
            year={analysis!.year}
            currentMarketValue={analysis!.details?.marketValueSek ?? null}
          />
        )

      case 'kanda-problem':
        return (
          <KnownProblemsStats
            brand={analysis!.brand}
            model={analysis!.model}
            year={analysis!.year}
          />
        )

      case 'forhandlingstips':
        return (
          <NegotiationTips
            breakdown={analysis!.breakdown}
            details={analysis!.details}
          />
        )

      case 'kostnadsprognos':
        return (
          <FutureCosts
            breakdown={analysis!.breakdown}
            details={analysis!.details}
            year={analysis!.year}
            mileage={analysis!.details?.mileageHistory?.at(-1)?.mileage ?? 0}
          />
        )

      case 'deal-score':
        return (
          <DealScore
            qualityScore={analysis!.score}
            details={analysis!.details}
          />
        )

      case 'besiktningschecklista':
        return (
          <InspectionChecklist
            breakdown={analysis!.breakdown}
            details={analysis!.details}
          />
        )

      case 'pdf':
        return (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <h2 className="text-base font-semibold">Skriv ut / Spara som PDF</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Skriv ut hela rapporten eller spara som PDF via din webbläsares utskriftsfunktion.
            </p>
            <Button onClick={() => window.print()} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Skriv ut rapport
            </Button>
            <p className="text-xs text-muted-foreground/60 italic">
              Tips: Välj "Spara som PDF" i utskriftsdialogen för att spara en digital kopia.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  // ── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight truncate sm:text-lg">
              {analysis.brand} {analysis.model} {analysis.year}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">{analysis.registrationNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={addFavorite.isPending || removeFavorite.isPending}
            aria-label={isFavorite ? 'Ta bort från favoriter' : 'Spara som favorit'}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Dela">
            <Share2 className={`h-4 w-4 ${copied ? 'text-green-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.print()} aria-label="Skriv ut PDF">
            <Printer className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Purchase block warning */}
      {hasPurchaseBlock && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Köpspärr registrerad</AlertTitle>
          <AlertDescription>
            Fordonet har en aktiv köpspärr hos Kronofogden. Köp avråds starkt.
          </AlertDescription>
        </Alert>
      )}

      {/* Score gauge — alltid synlig oavsett aktiv sektion */}
      <ScoreGauge score={scoreRounded} recommendation={analysis.recommendation} />

      {/* Mobile: horisontell scrollmeny */}
      <div role="tablist" aria-label="Analysavsnitt" className="flex md:hidden gap-1 overflow-x-auto pb-1">
        {visibleSections.map((s) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={activeSection === s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors shrink-0',
              activeSection === s.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Desktop: sidebar (nav only) + content */}
      <div className="hidden md:flex gap-5 items-start">

        {/* Sidebar — enbart navigering, ingen poäng här */}
        <aside role="tablist" aria-label="Analysavsnitt" className="w-48 shrink-0 sticky top-4 space-y-0.5">
          {visibleSections.map((s) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={activeSection === s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left',
                activeSection === s.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent',
              )}
            >
              {s.icon}
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </aside>

        {/* Sektionsinnehåll */}
        <main className="flex-1 min-w-0">
          {renderSection()}
        </main>
      </div>

      {/* Mobile: sektionsinnehåll */}
      <div className="md:hidden">
        {renderSection()}
      </div>

      {/* Faktordetalj-sheet */}
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
