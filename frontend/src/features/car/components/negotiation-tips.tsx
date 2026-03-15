import { Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalysisBreakdown, AnalysisDetails } from '@/types/car.types'

interface Props {
  breakdown: AnalysisBreakdown
  details: AnalysisDetails | null
}

interface Tip {
  text: string
  priority: 'high' | 'medium' | 'low'
}

function buildTips(breakdown: AnalysisBreakdown, details: AnalysisDetails | null): Tip[] {
  if (!details) return []
  const tips: Tip[] = []

  // ── Köpspärr ──
  if (details.hasPurchaseBlock) {
    tips.push({
      text: 'Bilen har en aktiv köpspärr hos Kronofogden. Kontrollera att skulden är reglerad och spärren hävd innan affären genomförs.',
      priority: 'high',
    })
  }

  // ── Skulder ──
  if (details.debts.length > 0) {
    const total = details.debts.reduce((s, d) => s + d.amountSek, 0)
    tips.push({
      text: `Fordonet har registrerade skulder på totalt ${total.toLocaleString('sv-SE')} kr. Kontrollera att dessa är reglerade innan köp, alternativt beakta dem i prisförhandlingen.`,
      priority: 'high',
    })
  }

  // ── Underkänd besiktning ──
  const failedInspections = details.inspections.filter(i => !i.passed)
  if (failedInspections.length > 0) {
    const latest = failedInspections[failedInspections.length - 1]
    const year = new Date(latest.date).getFullYear()
    tips.push({
      text: `Bilen underkändes i besiktning ${year}${latest.remarks ? ` (${latest.remarks})` : ''}. Be säljaren visa upp ett godkänt besiktningsprotokoll som bekräftar att felet är åtgärdat.`,
      priority: 'high',
    })
  }

  // ── Ej åtgärdade återkallelser ──
  const unresolvedRecalls = details.recalls.filter(r => !r.resolved)
  if (unresolvedRecalls.length > 0) {
    tips.push({
      text: `${unresolvedRecalls.length} återkallelse${unresolvedRecalls.length > 1 ? 'r' : ''} från tillverkaren är ej åtgärdad${unresolvedRecalls.length > 1 ? 'e' : ''}. Kontrollera med en auktoriserad verkstad att arbetet utförts innan köp.`,
      priority: 'high',
    })
  }

  // ── Misstänkt kilometermanipulation ──
  const sorted = [...details.mileageHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const hasMileageDrop = sorted.some((r, i) => i > 0 && r.mileage < sorted[i - 1].mileage)
  if (hasMileageDrop) {
    tips.push({
      text: 'Miltalet har minskat mellan två avläsningar i registrerad data. Be säljaren om en förklaring och låt en oberoende verkstad kontrollera uppgifterna.',
      priority: 'high',
    })
  }

  // ── Allvarliga försäkringsskador ──
  const seriousIncidents = details.insuranceIncidents.filter(i => i.severity === 'Allvarlig')
  if (seriousIncidents.length > 0) {
    tips.push({
      text: `${seriousIncidents.length} allvarlig${seriousIncidents.length > 1 ? 'a' : ''} försäkringsskada${seriousIncidents.length > 1 ? 'r' : ''} är registrerad${seriousIncidents.length > 1 ? 'e' : ''}. Fråga om reparationerna är utförda av auktoriserad verkstad och be om dokumentation.`,
      priority: 'high',
    })
  }

  // ── Många ägare ──
  if (details.owners.length >= 3) {
    tips.push({
      text: `Bilen har haft ${details.owners.length} ägare. Det kan vara värt att fråga om bakgrunden till ägarskiftena.`,
      priority: 'medium',
    })
  }

  // ── Saknar servicehistorik ──
  if (breakdown.serviceHistoryScore < 50 && details.services.length === 0) {
    tips.push({
      text: 'Ingen servicehistorik är registrerad i tillgänglig data. Be säljaren om servicebok eller kvitton som bevis på underhåll.',
      priority: 'medium',
    })
  } else if (breakdown.serviceHistoryScore < 50) {
    tips.push({
      text: 'Servicehistoriken verkar ofullständig enligt tillgänglig data. Fråga om bilen servats enligt tillverkarens schema och be om underlag.',
      priority: 'medium',
    })
  }

  // ── Pris över marknadsvärde ──
  if (
    details.marketValueSek != null &&
    details.averageMarketPriceSek != null &&
    details.marketValueSek > details.averageMarketPriceSek * 1.1
  ) {
    const diff = Math.round(details.marketValueSek - details.averageMarketPriceSek)
    tips.push({
      text: `Priset ligger ${diff.toLocaleString('sv-SE')} kr över snittet för liknande bilar i tillgänglig marknadsdata — detta kan vara ett argument i en prisförhandling.`,
      priority: 'medium',
    })
  }

  // ── Kända problem med drivlina ──
  if (details.knownIssues.length > 0) {
    tips.push({
      text: `Denna bilmodell har registrerade kända problem: ${details.knownIssues.slice(0, 2).join(', ')}. Kontrollera dessa punkter vid en oberoende besiktning.`,
      priority: 'medium',
    })
  }

  // ── Hög stöldrisk ──
  if (details.theftRiskCategory === 'Hög') {
    tips.push({
      text: 'Modellen är klassad med hög stöldrisk i statistiken. Kontrollera att bilen har fungerande larm och att din försäkring täcker stöld.',
      priority: 'low',
    })
  }

  // ── Hög CO2 / bonus-malus ──
  if (details.bonusMalusApplies && details.annualTaxSek != null && details.annualTaxSek > 5000) {
    tips.push({
      text: `Bilen har bonus-malus med en årsskatt på ${details.annualTaxSek.toLocaleString('sv-SE')} kr. Räkna in den totala ägandekostnaden i din bedömning.`,
      priority: 'low',
    })
  }

  return tips
}

const PRIORITY_STYLES: Record<Tip['priority'], string> = {
  high:   'border-l-red-500 bg-red-50 dark:bg-red-950/30',
  medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
  low:    'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
}

const PRIORITY_DOT: Record<Tip['priority'], string> = {
  high:   'bg-red-500',
  medium: 'bg-yellow-500',
  low:    'bg-blue-500',
}

export function NegotiationTips({ breakdown, details }: Props) {
  const tips = buildTips(breakdown, details)

  if (tips.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          Punkter att beakta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg border-l-4 p-3 text-sm ${PRIORITY_STYLES[tip.priority]}`}
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[tip.priority]}`} />
            <p className="leading-relaxed text-foreground">{tip.text}</p>
          </div>
        ))}
        <p className="pt-2 text-xs text-muted-foreground/60 border-t border-border">
          Genereras automatiskt utifrån tillgänglig registrerad data. Kan vara ofullständig eller inaktuell.
        </p>
      </CardContent>
    </Card>
  )
}
