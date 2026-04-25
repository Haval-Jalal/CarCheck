import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Zap, Infinity, CreditCard, Calendar, Receipt, Building2, ArrowRight, Users } from 'lucide-react'
import {
  useSubscription,
  useCreateCheckout,
  useCancelSubscription,
  useCreditsCheckout,
  useCreditPackages,
  useTransactions,
} from '@/hooks/use-billing'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ErrorDisplay } from '@/components/common/error-display'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { TransactionResponse } from '@/types/billing.types'

const MONTHLY_TIER = 1 // SubscriptionTier.Pro = monthly unlimited

function formatSek(amount: number) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function TransactionBadge({ type }: { type: TransactionResponse['type'] }) {
  const { t } = useTranslation()
  if (type === 'subscription') return <Badge className="bg-green-600 hover:bg-green-600">{t('billing.transaction.subscription')}</Badge>
  if (type === 'trial') return <Badge variant="secondary">{t('billing.transaction.trial')}</Badge>
  return <Badge className="bg-blue-600 hover:bg-blue-600">{t('billing.transaction.credits')}</Badge>
}

function PurchaseHistory() {
  const { t } = useTranslation()
  const { data: transactions, isLoading } = useTransactions()

  if (isLoading) return null
  if (!transactions?.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{t('billing.purchaseHistory')}</h2>
      </div>
      <Card>
        <CardContent className="pt-4 divide-y divide-border">
          {transactions.map((t_) => (
            <div key={t_.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t_.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(t_.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <TransactionBadge type={t_.type} />
                <span className="text-sm font-semibold text-right min-w-[60px]">
                  {t_.amountSek > 0 ? formatSek(t_.amountSek) : t('billing.free')}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function BillingPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: sub, isLoading: subLoading, error: subError } = useSubscription()
  const { data: packs, isLoading: packsLoading } = useCreditPackages()
  const checkoutMutation = useCreateCheckout()
  const creditsCheckoutMutation = useCreditsCheckout()
  const cancelMutation = useCancelSubscription()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      const credits = searchParams.get('credits')
      if (credits) {
        const n = Number(credits)
        toast.success(`${credits} ${n === 1 ? t('billing.toast.credit') : t('billing.toast.credits')} ${t('billing.toast.creditsAdded')}`)
      } else {
        toast.success(t('billing.toast.monthlyActive'))
      }
      setSearchParams({}, { replace: true })
    } else if (searchParams.get('canceled') === 'true') {
      toast.info(t('billing.toast.canceled'))
      setSearchParams({}, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (subLoading || packsLoading) return <LoadingSpinner />
  if (subError) return <ErrorDisplay error={subError} />

  const hasMonthly = sub ? sub.tier >= MONTHLY_TIER && sub.isActive && sub.subscriptionId !== '00000000-0000-0000-0000-000000000000' : false
  const isProOnly = hasMonthly
  const credits = sub?.credits ?? 0

  const handleBuyMonthly = () => {
    checkoutMutation.mutate(MONTHLY_TIER, {
      onSuccess: (data) => {
        window.location.href = data.checkoutUrl
      },
      onError: (err) => {
        const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
        toast.error(msg || t('billing.toast.paymentError'))
      },
    })
  }

  const handleBuyCredits = (packSize: number) => {
    creditsCheckoutMutation.mutate(packSize, {
      onSuccess: (data) => {
        window.location.href = data.checkoutUrl
      },
      onError: (err) => {
        const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
        toast.error(msg || t('billing.toast.paymentError'))
      },
    })
  }

  const handleCancel = () => {
    setCancelError(null)
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        setCancelOpen(false)
        toast.success(t('billing.toast.cancelSuccess'))
      },
      onError: () => {
        setCancelError(t('billing.cancel.error'))
      },
    })
  }

  return (
    <div className="space-y-8">
      <div data-tour="billing-plans">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
          {t('billing.title')}
        </h1>
        <p className="text-muted-foreground">{t('billing.subtitle')}</p>
      </div>

      {/* Current status */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Credits balance */}
        <Card className={cn('border-2', credits > 0 ? 'border-blue-500/50 bg-blue-500/5' : 'border-border')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('billing.creditsLeft')}</p>
                <p className="text-4xl font-black text-foreground mt-1">
                  {hasMonthly ? <Infinity className="h-8 w-8 text-blue-500 inline" /> : credits}
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">{t('billing.monthlyPlan')}</p>
                <p className="text-lg font-bold mt-1">
                  {hasMonthly ? t('billing.active') : t('billing.inactive')}
                </p>
                {hasMonthly && sub?.startDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('billing.since')} {formatDate(sub.startDate)}
                  </p>
                )}
                {hasMonthly && (
                  <button
                    onClick={() => setCancelOpen(true)}
                    className="text-xs text-red-500 transition-colors duration-200 hover:underline mt-2"
                  >
                    {t('billing.cancelPlan')}
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
            <h2 className="text-lg font-semibold">{t('billing.buySearches')}</h2>
            <p className="text-sm text-muted-foreground">{t('billing.buySearchesSub')}</p>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {packs?.map((pack) => (
              <Card
                key={pack.credits}
                className={cn(
                  'relative transition-all duration-200 hover:shadow-md',
                  pack.isBestValue && 'border-blue-500 shadow-sm'
                )}
              >
                {pack.isBestValue && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-600">
                    {t('billing.bestValue')}
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
                      {formatSek(Math.round(pack.priceSek / pack.credits))}{t('billing.perSearch')}
                    </p>
                  </div>
                  <Button
                    className={cn('w-full transition-all duration-200', pack.isBestValue ? 'bg-blue-600 hover:bg-blue-500' : '')}
                    variant={pack.isBestValue ? 'default' : 'outline'}
                    onClick={() => handleBuyCredits(pack.credits)}
                    disabled={creditsCheckoutMutation.isPending}
                  >
                    {t('billing.buyNow')}
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
          <h2 className="text-lg font-semibold">{t('billing.monthlyTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('billing.monthlySub')}</p>
        </div>
        <Card className={cn(
          'border-2',
          isProOnly ? 'border-green-500/50' : 'border-slate-600 bg-gradient-to-br from-slate-900 to-blue-950'
        )}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-4xl font-black', isProOnly ? '' : 'text-white')}>499 kr</span>
                  <span className={cn('text-sm', isProOnly ? 'text-muted-foreground' : 'text-slate-400')}>{t('billing.perMonth')}</span>
                </div>
                <div className="space-y-1.5">
                  {(t('billing.features', { returnObjects: true }) as string[]).map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className={cn('h-4 w-4 shrink-0', isProOnly ? 'text-green-500' : 'text-blue-400')} />
                      <span className={cn('text-sm', isProOnly ? '' : 'text-slate-300')}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              {isProOnly ? (
                <Badge variant="outline" className="border-green-500 text-green-600 px-4 py-2 text-base self-start md:self-center">
                  {t('billing.activePlan')}
                </Badge>
              ) : (
                <Button
                  size="lg"
                  className="bg-blue-600 transition-all duration-200 hover:bg-blue-500 md:shrink-0"
                  onClick={handleBuyMonthly}
                  disabled={checkoutMutation.isPending}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('billing.subscribe')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* För företag */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">För företag</h2>
          <p className="text-sm text-muted-foreground">Dela prenumeration med ditt team och hantera sökningar gemensamt.</p>
        </div>
        <Card className="border-blue-800 bg-gradient-to-br from-slate-900 to-blue-950">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-blue-400" />
                  <span className="text-xl font-bold text-white">Företagskonto</span>
                </div>
                <div className="space-y-1.5">
                  {['Dela en prenumeration med hela teamet', 'Bjud in kollegor med e-post', 'Admin- och medlemsroller', 'Kommande: flottövervakning & PDF-rapporter'].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-blue-400" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                size="lg"
                className="bg-blue-600 transition-all duration-200 hover:bg-blue-500 md:shrink-0"
                asChild
              >
                <Link to="/company/admin">
                  <Users className="mr-2 h-4 w-4" />
                  Hantera företagskonto
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase history */}
      <PurchaseHistory />

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={(open) => { setCancelOpen(open); if (!open) setCancelError(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('billing.cancel.title')}</DialogTitle>
            <DialogDescription>
              {t('billing.cancel.description')}
            </DialogDescription>
          </DialogHeader>
          {cancelError && (
            <Alert variant="destructive">
              <AlertDescription>{cancelError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              {t('billing.cancel.keep')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? t('billing.cancel.confirming') : t('billing.cancel.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
