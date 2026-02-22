/**
 * Parses a Swedish registration number from a car ad URL (Blocket, Bytbil, etc.)
 * Swedish reg format: 3 letters + 3 digits (e.g. ABC 123 or ABC123)
 * New format also supports 3 letters + 2 digits + 1 letter (e.g. ABC12D) but is rare.
 */
export function parseRegFromUrl(input: string): string | null {
  if (!input.startsWith('http://') && !input.startsWith('https://')) return null

  try {
    const url = new URL(input)
    // Combine pathname + search to maximise chance of finding the reg number
    const text = (url.pathname + url.search).toLowerCase()

    // Swedish reg number pattern: 3 letters + optional separator + 3 digits
    // In URL slugs they typically appear as "abc-123", "abc_123", or "abc123"
    const match = text.match(/\b([a-z]{3})[-_ ]?(\d{3})\b/)
    if (!match) return null

    return (match[1] + match[2]).toUpperCase()
  } catch {
    return null
  }
}

export function isUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://')
}
