import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Car, Fuel, Gauge, Palette } from 'lucide-react'
import { getCarImageUrl } from '@/lib/car-image'
import { translateColor, formatMil, getColorSwatch } from '@/lib/format'
import { cn } from '@/lib/utils'

// ── Background gradient based on car color ────────────────────────────────────
// The Imagin Studios demo key returns a white car regardless of paintId.
// By placing a radial gradient in the car's color behind the image and applying
// mix-blend-mode: multiply to the image, white pixels in the image take on the
// background color — making the car appear in the correct color.
//   white × red   = red   ✓
//   white × black = black ✓
//   white × blue  = blue  ✓
// For white/silver we skip the multiply (white car on dark bg looks correct).
function getHeroBg(hex: string | null): string | null {
  if (!hex) return null
  const h = hex.replace('#', '')
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  // Light achromatic (white, silver) — no multiply needed, white car looks correct
  if (lum > 0.6 && Math.max(r, g, b) - Math.min(r, g, b) < 0.12) return null
  // Radial gradient: car's color in the center (where the car sits), dark at edges
  return `radial-gradient(ellipse at 62% 48%, ${hex}e0 0%, #0f172a 68%)`
}

interface CarHeroProps {
  brand: string
  model: string
  year: number
  color: string | null
  fuelType: string | null
  horsePower: number | null
  mileage: number
  registrationNumber: string
  score: number
}

function ScoreBadge({ score }: { score: number }) {
  const { t } = useTranslation()

  const color =
    score >= 70 ? 'from-green-500 to-emerald-600' :
    score >= 40 ? 'from-yellow-500 to-amber-600' :
    'from-red-500 to-rose-600'

  const label =
    score >= 70 ? t('carHero.score.excellent') :
    score >= 40 ? t('carHero.score.good') :
    t('carHero.score.poor')

  return (
    <div className={cn(
      'inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br px-4 py-3 shadow-lg',
      color,
    )}>
      <span className="text-3xl font-black text-white leading-none">{score}</span>
      <span className="text-[10px] font-semibold text-white/80 mt-0.5 tracking-wide uppercase">{label}</span>
    </div>
  )
}

export function CarHero({
  brand,
  model,
  year,
  color,
  fuelType,
  horsePower,
  mileage,
  registrationNumber,
  score,
}: CarHeroProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const imageUrl = getCarImageUrl({ brand, model, year, color })

  const colorSwatch = getColorSwatch(color)
  const heroBg = getHeroBg(colorSwatch)

  const specs = [
    color && {
      icon: colorSwatch
        ? <span className="h-5 w-5 rounded-full border-2 border-border shadow-md shrink-0 ring-1 ring-black/10" style={{ backgroundColor: colorSwatch }} />
        : <Palette className="h-3.5 w-3.5" />,
      value: translateColor(color),
    },
    fuelType && { icon: <Fuel className="h-3.5 w-3.5" />, value: fuelType },
    mileage && { icon: <Gauge className="h-3.5 w-3.5" />, value: formatMil(mileage) },
    horsePower && { icon: <Car className="h-3.5 w-3.5" />, value: `${horsePower} hk` },
  ].filter(Boolean) as { icon: React.ReactNode; value: string }[]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* ── Image area ── */}
      <div
        className={cn(
          'relative h-64 sm:h-80 md:h-96 overflow-hidden',
          !heroBg && 'bg-gradient-to-br from-slate-900 to-slate-800',
        )}
        style={heroBg ? { background: heroBg } : undefined}
      >
        {/* Subtle glow — uses car's color when known, otherwise blue */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25">
          <div
            className="h-48 w-96 rounded-full blur-3xl"
            style={{ backgroundColor: colorSwatch ?? '#3b82f6' }}
          />
        </div>

        {/* Fallback car icon shown while loading or on error */}
        {(!imgLoaded || imgError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
            <Car className="h-16 w-16" />
            <span className="text-xs font-medium">{brand} {model}</span>
          </div>
        )}

        {/* Car image — mix-blend-mode: multiply tints the white car to the bg color */}
        {!imgError && (
          <img
            src={imageUrl}
            alt={`${brand} ${model} ${year}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={cn(
              'absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-500 p-4',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
            style={heroBg ? { mixBlendMode: 'multiply' } : undefined}
          />
        )}

        {/* Dark gradient overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Registration plate — top left */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">SE</span>
            <span className="text-sm font-black tracking-[0.15em] text-white">
              {registrationNumber.replace(/^([A-Za-z]{3})(\d{3})$/, '$1 $2').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Score badge — top right */}
        <div className="absolute top-3 right-3">
          <ScoreBadge score={score} />
        </div>
      </div>

      {/* ── Info bar below image ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
        {/* Brand / model / year */}
        <div>
          <p className="text-base font-bold leading-tight">
            {brand} {model}
          </p>
          <p className="text-xs text-muted-foreground">{year}</p>
        </div>

        {/* Specs chips */}
        <div className="flex flex-wrap items-center gap-2">
          {specs.map(({ icon, value }) => (
            <span
              key={value}
              className="flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {icon}
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
