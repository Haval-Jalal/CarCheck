// Vanliga besiktningsanmärkningar per modell/åldersgrupp
// Baserat på Bilprovningens och Opus Bilprovnings offentliga besiktningsstatistik
// Frekvenser är nationella genomsnitt för fordon i samma åldersgrupp

export interface KnownProblemEntry {
  component: string
  frequency: number // 0–1 (andel fordon med anmärkning)
  severity: 'high' | 'medium' | 'low'
}

export interface ModelProblems {
  problems: KnownProblemEntry[]
  source: string
}

// Åldersbaserade generiska problem (fallback för alla modeller)
const genericByAge: Record<string, KnownProblemEntry[]> = {
  // 0–3 år
  new: [
    { component: 'Vindrutetorkare', frequency: 0.04, severity: 'low' },
    { component: 'Belysning (glödlampa)', frequency: 0.03, severity: 'low' },
  ],
  // 4–7 år
  mid: [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.18, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.12, severity: 'high' },
    { component: 'Däck — slitage eller skador', frequency: 0.09, severity: 'medium' },
    { component: 'Vätskeläckage', frequency: 0.08, severity: 'medium' },
    { component: 'Vindrutetorkare', frequency: 0.07, severity: 'low' },
    { component: 'Belysning', frequency: 0.06, severity: 'low' },
  ],
  // 8+ år
  old: [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.28, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.20, severity: 'high' },
    { component: 'Vätskeläckage', frequency: 0.16, severity: 'medium' },
    { component: 'Rost på bromsskiva (>25%)', frequency: 0.15, severity: 'medium' },
    { component: 'Däck — slitage eller skador', frequency: 0.12, severity: 'medium' },
    { component: 'Avgasrör — läckage', frequency: 0.10, severity: 'medium' },
    { component: 'Fjädring — slitage', frequency: 0.09, severity: 'medium' },
    { component: 'Vindrutetorkare', frequency: 0.08, severity: 'low' },
    { component: 'Belysning', frequency: 0.07, severity: 'low' },
  ],
}

// Modellspecifik data (vanligaste felkällorna)
const modelDb: Record<string, KnownProblemEntry[]> = {
  // VW Tiguan (2016–2023)
  'volkswagen tiguan': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.24, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.16, severity: 'high' },
    { component: 'Vätskeläckage', frequency: 0.14, severity: 'medium' },
    { component: 'Rost på bromsskiva (>25%)', frequency: 0.13, severity: 'medium' },
    { component: 'Fälg — storlek/typ', frequency: 0.11, severity: 'low' },
    { component: 'Vindrutetorkare', frequency: 0.07, severity: 'low' },
    { component: 'Stänkskydd — saknas', frequency: 0.06, severity: 'low' },
    { component: 'Däck — skador', frequency: 0.05, severity: 'medium' },
  ],
  // VW Golf (Mk7/Mk8)
  'volkswagen golf': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.20, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.14, severity: 'high' },
    { component: 'Vätskeläckage', frequency: 0.11, severity: 'medium' },
    { component: 'Vindrutetorkare', frequency: 0.08, severity: 'low' },
    { component: 'Belysning', frequency: 0.06, severity: 'low' },
    { component: 'Däck — slitage', frequency: 0.05, severity: 'medium' },
  ],
  // VW Passat
  'volkswagen passat': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.22, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.15, severity: 'high' },
    { component: 'Vätskeläckage', frequency: 0.13, severity: 'medium' },
    { component: 'Fjädring — slitage', frequency: 0.10, severity: 'medium' },
    { component: 'Däck — slitage', frequency: 0.08, severity: 'medium' },
  ],
  // Volvo V60 / S60
  'volvo v60': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.19, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.13, severity: 'high' },
    { component: 'Fjädring — slitage', frequency: 0.11, severity: 'medium' },
    { component: 'Vätskeläckage', frequency: 0.09, severity: 'medium' },
    { component: 'Däck — slitage', frequency: 0.07, severity: 'medium' },
  ],
  'volvo s60': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.19, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.13, severity: 'high' },
    { component: 'Fjädring — slitage', frequency: 0.11, severity: 'medium' },
    { component: 'Vätskeläckage', frequency: 0.09, severity: 'medium' },
  ],
  // Volvo XC60
  'volvo xc60': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.21, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.14, severity: 'high' },
    { component: 'Fjädring — slitage', frequency: 0.12, severity: 'medium' },
    { component: 'Vätskeläckage', frequency: 0.10, severity: 'medium' },
    { component: 'Partikelfilter (DPF)', frequency: 0.08, severity: 'medium' },
  ],
  // Volvo V90 / XC90
  'volvo v90': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.18, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.12, severity: 'high' },
    { component: 'Fjädring — luftfjädring', frequency: 0.13, severity: 'high' },
    { component: 'Vätskeläckage', frequency: 0.09, severity: 'medium' },
  ],
  // BMW 3-serie
  'bmw 3': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.23, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.16, severity: 'high' },
    { component: 'Fjädring — slitage', frequency: 0.14, severity: 'medium' },
    { component: 'Vätskeläckage', frequency: 0.12, severity: 'medium' },
    { component: 'Styrstag/styrled', frequency: 0.09, severity: 'medium' },
  ],
  // Toyota RAV4
  'toyota rav4': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.15, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.10, severity: 'high' },
    { component: 'Vätskeläckage', frequency: 0.06, severity: 'medium' },
    { component: 'Vindrutetorkare', frequency: 0.05, severity: 'low' },
  ],
  // Kia Sportage
  'kia sportage': [
    { component: 'Bromsskivor eller bromstrummor', frequency: 0.16, severity: 'high' },
    { component: 'Bromsbelägg', frequency: 0.11, severity: 'high' },
    { component: 'Vätskeläckage', frequency: 0.08, severity: 'medium' },
    { component: 'Vindrutetorkare', frequency: 0.06, severity: 'low' },
  ],
}

export interface KnownProblemsResult {
  problems: KnownProblemEntry[]
  isModelSpecific: boolean
}

export function getKnownProblems(
  brand: string,
  model: string,
  year: number,
): KnownProblemsResult {
  const key = `${brand} ${model}`.toLowerCase()

  // Sök modellspecifik data (exact eller delvis matchning)
  const modelKey = Object.keys(modelDb).find(
    (k) => key.startsWith(k) || k.startsWith(key.split(' ').slice(0, 2).join(' ')),
  )

  if (modelKey) {
    return { problems: modelDb[modelKey], isModelSpecific: true }
  }

  // Fallback: åldersbaserad generisk data
  const age = new Date().getFullYear() - year
  const ageGroup = age <= 3 ? 'new' : age <= 7 ? 'mid' : 'old'
  return { problems: genericByAge[ageGroup], isModelSpecific: false }
}
