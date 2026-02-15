export interface CarSearchRequest {
  registrationNumber: string
  captchaToken?: string | null
}

export interface CarSearchResponse {
  carId: string
  registrationNumber: string
  brand: string
  model: string
  year: number
  mileage: number
  fuelType: string | null
  horsePower: number | null
  color: string | null
  marketValueSek: number | null
}

export interface CarAnalysisResponse {
  analysisId: string
  carId: string
  registrationNumber: string
  brand: string
  model: string
  year: number
  score: number
  recommendation: string
  breakdown: AnalysisBreakdown
  createdAt: string
  details: AnalysisDetails | null
}

export interface AnalysisBreakdown {
  ageScore: number
  mileageScore: number
  insuranceScore: number
  recallScore: number
  inspectionScore: number
  debtFinanceScore: number
  serviceHistoryScore: number
  drivetrainScore: number
  ownerHistoryScore: number
  marketValueScore: number
  environmentScore: number
  theftSecurityScore: number
}

// Detail record types for factor drill-down

export interface InspectionRecord {
  date: string
  passed: boolean
  remarks: string | null
}

export interface ServiceRecord {
  date: string
  workshop: string | null
  type: string
  mileageAtService: number | null
}

export interface OwnerRecord {
  from: string
  to: string | null
  isCompany: boolean
  region: string | null
}

export interface InsuranceIncidentRecord {
  date: string
  type: string
  severity: string
}

export interface RecallRecord {
  date: string
  description: string
  resolved: boolean
}

export interface DebtRecord {
  type: string
  amountSek: number
  date: string
}

export interface MileageReadingRecord {
  date: string
  mileage: number
  source: string
}

export interface MarketComparisonRecord {
  model: string
  year: number
  priceSek: number
}

export interface AnalysisDetails {
  inspections: InspectionRecord[]
  services: ServiceRecord[]
  owners: OwnerRecord[]
  insuranceIncidents: InsuranceIncidentRecord[]
  recalls: RecallRecord[]
  debts: DebtRecord[]
  hasPurchaseBlock: boolean
  euroClass: string | null
  co2EmissionsGPerKm: number | null
  annualTaxSek: number | null
  bonusMalusApplies: boolean | null
  marketValueSek: number | null
  averageMarketPriceSek: number | null
  depreciationRatePercent: number | null
  similarCars: MarketComparisonRecord[]
  reliabilityRating: number | null
  knownIssues: string[]
  averageRepairCostSek: number | null
  theftRiskCategory: string | null
  euroNcapRating: number | null
  hasAlarmSystem: boolean | null
  securityFeatures: string[]
  firstRegistrationDate: string | null
  isImported: boolean | null
  mileageHistory: MileageReadingRecord[]
}
