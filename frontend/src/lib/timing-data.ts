// Kamrem vs Kamkedja per märke/bränsle/år
// Baserat på tillverkarens tekniska specifikationer (offentlig information)

export interface TimingInfo {
  type: 'belt' | 'chain' | 'unknown'
  intervalKm?: number
  intervalYears?: number
  note: string
}

export function getTimingInfo(
  brand: string,
  fuelType: string | null,
  year: number,
): TimingInfo {
  const b = brand.toLowerCase()
  const isDiesel = fuelType?.toLowerCase().includes('diesel') ?? false

  // VW-gruppen (VW, Audi, Skoda, SEAT, Cupra)
  if (['volkswagen', 'audi', 'skoda', 'seat', 'cupra'].includes(b)) {
    if (isDiesel) {
      if (year >= 2015)
        return { type: 'chain', note: 'EA288-motor (2015+) använder kamkedja — inget byte behövs' }
      return {
        type: 'belt',
        intervalKm: 120000,
        intervalYears: 5,
        note: 'EA189-motor (äldre TDI) använder kamrem — byte var 120 000 km / 5 år',
      }
    }
    // Bensin
    if (year >= 2012) return { type: 'chain', note: 'EA888/EA211-motor (2012+) använder kamkedja' }
    return {
      type: 'belt',
      intervalKm: 120000,
      intervalYears: 5,
      note: 'Äldre bensinmotor — kontrollera om kamrem är bytt',
    }
  }

  // Volvo
  if (b === 'volvo') {
    if (year >= 2017)
      return { type: 'chain', note: 'SPA-plattform (2017+) använder kamkedja' }
    if (isDiesel && year < 2012)
      return {
        type: 'belt',
        intervalKm: 120000,
        intervalYears: 5,
        note: 'Äldre Volvo-diesel kan ha kamrem — kontrollera servicebok',
      }
    return { type: 'chain', note: 'Volvo-motor använder kamkedja' }
  }

  // BMW / MINI
  if (b === 'bmw' || b === 'mini') {
    return { type: 'chain', note: 'BMW-motorer använder generellt kamkedja' }
  }

  // Mercedes-Benz
  if (b === 'mercedes-benz') {
    return { type: 'chain', note: 'Mercedes-Benz använder kamkedja' }
  }

  // Toyota / Lexus
  if (b === 'toyota' || b === 'lexus') {
    return { type: 'chain', note: 'Toyota/Lexus-motorer använder kamkedja' }
  }

  // Kia / Hyundai
  if (b === 'kia' || b === 'hyundai') {
    if (year >= 2018) return { type: 'chain', note: 'Nyare Kia/Hyundai-motorer använder kamkedja' }
    return {
      type: 'unknown',
      note: 'Kontrollera med säljaren — varierar mellan motortyper',
    }
  }

  // Ford
  if (b === 'ford') {
    if (year >= 2019) return { type: 'chain', note: 'Nyare Ford-motorer använder kamkedja' }
    return {
      type: 'unknown',
      note: 'Ford 1.0 EcoBoost använder kamrem — kontrollera motortyp med säljaren',
    }
  }

  // Renault / Dacia
  if (b === 'renault' || b === 'dacia') {
    if (year >= 2020) return { type: 'chain', note: 'Nyare Renault/Dacia-motorer använder kamkedja' }
    return {
      type: 'belt',
      intervalKm: 120000,
      intervalYears: 5,
      note: 'Äldre Renault/Dacia-motorer använder kamrem — kontrollera servicebok',
    }
  }

  // Peugeot / Citroën
  if (b === 'peugeot' || b === 'citroën' || b === 'citroen') {
    if (year >= 2020) return { type: 'chain', note: 'Nyare PureTech/BlueHDi-motorer använder kamkedja' }
    return {
      type: 'belt',
      intervalKm: 120000,
      intervalYears: 5,
      note: 'Äldre Peugeot/Citroën-motorer använder kamrem',
    }
  }

  // Mazda
  if (b === 'mazda') {
    return { type: 'chain', note: 'Mazda SKYACTIV-motorer använder kamkedja' }
  }

  // Subaru
  if (b === 'subaru') {
    if (year >= 2012) return { type: 'chain', note: 'Nyare Subaru-motorer använder kamkedja' }
    return {
      type: 'belt',
      intervalKm: 105000,
      intervalYears: 5,
      note: 'Äldre Subaru-motorer använder kamrem',
    }
  }

  // Fallback för moderna bilar
  if (year >= 2020) return { type: 'chain', note: 'Moderna motorer använder i regel kamkedja' }

  return {
    type: 'unknown',
    note: 'Kontrollera med tillverkaren eller auktoriserad verkstad',
  }
}
