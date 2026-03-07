// Standard warranty periods for the Swedish market
// Source: manufacturer warranty documents (public knowledge)
// Duration in months. km: 0 = unlimited

export interface WarrantySpec {
  label: string
  months: number
  km: number // 0 = unlimited
}

const warrantyDb: Record<string, WarrantySpec[]> = {
  Volkswagen: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Drivlinegaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
    { label: 'Vägassistans', months: 24, km: 0 },
  ],
  Audi: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Drivlinegaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Skoda: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Drivlinegaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  SEAT: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Cupra: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Volvo: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Drivlinegaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 96, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
    { label: 'Vägassistans', months: 24, km: 0 },
  ],
  BMW: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
    { label: 'BMW Assistance', months: 36, km: 0 },
  ],
  MINI: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  'Mercedes-Benz': [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 360, km: 0 }, // 30 år
    { label: 'Lackgaranti', months: 36, km: 0 },
    { label: 'Vägassistans', months: 24, km: 0 },
  ],
  Toyota: [
    { label: 'Nybilsgaranti', months: 36, km: 100000 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
    { label: 'Vägassistans', months: 36, km: 0 },
  ],
  Lexus: [
    { label: 'Nybilsgaranti', months: 36, km: 100000 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Kia: [
    { label: 'Nybilsgaranti (7 år)', months: 84, km: 150000 },
    { label: 'Drivlinegaranti (7 år)', months: 84, km: 150000 },
    { label: 'Rostskyddsgaranti', months: 72, km: 0 },
    { label: 'Lackgaranti', months: 84, km: 0 },
  ],
  Hyundai: [
    { label: 'Nybilsgaranti', months: 60, km: 100000 },
    { label: 'Drivlinegaranti', months: 60, km: 0 },
    { label: 'Rostskyddsgaranti', months: 60, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Ford: [
    { label: 'Nybilsgaranti', months: 36, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
    { label: 'Vägassistans', months: 36, km: 0 },
  ],
  Opel: [
    { label: 'Nybilsgaranti', months: 36, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Peugeot: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 96, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Citroën: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 96, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Renault: [
    { label: 'Nybilsgaranti', months: 24, km: 0 },
    { label: 'Rostskyddsgaranti', months: 96, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Dacia: [
    { label: 'Nybilsgaranti', months: 36, km: 100000 },
    { label: 'Rostskyddsgaranti', months: 96, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Nissan: [
    { label: 'Nybilsgaranti', months: 36, km: 100000 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Honda: [
    { label: 'Nybilsgaranti', months: 36, km: 0 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Mazda: [
    { label: 'Nybilsgaranti', months: 36, km: 100000 },
    { label: 'Rostskyddsgaranti', months: 144, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Subaru: [
    { label: 'Nybilsgaranti', months: 36, km: 0 },
    { label: 'Rostskyddsgaranti', months: 96, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
  Mitsubishi: [
    { label: 'Nybilsgaranti', months: 36, km: 100000 },
    { label: 'Rostskyddsgaranti', months: 120, km: 0 },
    { label: 'Lackgaranti', months: 36, km: 0 },
  ],
}

export interface WarrantyStatus extends WarrantySpec {
  isValid: boolean
  expiresAt: Date
  monthsRemaining: number
}

export function getWarrantyStatuses(
  brand: string,
  firstRegistrationDate: string | null,
  currentMileageKm: number,
): WarrantyStatus[] {
  if (!firstRegistrationDate) return []

  const key = Object.keys(warrantyDb).find(
    (b) => b.toLowerCase() === brand.toLowerCase(),
  )
  if (!key) return []

  const regDate = new Date(firstRegistrationDate)
  const now = new Date()

  return warrantyDb[key].map((spec) => {
    const expiresAt = new Date(regDate)
    expiresAt.setMonth(expiresAt.getMonth() + spec.months)

    const monthsElapsed =
      (now.getFullYear() - regDate.getFullYear()) * 12 +
      (now.getMonth() - regDate.getMonth())
    const monthsRemaining = Math.max(0, spec.months - monthsElapsed)

    const timeValid = now <= expiresAt
    const kmValid = spec.km === 0 || currentMileageKm <= spec.km
    const isValid = timeValid && kmValid

    return { ...spec, isValid, expiresAt, monthsRemaining }
  })
}
