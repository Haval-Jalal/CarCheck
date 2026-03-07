import { Cog, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react'
import { getTimingInfo } from '@/lib/timing-data'
import { cn } from '@/lib/utils'

interface TimingBeltProps {
  brand: string
  fuelType: string | null
  year: number
  mileageKm: number
}

export function TimingBelt({ brand, fuelType, year, mileageKm }: TimingBeltProps) {
  const info = getTimingInfo(brand, fuelType, year)

  const isChain = info.type === 'chain'
  const isBelt = info.type === 'belt'
  const isUnknown = info.type === 'unknown'

  // Om kamrem: kontrollera om bytet är förfallet
  const beltOverdue =
    isBelt &&
    info.intervalKm !== undefined &&
    mileageKm >= info.intervalKm * 0.9 // Varnar vid 90% av intervallet

  return (
    <div
      className={cn(
        'rounded-xl border p-6 space-y-4',
        isChain && 'border-green-500/20 bg-green-500/5',
        isBelt && !beltOverdue && 'border-yellow-500/20 bg-yellow-500/5',
        isBelt && beltOverdue && 'border-red-500/20 bg-red-500/5',
        isUnknown && 'border-border bg-card',
      )}
    >
      <div className="flex items-center gap-2">
        <Cog className="h-5 w-5 text-blue-400" />
        <h2 className="text-base font-semibold">Kamrem / Kamkedja</h2>
      </div>

      <div className="flex items-start gap-3">
        {isChain && (
          <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0 mt-0.5" />
        )}
        {isBelt && !beltOverdue && (
          <AlertTriangle className="h-8 w-8 text-yellow-500 shrink-0 mt-0.5" />
        )}
        {isBelt && beltOverdue && (
          <AlertTriangle className="h-8 w-8 text-red-500 shrink-0 mt-0.5" />
        )}
        {isUnknown && (
          <HelpCircle className="h-8 w-8 text-muted-foreground shrink-0 mt-0.5" />
        )}

        <div className="space-y-1">
          <p className={cn(
            'text-sm font-semibold',
            isChain && 'text-green-500',
            isBelt && !beltOverdue && 'text-yellow-500',
            isBelt && beltOverdue && 'text-red-500',
            isUnknown && 'text-muted-foreground',
          )}>
            {isChain && 'Kamkedja'}
            {isBelt && 'Kamrem'}
            {isUnknown && 'Okänt'}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {info.note}
          </p>
        </div>
      </div>

      {isBelt && (
        <div className="rounded-lg border border-border bg-background/50 px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-foreground">Rekommenderat bytesintervall</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            {info.intervalKm && (
              <span>Var {info.intervalKm.toLocaleString('sv-SE')} km</span>
            )}
            {info.intervalYears && (
              <span>Eller var {info.intervalYears} år</span>
            )}
          </div>
          {beltOverdue && (
            <p className="text-xs text-red-500 font-medium mt-1">
              ⚠ Bilen har {mileageKm.toLocaleString('sv-SE')} km — bytesintervallet kan vara nära. Kontrollera senast bytte i serviceboken.
            </p>
          )}
        </div>
      )}

      {isChain && (
        <p className="text-xs text-muted-foreground/70 italic">
          Kamkedja är underhållsfri under normala förhållanden och behöver inte bytas regelbundet.
        </p>
      )}
    </div>
  )
}
