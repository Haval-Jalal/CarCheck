import { Link } from 'react-router'
import { useQuotaStore } from '@/stores/quota.store'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function QuotaIndicator() {
  const quota = useQuotaStore((s) => s.quota)

  if (!quota) return null

  const usedPercent = quota.limit > 0
    ? Math.round(((quota.limit - quota.remaining) / quota.limit) * 100)
    : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Dagliga sökningar: {quota.remaining} / {quota.limit} kvar
        </span>
        <Badge variant="secondary">{quota.tier}</Badge>
      </div>
      <Progress value={usedPercent} className="h-2" />
      {quota.remaining <= 2 && quota.remaining > 0 && (
        <p className="text-xs text-orange-600">
          Snart slut!{' '}
          <Link to="/billing" className="underline">
            Uppgradera
          </Link>{' '}
          för fler sökningar.
        </p>
      )}
      {quota.remaining === 0 && (
        <p className="text-xs text-destructive">
          Daglig kvot uppnådd.{' '}
          <Link to="/billing" className="underline">
            Uppgradera
          </Link>{' '}
          för att fortsätta söka.
        </p>
      )}
    </div>
  )
}
