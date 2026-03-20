/**
 * Imagin Studios car imagery API (demo key — watermarked)
 * Docs: https://docs.imagin.studio
 *
 * NOTE: The demo key ("img") has limited coverage.
 * Colors only render correctly if Imagin Studios has that specific
 * make/model/color combination in their catalog.
 * Older or uncommon models may show a generic/white fallback.
 */

const BASE_URL = 'https://cdn.imagin.studio/getimage'
const CUSTOMER = 'img' // public demo key

// ── Swedish color name → Imagin Studios generic paint ID ─────────────────────

const COLOR_MAP: Record<string, string> = {
  svart:          'color-black',
  vit:            'color-white',
  vit_pärlemor:  'color-white',
  pärlemor:       'color-white',
  silver:         'color-silver',
  grå:            'color-grey',
  grå_metallic:   'color-grey',
  mörkgrå:        'color-grey',
  röd:            'color-red',
  röd_metallic:   'color-red',
  mörk_röd:       'color-red',
  blå:            'color-blue',
  blå_metallic:   'color-blue',
  mörkblå:        'color-blue',
  marinblå:       'color-blue',
  ljusblå:        'color-blue',
  grön:           'color-green',
  grön_metallic:  'color-green',
  mörkgrön:       'color-green',
  gul:            'color-yellow',
  orange:         'color-orange',
  brun:           'color-brown',
  brun_metallic:  'color-brown',
  beige:          'color-beige',
  guld:           'color-gold',
  lila:           'color-grey',
  vinröd:         'color-red',
  champagne:      'color-beige',
  turkos:         'color-blue',
  koppar:         'color-brown',
  bronze:         'color-brown',
  brons:          'color-brown',
}

function mapColor(colorSv: string | null | undefined): string {
  if (!colorSv) return 'color-grey'
  // Normalize: lowercase, spaces/hyphens → underscore
  const key = colorSv
    .toLowerCase()
    .normalize('NFC')             // normalize unicode (å ä ö)
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
  const mapped = COLOR_MAP[key]
  if (!mapped) {
    console.debug(`[car-image] unmapped color: "${colorSv}" (key: "${key}") → fallback grey`)
  }
  return mapped ?? 'color-grey'
}

// ── Brand name → Imagin Studios make ID ──────────────────────────────────────

const BRAND_MAP: Record<string, string> = {
  'mercedes-benz': 'mercedes-benz',
  mercedes:        'mercedes-benz',
  vw:              'volkswagen',
  volkswagen:      'volkswagen',
  bmw:             'bmw',
  volvo:           'volvo',
  toyota:          'toyota',
  ford:            'ford',
  audi:            'audi',
  skoda:           'skoda',
  škoda:           'skoda',
  opel:            'opel',
  kia:             'kia',
  hyundai:         'hyundai',
  nissan:          'nissan',
  peugeot:         'peugeot',
  renault:         'renault',
  honda:           'honda',
  mazda:           'mazda',
  seat:            'seat',
  cupra:           'cupra',
  suzuki:          'suzuki',
  mitsubishi:      'mitsubishi',
  subaru:          'subaru',
  fiat:            'fiat',
  citroen:         'citroen',
  citroën:         'citroen',
  mini:            'mini',
  porsche:         'porsche',
  'land rover':    'land-rover',
  jeep:            'jeep',
  tesla:           'tesla',
  lexus:           'lexus',
  alfa_romeo:      'alfa-romeo',
  'alfa romeo':    'alfa-romeo',
  chevrolet:       'chevrolet',
  dacia:           'dacia',
  saab:            'saab',
  genesis:         'genesis',
  polestar:        'polestar',
}

function mapBrand(brand: string): string {
  const key = brand.toLowerCase().trim()
  return BRAND_MAP[key] ?? key.replace(/\s+/g, '-')
}

// ── Model name → Imagin Studios modelFamily ID ────────────────────────────────

function mapModel(model: string): string {
  return model
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// ── Build URL ─────────────────────────────────────────────────────────────────

export interface CarImageParams {
  brand: string
  model: string
  year?: number
  color?: string | null
}

export function getCarImageUrl({ brand, model, year, color }: CarImageParams): string {
  const make        = mapBrand(brand)
  const modelFamily = mapModel(model)
  const paintId     = mapColor(color)

  // Angle 23 = front 3/4 view — standard Imagin Studios numeric angle
  const params = new URLSearchParams({
    customer:    CUSTOMER,
    make,
    modelFamily,
    paintId,
    angle:       '23',
  })

  if (year) params.set('modelYear', String(year))

  const url = `${BASE_URL}?${params.toString()}`
  console.debug(`[car-image] ${brand} ${model} ${year} "${color}" → ${url}`)
  return url
}
