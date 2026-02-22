import { TrendingUp, Wrench, ShieldCheck, Fuel, RefreshCw, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalysisBreakdown, AnalysisDetails } from '@/types/car.types'

interface Props {
  breakdown: AnalysisBreakdown
  details: AnalysisDetails | null
  year: number
  mileage: number
}

interface CostItem {
  icon: React.ReactNode
  label: string
  minSek: number
  maxSek: number
  note: string
  certainty: 'known' | 'estimated'
}

function buildCostItems(
  breakdown: AnalysisBreakdown,
  details: AnalysisDetails | null,
  year: number,
  mileage: number,
): CostItem[] {
  const items: CostItem[] = []
  const currentYear = new Date().getFullYear()
  const carAge = currentYear - year

  // ── Fordonsskatt ──
  if (details?.annualTaxSek != null && details.annualTaxSek > 0) {
    items.push({
      icon: <RefreshCw className="h-4 w-4 text-slate-400" />,
      label: 'Fordonsskatt',
      minSek: details.annualTaxSek,
      maxSek: details.annualTaxSek,
      note: 'Faktisk skatt från Transportstyrelsen',
      certainty: 'known',
    })
  }

  // ── Kontrollbesiktning ──
  if (carAge >= 3) {
    // Estimate whether inspection is due this year based on first registration
    const baseInspectionCost = carAge > 8 ? 700 : 550
    const repairEstimate = breakdown.inspectionScore < 50 ? 4000 : breakdown.inspectionScore < 75 ? 1500 : 0
    items.push({
      icon: <ShieldCheck className="h-4 w-4 text-blue-400" />,
      label: 'Kontrollbesiktning',
      minSek: baseInspectionCost,
      maxSek: baseInspectionCost + repairEstimate,
      note: repairEstimate > 0
        ? 'Inklusive estimerade reparationskostnader baserat på besiktningsresultat'
        : 'Kontrollbesiktningsavgift',
      certainty: 'estimated',
    })
  }

  // ── Service ──
  // mileage is in km (from mileageHistory records)
  const needsServiceSoon = breakdown.serviceHistoryScore < 60 || mileage % 15000 < 5000
  if (needsServiceSoon || breakdown.serviceHistoryScore < 70) {
    const serviceMin = 2500
    const serviceMax = carAge > 6 ? 8000 : 5500
    items.push({
      icon: <Wrench className="h-4 w-4 text-amber-400" />,
      label: 'Service / oljebyte',
      minSek: serviceMin,
      maxSek: serviceMax,
      note: breakdown.serviceHistoryScore < 50
        ? 'Serviceintervallet verkar eftersatt — räkna med full service'
        : 'Baserat på miltal och servicehistorik',
      certainty: 'estimated',
    })
  }

  // ── Däckbyte (vinter/sommar) ──
  items.push({
    icon: <RefreshCw className="h-4 w-4 text-slate-400" />,
    label: 'Däckbyte (säsong)',
    minSek: 500,
    maxSek: 1200,
    note: 'Montering av säsongsdäck (exkl. ev. nya däck)',
    certainty: 'estimated',
  })

  // ── Kända modellproblem ──
  if (details?.knownIssues && details.knownIssues.length > 0) {
    const avgRepair = details.averageRepairCostSek ?? 6000
    items.push({
      icon: <Wrench className="h-4 w-4 text-red-400" />,
      label: 'Kända modellproblem',
      minSek: Math.round(avgRepair * 0.3),
      maxSek: avgRepair,
      note: `Modellen har ${details.knownIssues.length} kända problem: ${details.knownIssues.slice(0, 2).join(', ')}`,
      certainty: 'estimated',
    })
  }

  // ── Drivlineproblem ──
  if (breakdown.drivetrainScore < 50 && carAge > 5) {
    items.push({
      icon: <Fuel className="h-4 w-4 text-red-400" />,
      label: 'Drivlina / transmission',
      minSek: 3000,
      maxSek: 15000,
      note: 'Drivlinan har lågt poäng — förhöjd risk för kostsamma reparationer',
      certainty: 'estimated',
    })
  }

  return items
}

function formatSek(amount: number) {
  return amount.toLocaleString('sv-SE') + ' kr'
}

export function FutureCosts({ breakdown, details, year, mileage }: Props) {
  const items = buildCostItems(breakdown, details, year, mileage)
  if (items.length === 0) return null

  const totalMin = items.reduce((s, i) => s + i.minSek, 0)
  const totalMax = items.reduce((s, i) => s + i.maxSek, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          Framtidskostnader — nästa 12 månader
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/40"
          >
            <div className="mt-0.5 shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {item.minSek === item.maxSek
                    ? formatSek(item.minSek)
                    : `${formatSek(item.minSek)}–${formatSek(item.maxSek)}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.note}</p>
              {item.certainty === 'estimated' && (
                <span className="text-xs text-muted-foreground/60 italic">Estimat</span>
              )}
            </div>
          </div>
        ))}

        <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-3">
          <ChevronRight className="h-4 w-4 shrink-0 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Total uppskattad kostnad:{' '}
              {totalMin === totalMax
                ? formatSek(totalMin)
                : `${formatSek(totalMin)} – ${formatSek(totalMax)}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Exklusive drivmedel och försäkring. Estimat — faktiska kostnader varierar.
            </p>
          </div>
        </div>

        <p className="pt-1 text-xs text-muted-foreground/60 italic">
          Kostnadsestimat baseras på analysdata, årsmodell och miltal. Kontakta en verkstad
          för en exakt offert.
        </p>
      </CardContent>
    </Card>
  )
}
