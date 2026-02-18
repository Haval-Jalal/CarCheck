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
