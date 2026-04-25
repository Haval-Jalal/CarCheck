import { ShieldCheck, ShieldAlert, XCircle, AlertTriangle, TrendingDown, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CarAnalysisResponse } from '@/types/car.types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type DealerVerdictType = 'buy' | 'wait' | 'avoid'

export interface DealerVerdictResult {
  verdict: DealerVerdictType
  stopReasons: string[]   // hard stops that drive the verdict
  warnings: string[]      // yellow flags
  tradeInRange: [number, number] | null
}

// ── Logic ─────────────────────────────────────────────────────────────────────

export function computeOdometerFlag(analysis: CarAnalysisResponse): string | null {
  const { year, mileage, details } = analysis
  if (!details) return null

  // Decreasing mileage in history → tampering signal
  const history = details.mileageHistory
  if (history && history.length > 1) {
    const sorted = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].mileage < sorted[i - 1].mileage - 50) {
        return 'Misstänkt miltalsjustering — minskande miltal i historiken'
      }
    }
  }

  // Suspiciously low mileage for age
  const ageYears = new Date().getFullYear() - year
  if (ageYears > 2 && mileage > 0) {
    const expectedMil = ageYears * 1500
    if (mileage / expectedMil < 0.2 && mileage < 2000) {
      return `Ovanligt lågt miltal (${mileage.toLocaleString('sv-SE')} mil för en ${ageYears}-årig bil)`
    }
  }

  return null
}

export function computeDealerVerdict(analysis: CarAnalysisResponse): DealerVerdictResult {
  const { score, details } = analysis
  const stopReasons: string[] = []
  const warnings: string[] = []

  // Hard stops
  if (details?.hasPurchaseBlock) stopReasons.push('Köpspärr registrerad')
  if (details?.debts && details.debts.length > 0) {
    const total = details.debts.reduce((s, d) => s + d.amountSek, 0)
    stopReasons.push(`Skulder på ${total.toLocaleString('sv-SE')} kr`)
  }
  const lastInspection = details?.inspections?.[0]
  if (lastInspection && !lastInspection.passed) {
    stopReasons.push('Underkänd vid senaste besiktning')
  }

  // Determine verdict
  let verdict: DealerVerdictType
  if (stopReasons.length > 0 || score < 40) {
    verdict = 'avoid'
  } else {
    // Yellow flags
    if (details?.isImported) {
      warnings.push('Importerad — verifiera servicebok och ursprungsspecifikation')
    }
    const odomFlag = computeOdometerFlag(analysis)
    if (odomFlag) warnings.push(odomFlag)
    if (details?.recalls?.some(r => !r.resolved)) {
      warnings.push('Olösta återkallelser finns')
    }
    if (details?.insuranceIncidents?.some(i => i.severity === 'High' || i.severity === 'Severe')) {
      warnings.push('Allvarlig skadehistorik')
    }

    verdict = score >= 65 && warnings.length === 0 ? 'buy' : 'wait'
  }

  // Trade-in price range
  const base = details?.marketValueSek ?? details?.averageMarketPriceSek ?? null
  let tradeInRange: [number, number] | null = null
  if (base && base > 0) {
    const round = (v: number) => Math.round(v / 1000) * 1000
    if (verdict === 'buy')  tradeInRange = [round(base * 0.72), round(base * 0.82)]
    if (verdict === 'wait') tradeInRange = [round(base * 0.55), round(base * 0.70)]
    if (verdict === 'avoid') tradeInRange = [round(base * 0.38), round(base * 0.52)]
  }

  return { verdict, stopReasons, warnings, tradeInRange }
}

// ── Component ─────────────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
  buy: {
    label: 'Köpa',
    sublabel: 'Bilen är ett bra inbytesalternativ',
    icon: ShieldCheck,
    bg: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    badgeBg: 'bg-green-600',
    printBg: 'print:bg-green-100',
  },
  wait: {
    label: 'Avvakta',
    sublabel: 'Flaggor finns — förhandla hårdare eller begär komplettering',
    icon: ShieldAlert,
    bg: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    badgeBg: 'bg-yellow-600',
    printBg: 'print:bg-yellow-100',
  },
  avoid: {
    label: 'Undvik',
    sublabel: 'Kritiska stopp — rekommendera inte inbyte utan utredning',
    icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    badgeBg: 'bg-red-600',
    printBg: 'print:bg-red-100',
  },
} as const

interface Props {
  analysis: CarAnalysisResponse
  className?: string
}

export function DealerVerdictCard({ analysis, className }: Props) {
  const result = computeDealerVerdict(analysis)
  const cfg = VERDICT_CONFIG[result.verdict]
  const Icon = cfg.icon

  return (
    <div className={cn('rounded-xl border-2 p-5', cfg.bg, cfg.printBg, className)}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className={cn('h-7 w-7 shrink-0', cfg.iconColor)} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">Dealer-bedömning:</span>
              <Badge className={cn('text-white text-sm px-3 py-0.5', cfg.badgeBg)}>
                {cfg.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{cfg.sublabel}</p>
          </div>
        </div>
        {result.tradeInRange && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Rekommenderat inbytespris</p>
            <p className="text-base font-black text-gray-900 tabular-nums">
              {result.tradeInRange[0].toLocaleString('sv-SE')} –{' '}
              {result.tradeInRange[1].toLocaleString('sv-SE')} kr
            </p>
          </div>
        )}
      </div>

      {/* Stop reasons */}
      {result.stopReasons.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {result.stopReasons.map((r) => (
            <div key={r} className="flex items-center gap-2 text-sm font-medium text-red-700">
              <XCircle className="h-4 w-4 shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {result.warnings.map((w) => (
            <div key={w} className="flex items-center gap-2 text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600" />
              {w}
            </div>
          ))}
        </div>
      )}

      {result.stopReasons.length === 0 && result.warnings.length === 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
          <Info className="h-4 w-4 shrink-0" />
          Inga kritiska stopp eller varningar hittades
        </div>
      )}
    </div>
  )
}

// ── Risk flag chips (compact, for report header area) ─────────────────────────

export function RiskFlagChips({ analysis }: { analysis: CarAnalysisResponse }) {
  const { details } = analysis
  if (!details) return null

  const flags: { label: string; color: string }[] = []

  if (details.hasPurchaseBlock)
    flags.push({ label: 'Köpspärr', color: 'bg-red-600' })
  if (details.debts && details.debts.length > 0)
    flags.push({ label: 'Skulder', color: 'bg-red-600' })
  if (details.isImported)
    flags.push({ label: 'Import', color: 'bg-orange-500' })
  if (computeOdometerFlag(analysis))
    flags.push({ label: 'Miltalsflagga', color: 'bg-orange-500' })
  if (details.recalls?.some(r => !r.resolved))
    flags.push({ label: 'Återkallelse', color: 'bg-yellow-600' })

  if (flags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map(f => (
        <span
          key={f.label}
          className={cn('inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold text-white', f.color)}
        >
          <TrendingDown className="h-3 w-3" />
          {f.label}
        </span>
      ))}
    </div>
  )
}
