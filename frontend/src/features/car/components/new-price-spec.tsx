import { Tag, TrendingDown } from 'lucide-react'
import { getNewPriceInfo } from '@/lib/new-price-data'

interface NewPriceSpecProps {
  brand: string
  model: string
  year: number
  currentMarketValue: number | null
}

function formatSek(amount: number): string {
  return amount.toLocaleString('sv-SE') + ' kr'
}

export function NewPriceSpec({ brand, model, year, currentMarketValue }: NewPriceSpecProps) {
  if (year < 2020) return null

  const info = getNewPriceInfo(brand, model, year)
  if (!info) return null

  const depreciation =
    currentMarketValue != null
      ? Math.round(((info.basePrice - currentMarketValue) / info.basePrice) * 100)
      : null

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-blue-400" />
        <div>
          <h2 className="text-base font-semibold">Nypris</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{info.note}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">Baslistpris (ny)</p>
          <p className="text-lg font-bold mt-0.5">{formatSek(info.basePrice)}</p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">Prisintervall (utrustad)</p>
          <p className="text-sm font-semibold mt-0.5">
            {formatSek(info.priceRange.min)} – {formatSek(info.priceRange.max)}
          </p>
        </div>
      </div>

      {depreciation !== null && depreciation > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <TrendingDown className="h-5 w-5 text-blue-400 shrink-0" />
          <div>
            <p className="text-sm font-medium">
              Värdeutveckling: <span className="text-blue-400">-{depreciation}%</span> sedan ny
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nuvarande marknadsvärde {formatSek(currentMarketValue!)} vs nypris {formatSek(info.basePrice)}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2 mt-2">
        <strong>OBS:</strong> Nypriset är ett ungefärligt ursprungligt listpris för {brand} {model} {year}
        på svenska marknaden. Faktiskt pris vid köp varierade beroende på extrautrustning och förhandling.
        Informationen kan vara ofullständig eller inaktuell.
      </p>
    </div>
  )
}
