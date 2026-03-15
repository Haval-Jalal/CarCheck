import { Shield, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { getWarrantyStatuses } from '@/lib/warranty-data'
import { cn } from '@/lib/utils'

interface WarrantiesProps {
  brand: string
  firstRegistrationDate: string | null
  mileageKm: number
}

function formatMonths(months: number): string {
  if (months >= 120) return `${Math.round(months / 12)} år`
  if (months >= 24) return `${Math.round(months / 12)} år`
  return `${months} månader`
}

export function Warranties({ brand, firstRegistrationDate, mileageKm }: WarrantiesProps) {
  const statuses = getWarrantyStatuses(brand, firstRegistrationDate, mileageKm)

  if (statuses.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold">Garantier</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Garantiinformation är inte tillgänglig för {brand}.
        </p>
      </div>
    )
  }

  const validCount = statuses.filter((s) => s.isValid).length

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold">Garantier</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {validCount}/{statuses.length} aktiva
        </span>
      </div>

      <div className="space-y-3">
        {statuses.map((s) => (
          <div
            key={s.label}
            className={cn(
              'flex items-start justify-between gap-3 rounded-lg px-3 py-3 border',
              s.isValid
                ? 'border-green-500/20 bg-green-500/5'
                : 'border-border bg-muted/30',
            )}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              {s.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className={cn('text-sm font-medium', !s.isValid && 'text-muted-foreground')}>
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatMonths(s.months)}
                  {s.km > 0 ? ` · max ${s.km.toLocaleString('sv-SE')} km` : ' · obegränsad km'}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {s.isValid ? (
                <div>
                  <span className="text-xs font-semibold text-green-500">Giltig</span>
                  {s.monthsRemaining > 0 && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground justify-end">
                      <Clock className="h-3 w-3" />
                      {s.monthsRemaining} mån kvar
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Utgången</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/60 border-t border-border pt-2 mt-2">
        Baserat på tillverkarens standardvillkor. Kontrollera aktuell status hos auktoriserad verkstad.
      </p>
    </div>
  )
}
