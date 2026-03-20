import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Car, Fuel, Gauge, Palette } from 'lucide-react'
import { getCarImageUrl } from '@/lib/car-image'
import { translateColor, formatMil, getColorSwatch } from '@/lib/format'
import { cn } from '@/lib/utils'

// ── Canvas-based colorization ─────────────────────────────────────────────────
// Imagin Studios demo key always returns a white car on a white background (JPEG).
// Strategy:
//   1. Remove near-white pixels (>235 on all channels) → transparent
//   2. The colored container background shows through the transparent car body
//   3. Dark pixels (tires, windows, shadows) are multiplied with the target color
//      so they become a dark version of the target color
// Result: the car body appears in the target color (via background), dark details tinted.
//
// Requires crossOrigin="anonymous" on the img element and CORS headers from the CDN.
// Falls back gracefully (no-op) if canvas access is blocked.
function colorizeCarImage(img: HTMLImageElement, hex: string): string | null {
  try {
    const { naturalWidth: w, naturalHeight: h } = img
    if (!w || !h) return null
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const th = hex.replace('#', '')
    const tr = parseInt(th.slice(0, 2), 16)
    const tg = parseInt(th.slice(2, 4), 16)
    const tb = parseInt(th.slice(4, 6), 16)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      // Near-white → transparent so the colored container background shows through
      if (r > 235 && g > 235 && b > 235) {
        data[i + 3] = 0
        continue
      }
      // Remaining pixels (tires, windows, shadows): multiply with target color
      data[i]     = Math.round(r * tr / 255)
      data[i + 1] = Math.round(g * tg / 255)
      data[i + 2] = Math.round(b * tb / 255)
    }
    ctx.putImageData(imageData, 0, 0)
    return canvas.toDataURL('image/png')
  } catch {
    return null // cross-origin blocked or canvas error — fall back to original image
  }
}

// Skip colorization for white/silver — the white car on a dark bg looks correct.
function shouldColorize(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return !(lum > 0.6 && Math.max(r, g, b) - Math.min(r, g, b) < 0.12)
}

// Radial gradient in the car's color sits behind the image so that the
// transparent car body (after canvas processing) takes on the correct color.
function getHeroBg(hex: string | null): string {
  if (!hex) return 'linear-gradient(135deg, #1e293b, #0f172a)'
  return `radial-gradient(ellipse at 62% 48%, ${hex}cc 0%, #0f172a 65%)`
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

// Detects if an image element has a transparent background by sampling a corner pixel.
// Returns true if the image is a PNG with actual transparency (alpha < 255).
function hasTransparentBg(img: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 4
    canvas.height = 4
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    ctx.drawImage(img, 0, 0, 4, 4)
    const pixel = ctx.getImageData(0, 0, 1, 1).data
    return pixel[3] < 255 // alpha < 255 → transparent
  } catch {
    return false // cross-origin or canvas error
  }
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
  const [displaySrc, setDisplaySrc] = useState<string | null>(null)

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
        className="relative h-64 sm:h-80 md:h-96 overflow-hidden"
        style={{ background: heroBg }}
      >
        {/* Subtle glow in the car's color */}
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

        {/* Car image
            On load: canvas removes near-white background pixels (→ transparent),
            dark pixels (tires, windows) are multiplied with the target color,
            and the colored container background shows through the transparent car body.
            Falls back to original src if canvas/CORS is unavailable. */}
        {!imgError && (
          <img
            src={displaySrc ?? imageUrl}
            alt={`${brand} ${model} ${year}`}
            crossOrigin="anonymous"
            onLoad={(e) => {
              if (colorSwatch && shouldColorize(colorSwatch) && !displaySrc) {
                const processed = colorizeCarImage(e.currentTarget, colorSwatch)
                if (processed) setDisplaySrc(processed)
              }
              setImgLoaded(true)
            }}
            onError={() => setImgError(true)}
            className={cn(
              'absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-500 p-4',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
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
