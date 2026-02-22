import { useState, useMemo } from 'react'
import { Tag, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AnalysisDetails } from '@/types/car.types'

interface Props {
  qualityScore: number // 0-100, the car's overall analysis score
  details: AnalysisDetails | null
}

function calcPriceScore(askingPrice: number, marketPrice: number): number {
  // 100 = 30%+ below market, 50 = at market, 0 = 30%+ above market
  const ratio = askingPrice / marketPrice
  if (ratio <= 0.7) return 100
  if (ratio >= 1.3) return 0
  return Math.round(100 - ((ratio - 0.7) / 0.6) * 100)
}

function calcDealScore(qualityScore: number, priceScore: number): number {
  return Math.round(qualityScore * 0.6 + priceScore * 0.4)
}

function getDealLabel(score: number): { label: string; color: string; icon: React.ReactNode } {
  if (score >= 75) return { label: 'Bra deal', color: 'text-green-600', icon: <TrendingDown className="h-5 w-5 text-green-600" /> }
  if (score >= 55) return { label: 'Okej deal', color: 'text-yellow-600', icon: <Minus className="h-5 w-5 text-yellow-600" /> }
  return { label: 'Dåligt deal', color: 'text-red-600', icon: <TrendingUp className="h-5 w-5 text-red-600" /> }
}

function formatSek(amount: number) {
  return amount.toLocaleString('sv-SE') + ' kr'
}

export function DealScore({ qualityScore, details }: Props) {
  const [rawPrice, setRawPrice] = useState('')

  const marketPrice = details?.marketValueSek ?? details?.averageMarketPriceSek ?? null

  const askingPrice = useMemo(() => {
    const n = parseInt(rawPrice.replace(/\s/g, ''), 10)
    return isNaN(n) || n <= 0 ? null : n
  }, [rawPrice])

  const priceScore = useMemo(() => {
    if (askingPrice == null || marketPrice == null) return null
    return calcPriceScore(askingPrice, marketPrice)
  }, [askingPrice, marketPrice])

  const dealScore = useMemo(() => {
    if (priceScore == null) return null
    return calcDealScore(qualityScore, priceScore)
  }, [qualityScore, priceScore])

  const dealInfo = dealScore != null ? getDealLabel(dealScore) : null

  const priceDiff = askingPrice != null && marketPrice != null ? askingPrice - marketPrice : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4 text-blue-500" />
          Deal Score — är affären bra?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asking-price">
            Annonsens pris (kr)
            {marketPrice && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Marknadsvärde: {formatSek(marketPrice)}
              </span>
            )}
          </Label>
          <Input
            id="asking-price"
            type="text"
            inputMode="numeric"
            placeholder="t.ex. 125 000"
            value={rawPrice}
            onChange={(e) => setRawPrice(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {dealScore != null && dealInfo != null && (
          <div className="space-y-3">
            {/* Deal Score display */}
            <div className="flex items-center gap-4 rounded-xl border p-4">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full border-4',
                    dealScore >= 75 ? 'border-green-500' : dealScore >= 55 ? 'border-yellow-500' : 'border-red-500'
                  )}
                >
                  <span className={cn('text-2xl font-bold', dealInfo.color)}>{dealScore}</span>
                </div>
                <span className="text-xs text-muted-foreground">av 100</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {dealInfo.icon}
                  <span className={cn('text-lg font-bold', dealInfo.color)}>{dealInfo.label}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bilkvalitet: <strong>{Math.round(qualityScore)}/100</strong> (60%) +{' '}
                  Pris: <strong>{priceScore}/100</strong> (40%)
                </p>
                {priceDiff !== null && (
                  <p className={cn('mt-1 text-sm font-medium', priceDiff > 0 ? 'text-red-600' : 'text-green-600')}>
                    {priceDiff > 0
                      ? `${formatSek(priceDiff)} över marknadspriset`
                      : `${formatSek(Math.abs(priceDiff))} under marknadspriset`}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground/70 italic">
              Deal Score kombinerar bilens kvalitetspoäng (60%) med hur priset förhåller sig till
              marknadsvärdet (40%). Poängen 100 = perfekt deal, 0 = dålig deal.
            </p>
          </div>
        )}

        {marketPrice == null && (
          <p className="text-xs text-muted-foreground">
            Marknadsvärde saknas för denna bil — Deal Score kan inte beräknas.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
