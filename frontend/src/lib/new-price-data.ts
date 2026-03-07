// Ungefärliga ursprungliga listpriser för populära modeller på svenska marknaden (2020+)
// Källa: offentliga prislistor vid lansering (avrundade till närmaste 10 000 kr)
// Endast för 2020 och nyare fordon

export interface NewPriceInfo {
  basePrice: number
  priceRange: { min: number; max: number }
  note: string
}

const priceDb: Record<string, NewPriceInfo> = {
  // Volkswagen
  'volkswagen golf 2020': { basePrice: 290000, priceRange: { min: 270000, max: 420000 }, note: 'Golf Mk8, bensin/diesel/GTE' },
  'volkswagen golf 2021': { basePrice: 300000, priceRange: { min: 280000, max: 430000 }, note: 'Golf Mk8' },
  'volkswagen golf 2022': { basePrice: 310000, priceRange: { min: 290000, max: 440000 }, note: 'Golf Mk8' },
  'volkswagen golf 2023': { basePrice: 320000, priceRange: { min: 300000, max: 450000 }, note: 'Golf Mk8' },
  'volkswagen tiguan 2020': { basePrice: 370000, priceRange: { min: 340000, max: 560000 }, note: 'Tiguan Facelift, 2WD/4Motion' },
  'volkswagen tiguan 2021': { basePrice: 380000, priceRange: { min: 350000, max: 570000 }, note: 'Tiguan' },
  'volkswagen tiguan 2022': { basePrice: 400000, priceRange: { min: 360000, max: 590000 }, note: 'Tiguan' },
  'volkswagen tiguan 2023': { basePrice: 420000, priceRange: { min: 380000, max: 610000 }, note: 'Tiguan Mk2 Facelift' },
  'volkswagen passat 2020': { basePrice: 380000, priceRange: { min: 350000, max: 520000 }, note: 'Passat B8, GTE inkluderad' },
  'volkswagen passat 2021': { basePrice: 390000, priceRange: { min: 360000, max: 530000 }, note: 'Passat B8' },
  'volkswagen id.4 2021': { basePrice: 470000, priceRange: { min: 450000, max: 570000 }, note: 'ID.4 elbil' },
  'volkswagen id.4 2022': { basePrice: 480000, priceRange: { min: 460000, max: 590000 }, note: 'ID.4' },
  'volkswagen id.4 2023': { basePrice: 490000, priceRange: { min: 470000, max: 610000 }, note: 'ID.4' },

  // Volvo
  'volvo xc60 2020': { basePrice: 500000, priceRange: { min: 460000, max: 750000 }, note: 'XC60 II B4/B5/T8' },
  'volvo xc60 2021': { basePrice: 530000, priceRange: { min: 490000, max: 780000 }, note: 'XC60 II' },
  'volvo xc60 2022': { basePrice: 560000, priceRange: { min: 510000, max: 810000 }, note: 'XC60 II Recharge' },
  'volvo xc60 2023': { basePrice: 590000, priceRange: { min: 540000, max: 840000 }, note: 'XC60 II' },
  'volvo v60 2020': { basePrice: 420000, priceRange: { min: 390000, max: 620000 }, note: 'V60 II B4/B5/T8' },
  'volvo v60 2021': { basePrice: 440000, priceRange: { min: 410000, max: 640000 }, note: 'V60 II' },
  'volvo v60 2022': { basePrice: 460000, priceRange: { min: 430000, max: 660000 }, note: 'V60 II' },
  'volvo v60 2023': { basePrice: 480000, priceRange: { min: 450000, max: 680000 }, note: 'V60 II' },
  'volvo v90 2020': { basePrice: 560000, priceRange: { min: 510000, max: 800000 }, note: 'V90 II B5/T8' },
  'volvo v90 2021': { basePrice: 580000, priceRange: { min: 530000, max: 820000 }, note: 'V90 II' },
  'volvo xc40 2020': { basePrice: 380000, priceRange: { min: 350000, max: 550000 }, note: 'XC40 B3/B4/T5/P8' },
  'volvo xc40 2021': { basePrice: 390000, priceRange: { min: 360000, max: 560000 }, note: 'XC40' },
  'volvo xc40 2022': { basePrice: 420000, priceRange: { min: 380000, max: 610000 }, note: 'XC40 Recharge' },

  // BMW
  'bmw 3 2020': { basePrice: 440000, priceRange: { min: 400000, max: 680000 }, note: 'G20 318i–M340i, xDrive' },
  'bmw 3 2021': { basePrice: 460000, priceRange: { min: 420000, max: 700000 }, note: '3-serie G20' },
  'bmw 3 2022': { basePrice: 480000, priceRange: { min: 440000, max: 720000 }, note: '3-serie G20' },
  'bmw 5 2021': { basePrice: 590000, priceRange: { min: 550000, max: 900000 }, note: 'G30 520i–550i, xDrive' },
  'bmw x3 2020': { basePrice: 520000, priceRange: { min: 480000, max: 780000 }, note: 'G01 xDrive20i–M40i' },
  'bmw x3 2021': { basePrice: 540000, priceRange: { min: 500000, max: 800000 }, note: 'X3 G01' },

  // Toyota
  'toyota rav4 2020': { basePrice: 380000, priceRange: { min: 350000, max: 510000 }, note: 'RAV4 Mk5 Hybrid/AWD-i' },
  'toyota rav4 2021': { basePrice: 390000, priceRange: { min: 360000, max: 530000 }, note: 'RAV4 Mk5' },
  'toyota rav4 2022': { basePrice: 400000, priceRange: { min: 370000, max: 540000 }, note: 'RAV4 Mk5' },
  'toyota rav4 2023': { basePrice: 420000, priceRange: { min: 390000, max: 560000 }, note: 'RAV4 Mk5 PHEV' },
  'toyota camry 2020': { basePrice: 380000, priceRange: { min: 360000, max: 440000 }, note: 'Camry XV70 Hybrid' },
  'toyota yaris 2021': { basePrice: 230000, priceRange: { min: 210000, max: 300000 }, note: 'Yaris Mk4 Hybrid' },
  'toyota c-hr 2020': { basePrice: 310000, priceRange: { min: 280000, max: 380000 }, note: 'C-HR Hybrid' },

  // Kia
  'kia sportage 2021': { basePrice: 330000, priceRange: { min: 300000, max: 450000 }, note: 'Sportage NQ5 MHEV/HEV/PHEV' },
  'kia sportage 2022': { basePrice: 360000, priceRange: { min: 330000, max: 480000 }, note: 'Sportage NQ5' },
  'kia sportage 2023': { basePrice: 380000, priceRange: { min: 350000, max: 500000 }, note: 'Sportage NQ5' },
  'kia ev6 2022': { basePrice: 490000, priceRange: { min: 460000, max: 600000 }, note: 'EV6 elbil' },
  'kia niro 2021': { basePrice: 310000, priceRange: { min: 280000, max: 430000 }, note: 'Niro HEV/PHEV/EV' },
  'kia niro 2022': { basePrice: 330000, priceRange: { min: 300000, max: 450000 }, note: 'Niro Mk2' },

  // Hyundai
  'hyundai tucson 2021': { basePrice: 330000, priceRange: { min: 300000, max: 470000 }, note: 'Tucson NX4 MHEV/HEV/PHEV' },
  'hyundai tucson 2022': { basePrice: 360000, priceRange: { min: 330000, max: 490000 }, note: 'Tucson NX4' },
  'hyundai ioniq 5 2022': { basePrice: 490000, priceRange: { min: 460000, max: 600000 }, note: 'IONIQ 5 elbil' },

  // Skoda
  'skoda octavia 2021': { basePrice: 280000, priceRange: { min: 260000, max: 400000 }, note: 'Octavia Mk4 TSI/TDI' },
  'skoda octavia 2022': { basePrice: 290000, priceRange: { min: 270000, max: 420000 }, note: 'Octavia Mk4' },
  'skoda superb 2020': { basePrice: 360000, priceRange: { min: 330000, max: 490000 }, note: 'Superb Mk3 FL TSI/TDI iV' },

  // Ford
  'ford kuga 2020': { basePrice: 340000, priceRange: { min: 310000, max: 480000 }, note: 'Kuga Mk3 PHEV/EcoBoost' },
  'ford kuga 2021': { basePrice: 360000, priceRange: { min: 330000, max: 500000 }, note: 'Kuga Mk3' },
  'ford puma 2020': { basePrice: 270000, priceRange: { min: 250000, max: 340000 }, note: 'Puma EcoBoost mHEV' },
  'ford mustang mach-e 2021': { basePrice: 560000, priceRange: { min: 520000, max: 680000 }, note: 'Mach-E elbil' },
}

export function getNewPriceInfo(
  brand: string,
  model: string,
  year: number,
): NewPriceInfo | null {
  if (year < 2020) return null

  const key = `${brand} ${model} ${year}`.toLowerCase()

  // Exakt träff
  if (priceDb[key]) return priceDb[key]

  // Försök med modell utan årstal (tar närmaste år)
  const baseKey = `${brand} ${model}`.toLowerCase()
  const candidates = Object.keys(priceDb).filter((k) => k.startsWith(baseKey))
  if (candidates.length === 0) return null

  // Ta närmaste år
  const closest = candidates.reduce((prev, curr) => {
    const prevYear = parseInt(prev.split(' ').at(-1) ?? '0')
    const currYear = parseInt(curr.split(' ').at(-1) ?? '0')
    return Math.abs(currYear - year) < Math.abs(prevYear - year) ? curr : prev
  })

  return priceDb[closest] ?? null
}
