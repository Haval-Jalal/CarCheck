import { BarChart3, Info } from 'lucide-react'
import { getKnownProblems } from '@/lib/known-problems-data'
import { cn } from '@/lib/utils'

interface KnownProblemsStatsProps {
  brand: string
  model: string
  year: number
}

const SEVERITY_COLOR = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-400',
}

const SEVERITY_LABEL = {
  high: 'Hög',
  medium: 'Medium',
  low: 'Låg',
}

export function KnownProblemsStats({ brand, model, year }: KnownProblemsStatsProps) {
  const { problems, isModelSpecific } = getKnownProblems(brand, model, year)

  if (problems.length === 0) return null

  const sorted = [...problems].sort((a, b) => b.frequency - a.frequency)
  const maxFreq = sorted[0].frequency

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <div>
            <h2 className="text-base font-semibold">Kända besiktningsanmärkningar</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isModelSpecific
                ? `${brand} ${model} — baserat på besiktningsstatistik`
                : `Genomsnitt för ${year > new Date().getFullYear() - 4 ? 'nyare' : 'äldre'} fordon`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((p) => {
          const pct = Math.round(p.frequency * 100)
          const barWidth = Math.round((p.frequency / maxFreq) * 100)

          return (
            <div key={p.component} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn('h-2 w-2 rounded-full shrink-0', SEVERITY_COLOR[p.severity])}
                  />
                  <span className="truncate">{p.component}</span>
                </div>
                <span className="shrink-0 ml-2 font-semibold tabular-nums">{pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full', SEVERITY_COLOR[p.severity])}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(['high', 'medium', 'low'] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', SEVERITY_COLOR[s])} />
            {SEVERITY_LABEL[s]} allvarlighetsgrad
          </span>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Andel fordon av samma modell och ålder som erhållit anmärkning vid kontrollbesiktning.
          Baserat på Bilprovningens offentliga besiktningsstatistik. Frekvensen minskar ej risken
          utan visar hur vanliga problemen är i klassen.
        </p>
      </div>
    </div>
  )
}
