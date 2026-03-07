import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Infinity, CreditCard, Calendar } from 'lucide-react'
import { useSubscription, useCreateCheckout, useCancelSubscription, useBuyCredits, useCreditPackages } from '@/hooks/use-billing'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ErrorDisplay } from '@/components/common/error-display'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MONTHLY_TIER = 1 // SubscriptionTier.Pro = monthly unlimited

function formatSek(amount: number) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function BillingPage() {
  const { data: sub, isLoading: subLoading, error: subError } = useSubscription()
  const { data: packs, isLoading: packsLoading } = useCreditPackages()
  const checkoutMutation = useCreateCheckout()
  const buyMutation = useBuyCredits()
  const cancelMutation = useCancelSubscription()

  if (subLoading || packsLoading) return <LoadingSpinner />
  if (subError) return <ErrorDisplay error={subError} />

  const hasMonthly = sub ? sub.tier >= MONTHLY_TIER && sub.isActive && sub.subscriptionId !== '00000000-0000-0000-0000-000000000000' : false
  const credits = sub?.credits ?? 0

  const handleBuyMonthly = () => {
    checkoutMutation.mutate(MONTHLY_TIER, {
      onSuccess: (data) => {
        window.location.href = data.checkoutUrl
      },
      onError: (err) => {
        const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
        toast.error(msg || 'Kunde inte starta betalning')
      },
    })
  }

  const handleBuyCredits = (packSize: number) => {
    buyMutation.mutate(packSize, {
      onSuccess: (data) => {
        toast.success(`${packSize} ${packSize === 1 ? 'sökning' : 'sökningar'} tillagda! Saldo: ${data.credits}`)
      },
      onError: (err) => {
        const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
        toast.error(msg || 'Köpet misslyckades')
      },
    })
  }

  const handleCancel = () => {
    if (!confirm('Är du säker på att du vill avbryta din månadsplan?')) return
    cancelMutation.mutate(undefined, {
      onSuccess: () => toast.success('Månadsplanen avbruten'),
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Abonnemang</h1>
        <p className="text-muted-foreground">Köp sökningar eller teckna en månadsplan</p>
      </div>

      {/* Current status */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Credits balance */}
        <Card className={cn('border-2', credits > 0 ? 'border-blue-500/50 bg-blue-500/5' : 'border-border')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sökningar kvar</p>
                <p className="text-4xl font-black text-foreground mt-1">
                  {hasMonthly ? <Infinity className="h-8 w-8 text-blue-500 inline" /> : credits}
                </p>
                {!hasMonthly && (
                  <p className="text-xs text-muted-foreground mt-1">
                    + {3} gratis per dag
                  </p>
                )}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10">
                <Zap className="h-7 w-7 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan status */}
        <Card className={cn('border-2', hasMonthly ? 'border-green-500/50 bg-green-500/5' : 'border-border')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Månadsplan</p>
                <p className="text-lg font-bold mt-1">
                  {hasMonthly ? 'Aktiv' : 'Inaktiv'}
                </p>
                {hasMonthly && sub?.startDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sedan {formatDate(sub.startDate)}
                  </p>
                )}
                {hasMonthly && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="text-xs text-red-500 hover:underline mt-2"
                  >
                    Avbryt plan
                  </button>
                )}
              </div>
              <div className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl',
                hasMonthly ? 'bg-green-600/10' : 'bg-muted'
              )}>
                <Calendar className={cn('h-7 w-7', hasMonthly ? 'text-green-500' : 'text-muted-foreground')} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit packages */}
      {!hasMonthly && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Köp sökningar</h2>
            <p className="text-sm text-muted-foreground">Varje sökning ger fullständig analys av bilen</p>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {packs?.map((pack) => (
              <Card
                key={pack.credits}
                className={cn(
                  'relative transition-all hover:shadow-md',
                  pack.isBestValue && 'border-blue-500 shadow-sm'
                )}
              >
                {pack.isBestValue && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-600">
                    Bäst värde
                  </Badge>
                )}
                <CardContent className="pt-6 text-center space-y-4">
                  <div>
                    <p className="text-3xl font-black">{pack.credits}</p>
                    <p className="text-sm text-muted-foreground">{pack.label}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatSek(pack.priceSek)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSek(Math.round(pack.priceSek / pack.credits))}/sökning
                    </p>
                  </div>
                  <Button
                    className={cn('w-full', pack.isBestValue ? 'bg-blue-600 hover:bg-blue-500' : '')}
                    variant={pack.isBestValue ? 'default' : 'outline'}
                    onClick={() => handleBuyCredits(pack.credits)}
                    disabled={buyMutation.isPending}
                  >
                    Köp nu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Monthly plan */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Månadsplan — Obegränsat</h2>
          <p className="text-sm text-muted-foreground">Sök hur mycket du vill, betala en fast månadsavgift</p>
        </div>
        <Card className={cn(
          'border-2',
          hasMonthly ? 'border-green-500/50' : 'border-slate-600 bg-gradient-to-br from-slate-900 to-blue-950'
        )}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-4xl font-black', hasMonthly ? '' : 'text-white')}>499 kr</span>
                  <span className={cn('text-sm', hasMonthly ? 'text-muted-foreground' : 'text-slate-400')}>/månad</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    'Obegränsade bilsökningar',
                    'Fullständig analys på varje bil',
                    'Besiktningshistorik och riskfaktorer',
                    'Prisanalys mot marknaden',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className={cn('h-4 w-4 shrink-0', hasMonthly ? 'text-green-500' : 'text-blue-400')} />
                      <span className={cn('text-sm', hasMonthly ? '' : 'text-slate-300')}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              {hasMonthly ? (
                <Badge variant="outline" className="border-green-500 text-green-600 px-4 py-2 text-base self-start md:self-center">
                  Aktiv plan
                </Badge>
              ) : (
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 md:shrink-0"
                  onClick={handleBuyMonthly}
                  disabled={checkoutMutation.isPending}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Teckna månadsplan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
