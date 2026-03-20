import { formatDistanceToNow } from 'date-fns'
import { sv } from 'date-fns/locale'

export function formatSek(amount: number | null | undefined): string {
  if (amount == null) return '–'
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('sv-SE').format(value)
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: sv })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sv-SE')
}

export function formatMil(km: number): string {
  return `${formatNumber(Math.round(km / 10))} mil`
}

const COLOR_TRANSLATIONS: Record<string, string> = {
  black: 'Svart',
  white: 'Vit',
  silver: 'Silver',
  grey: 'Grå',
  gray: 'Grå',
  red: 'Röd',
  blue: 'Blå',
  green: 'Grön',
  yellow: 'Gul',
  orange: 'Orange',
  brown: 'Brun',
  beige: 'Beige',
  purple: 'Lila',
  gold: 'Guld',
  dark: 'Mörk',
  light: 'Ljus',
  pearl: 'Pärlemor',
  metallic: 'Metallic',
}

export function translateColor(color: string | null | undefined): string {
  if (!color) return '–'
  const lower = color.toLowerCase().trim()
  if (COLOR_TRANSLATIONS[lower]) return COLOR_TRANSLATIONS[lower]
  // Multi-word colors like "Dark Blue" → "Mörk Blå"
  const translated = lower
    .split(/\s+/)
    .map((word) => COLOR_TRANSLATIONS[word] ?? (word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
  return translated
}

const COLOR_SWATCHES: Record<string, string> = {
  svart:         '#1a1a1a',
  vit:           '#f5f5f5',
  vit_pärlemor:  '#f0f0ee',
  pärlemor:      '#f0f0ee',
  silver:        '#c0c0c0',
  grå:           '#808080',
  grå_metallic:  '#909090',
  mörkgrå:       '#505050',
  röd:           '#cc2200',
  röd_metallic:  '#cc2200',
  mörk_röd:      '#8b0000',
  blå:           '#1a4fa0',
  blå_metallic:  '#1a4fa0',
  mörkblå:       '#0d2d6b',
  marinblå:      '#1b2a6b',
  ljusblå:       '#5b9bd5',
  grön:          '#2d7a2d',
  grön_metallic: '#2d7a2d',
  mörkgrön:      '#1a4d1a',
  gul:           '#f5c518',
  orange:        '#e86a10',
  brun:          '#7b4a2d',
  brun_metallic: '#8a5a3a',
  beige:         '#d4c5a0',
  guld:          '#c5a830',
  lila:          '#7b3fa0',
  vinröd:        '#7b0d2a',
  champagne:     '#d4c09a',
  turkos:        '#2e8b8b',
  koppar:        '#b87333',
  bronze:        '#b87333',
  brons:         '#b87333',
}

export function getColorSwatch(colorSv: string | null | undefined): string | null {
  if (!colorSv) return null
  const key = colorSv.toLowerCase().normalize('NFC').replace(/\s+/g, '_').replace(/-/g, '_')
  return COLOR_SWATCHES[key] ?? null
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-lime-600'
  if (score >= 55) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-green-100 text-green-700'
  if (score >= 70) return 'bg-lime-100 text-lime-700'
  if (score >= 55) return 'bg-yellow-100 text-yellow-700'
  if (score >= 40) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}
