import { Link } from 'react-router'
import { useQuotaStore } from '@/stores/quota.store'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Infinity } from 'lucide-react'

export function QuotaIndicator() {
  const quota = useQuotaStore((s) => s.quota)

  if (!quota) return null

  const isUnlimited = quota.limit === 'unlimited'
  const isCredits = quota.limit === 'credits'
  const remaining = quota.remaining === 'unlimited' ? Infinity : (quota.remaining as number)

  if (isUnlimited) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Infinity className="h-3.5 w-3.5" />
          Obegränsade sökningar
        </span>
        <Badge variant="secondary">Månatlig</Badge>
      </div>
    )
  }

  if (isCredits) {
    const creditsLeft = quota.remaining as number
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Sökningar kvar: <span className="font-semibold text-foreground">{creditsLeft}</span>
          </span>
          <Badge variant="secondary">Krediter</Badge>
        </div>
        {creditsLeft <= 2 && creditsLeft > 0 && (
          <p className="text-xs text-orange-600">
            Snart slut!{' '}
            <Link to="/billing" className="underline">
              Köp fler
            </Link>
            {' '}sökningar.
          </p>
        )}
      </div>
    )
  }

  // Free tier
  const limit = quota.limit as number
  const usedPercent = limit > 0 ? Math.round(((limit - remaining) / limit) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Gratis sökningar idag: {remaining} / {limit} kvar
        </span>
        <Badge variant="secondary">{quota.tier}</Badge>
      </div>
      <Progress value={usedPercent} className="h-2" />
      {remaining <= 1 && remaining > 0 && (
        <p className="text-xs text-orange-600">
          Snart slut!{' '}
          <Link to="/billing" className="underline">
            Köp sökningar
          </Link>
          {' '}för att fortsätta.
        </p>
      )}
      {remaining === 0 && (
        <p className="text-xs text-destructive">
          Gratis sökningar slut.{' '}
          <Link to="/billing" className="underline">
            Köp sökningar
          </Link>
          {' '}för att fortsätta söka.
        </p>
      )}
    </div>
  )
}
