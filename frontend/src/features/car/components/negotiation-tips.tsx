import { Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalysisBreakdown, AnalysisDetails } from '@/types/car.types'

interface Props {
  breakdown: AnalysisBreakdown
  details: AnalysisDetails
}

interface Tip {
  text: string
  priority: 'high' | 'medium' | 'low'
}

function buildTips(breakdown: AnalysisBreakdown, details: AnalysisDetails): Tip[] {
  const tips: Tip[] = []

  // ── Köpspärr ──
  if (details.hasPurchaseBlock) {
    tips.push({
      text: 'Bilen har en aktiv köpspärr hos Kronofogden — köp inte innan skulden är reglerad och spärren hävd.',
      priority: 'high',
    })
  }

  // ── Skulder ──
  if (details.debts.length > 0) {
    const total = details.debts.reduce((s, d) => s + d.amountSek, 0)
    tips.push({
      text: `Fordonet har registrerade skulder på totalt ${total.toLocaleString('sv-SE')} kr — kräv att dessa är lösta innan köp eller dra av beloppet från priset.`,
      priority: 'high',
    })
  }

  // ── Underkänd besiktning ──
  const failedInspections = details.inspections.filter(i => !i.passed)
  if (failedInspections.length > 0) {
    const latest = failedInspections[failedInspections.length - 1]
    const year = new Date(latest.date).getFullYear()
    tips.push({
      text: `Bilen underkändes i besiktning ${year}${latest.remarks ? ` (${latest.remarks})` : ''} — kräv att felet är åtgärdat och att godkänd besiktning kan visas upp.`,
      priority: 'high',
    })
  }

  // ── Ej åtgärdade återkallelser ──
  const unresolvedRecalls = details.recalls.filter(r => !r.resolved)
  if (unresolvedRecalls.length > 0) {
    tips.push({
      text: `${unresolvedRecalls.length} återkallelse${unresolvedRecalls.length > 1 ? 'r' : ''} från tillverkaren är ej åtgärdad${unresolvedRecalls.length > 1 ? 'e' : ''} — kontakta en auktoriserad verkstad och kräv att arbetet utförs innan köp.`,
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
      text: 'Miltalet har minskat mellan två avläsningar — detta kan tyda på kilometertamper. Be om förklaring och kontrollera med en oberoende verkstad.',
      priority: 'high',
    })
  }

  // ── Allvarliga försäkringsskador ──
  const seriousIncidents = details.insuranceIncidents.filter(i => i.severity === 'Allvarlig')
  if (seriousIncidents.length > 0) {
    tips.push({
      text: `${seriousIncidents.length} allvarlig${seriousIncidents.length > 1 ? 'a' : ''} försäkringsskada${seriousIncidents.length > 1 ? 'r' : ''} är registrerad${seriousIncidents.length > 1 ? 'e' : ''} — fråga om reparationerna är utförda av auktoriserad verkstad och begär kvitton.`,
      priority: 'high',
    })
  }

  // ── Många ägare ──
  if (details.owners.length >= 3) {
    tips.push({
      text: `Bilen har haft ${details.owners.length} ägare — fråga varför den bytt händer så ofta och be om förklaring för varje ägarskifte.`,
      priority: 'medium',
    })
  }

  // ── Saknar servicehistorik ──
  if (breakdown.serviceHistoryScore < 50 && details.services.length === 0) {
    tips.push({
      text: 'Ingen servicehistorik är registrerad — be säljaren om servicebok eller kvitton från verkstad som bevis på underhåll.',
      priority: 'medium',
    })
  } else if (breakdown.serviceHistoryScore < 50) {
    tips.push({
      text: 'Servicehistoriken är ofullständig — fråga om bilen servats enligt tillverkarens schema och be om kvitton.',
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
      text: `Priset ligger ${diff.toLocaleString('sv-SE')} kr över snittet för liknande bilar på marknaden — använd det som förhandlingsargument.`,
      priority: 'medium',
    })
  }

  // ── Kända problem med drivlina ──
  if (details.knownIssues.length > 0) {
    tips.push({
      text: `Denna bilmodell har kända problem: ${details.knownIssues.slice(0, 2).join(', ')}. Kontrollera specifikt dessa punkter vid en oberoende besiktning.`,
      priority: 'medium',
    })
  }

  // ── Hög stöldrisk ──
  if (details.theftRiskCategory === 'Hög') {
    tips.push({
      text: 'Modellen är klassad med hög stöldrisk — kontrollera att bilen har fungerande larm och att försäkringen täcker stöld utan tilläggsavgift.',
      priority: 'low',
    })
  }

  // ── Hög CO2 / bonus-malus ──
  if (details.bonusMalusApplies && details.annualTaxSek != null && details.annualTaxSek > 5000) {
    tips.push({
      text: `Bilen har bonus-malus och en årsskatt på ${details.annualTaxSek.toLocaleString('sv-SE')} kr — räkna in detta i den totala ägandekostnaden vid prisförhandlingen.`,
      priority: 'low',
    })
  }

  return tips
}

const PRIORITY_STYLES: Record<Tip['priority'], string> = {
  high: 'border-l-red-500 bg-red-50 dark:bg-red-950/30',
  medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
  low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
}

const PRIORITY_DOT: Record<Tip['priority'], string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
}

export function NegotiationTips({ breakdown, details }: Props) {
  const tips = buildTips(breakdown, details)

  if (tips.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          Förhandlingstips
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
        <p className="pt-1 text-xs text-muted-foreground/70 italic">
          Tips genereras automatiskt baserat på analysdata och ersätter inte råd från en auktoriserad besiktare.
        </p>
      </CardContent>
    </Card>
  )
}
