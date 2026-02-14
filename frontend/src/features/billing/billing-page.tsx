import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, CreditCard } from 'lucide-react'
import { useTiers, useSubscription, useCreateCheckout, useCancelSubscription } from '@/hooks/use-billing'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ErrorDisplay } from '@/components/common/error-display'
import { formatSek, formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const TIER_NAMES: Record<number, string> = { 0: 'Free', 1: 'Pro', 2: 'Premium' }

export function BillingPage() {
  const { data: tiers, isLoading: tiersLoading } = useTiers()
  const { data: sub, isLoading: subLoading, error: subError } = useSubscription()
  const checkoutMutation = useCreateCheckout()
  const cancelMutation = useCancelSubscription()

  if (tiersLoading || subLoading) return <LoadingSpinner />
  if (subError) return <ErrorDisplay error={subError} />

  const handleUpgrade = (tier: number) => {
    checkoutMutation.mutate(tier, {
      onSuccess: (data) => {
        window.location.href = data.checkoutUrl
      },
      onError: (err) => {
        const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
        toast.error(msg || 'Kunde inte starta betalning')
      },
    })
  }

  const handleCancel = () => {
    if (!confirm('Är du säker på att du vill avbryta din prenumeration?')) return
    cancelMutation.mutate(undefined, {
      onSuccess: () => toast.success('Prenumerationen avbruten'),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Abonnemang</h1>
        <p className="text-muted-foreground">Hantera din prenumeration</p>
      </div>

      {/* Current plan */}
      {sub && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Nuvarande plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{sub.tierName}</p>
                <p className="text-sm text-muted-foreground">
                  {sub.isActive ? `Aktiv sedan ${formatDate(sub.startDate)}` : 'Inaktiv'}
                </p>
                {sub.endDate && (
                  <p className="text-sm text-muted-foreground">
                    Upphör {formatDate(sub.endDate)}
                  </p>
                )}
              </div>
              {sub.isActive && sub.tier > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  Avbryt prenumeration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier comparison */}
      <div className="grid gap-4 md:grid-cols-3">
        {tiers?.map((tier) => {
          const isCurrent = sub?.tier === tier.tier
          return (
            <Card
              key={tier.tier}
              className={cn(
                'relative',
                tier.tier === 1 && 'border-primary shadow-md'
              )}
            >
              {tier.tier === 1 && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  Populärast
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-center">
                  <span className="text-lg">{tier.name}</span>
                  <div className="mt-1 text-2xl font-bold">
                    {tier.pricePerMonthSek === 0 ? 'Gratis' : `${formatSek(tier.pricePerMonthSek)}/mån`}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {tier.dailySearches === -1 ? 'Obegränsade' : tier.dailySearches} sökningar/dag
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {tier.monthlySearches === -1 ? 'Obegränsade' : tier.monthlySearches} sökningar/mån
                  </div>
                  <div className="flex items-center gap-2">
                    {tier.analysisIncluded ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(!tier.analysisIncluded && 'text-muted-foreground')}>
                      Bilanalys
                    </span>
                  </div>
                </div>

                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Nuvarande plan
                  </Button>
                ) : tier.tier > (sub?.tier ?? 0) ? (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(tier.tier)}
                    disabled={checkoutMutation.isPending}
                  >
                    Uppgradera
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {TIER_NAMES[tier.tier]}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
