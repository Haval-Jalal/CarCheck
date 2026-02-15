import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, CheckCircle2, XCircle, Star } from 'lucide-react'
import { formatDate, formatSek, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AnalysisDetails, AnalysisBreakdown } from '@/types/car.types'

type FactorKey = keyof AnalysisBreakdown

interface Props {
  factorKey: FactorKey
  details: AnalysisDetails
  year: number
}

export function FactorDetailContent({ factorKey, details, year }: Props) {
  switch (factorKey) {
    case 'inspectionScore':
      return <InspectionDetail inspections={details.inspections} />
    case 'serviceHistoryScore':
      return <ServiceDetail services={details.services} />
    case 'ownerHistoryScore':
      return <OwnerDetail owners={details.owners} />
    case 'insuranceScore':
      return <InsuranceDetail incidents={details.insuranceIncidents} />
    case 'recallScore':
      return <RecallDetail recalls={details.recalls} />
    case 'debtFinanceScore':
      return <DebtDetail debts={details.debts} hasPurchaseBlock={details.hasPurchaseBlock} />
    case 'environmentScore':
      return (
        <EnvironmentDetail
          euroClass={details.euroClass}
          co2={details.co2EmissionsGPerKm}
          annualTax={details.annualTaxSek}
          bonusMalus={details.bonusMalusApplies}
        />
      )
    case 'marketValueScore':
      return (
        <MarketDetail
          marketValue={details.marketValueSek}
          avgPrice={details.averageMarketPriceSek}
          depreciation={details.depreciationRatePercent}
          similarCars={details.similarCars}
        />
      )
    case 'drivetrainScore':
      return (
        <DrivetrainDetail
          reliability={details.reliabilityRating}
          knownIssues={details.knownIssues}
          avgRepairCost={details.averageRepairCostSek}
        />
      )
    case 'theftSecurityScore':
      return (
        <SecurityDetail
          theftRisk={details.theftRiskCategory}
          ncapRating={details.euroNcapRating}
          hasAlarm={details.hasAlarmSystem}
          features={details.securityFeatures}
        />
      )
    case 'ageScore':
      return (
        <AgeDetail
          year={year}
          firstRegistration={details.firstRegistrationDate}
          isImported={details.isImported}
        />
      )
    case 'mileageScore':
      return <MileageDetail readings={details.mileageHistory} />
    default:
      return <p className="text-sm text-muted-foreground">Ingen detaljdata tillgänglig.</p>
  }
}

// ─── Besiktning ───

function InspectionDetail({ inspections }: { inspections: AnalysisDetails['inspections'] }) {
  if (inspections.length === 0) {
    return <EmptyState text="Ingen besiktningshistorik tillgänglig." />
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Resultat</TableHead>
          <TableHead>Anmärkningar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspections.map((i, idx) => (
          <TableRow key={idx}>
            <TableCell>{formatDate(i.date)}</TableCell>
            <TableCell>
              <Badge variant={i.passed ? 'default' : 'destructive'} className={i.passed ? 'bg-green-100 text-green-700' : ''}>
                {i.passed ? 'Godkänd' : 'Underkänd'}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{i.remarks ?? '–'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ─── Servicehistorik ───

function ServiceDetail({ services }: { services: AnalysisDetails['services'] }) {
  if (services.length === 0) {
    return <EmptyState text="Ingen servicehistorik tillgänglig." />
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Verkstad</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead className="text-right">Miltal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((s, idx) => (
          <TableRow key={idx}>
            <TableCell>{formatDate(s.date)}</TableCell>
            <TableCell>{s.workshop ?? '–'}</TableCell>
            <TableCell>{s.type}</TableCell>
            <TableCell className="text-right">
              {s.mileageAtService != null ? `${formatNumber(s.mileageAtService)} km` : '–'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ─── Ägarhistorik ───

function OwnerDetail({ owners }: { owners: AnalysisDetails['owners'] }) {
  if (owners.length === 0) {
    return <EmptyState text="Ingen ägarhistorik tillgänglig." />
  }
  return (
    <div className="space-y-3">
      {owners.map((o, idx) => (
        <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {idx + 1}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{o.isCompany ? 'Företag' : 'Privat'}</Badge>
              {o.region && <span className="text-sm text-muted-foreground">{o.region}</span>}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(o.from)} — {o.to ? formatDate(o.to) : 'Nuvarande'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Försäkring ───

function InsuranceDetail({ incidents }: { incidents: AnalysisDetails['insuranceIncidents'] }) {
  if (incidents.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <p className="text-sm font-medium text-green-700">Inga försäkringsskador registrerade.</p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Allvarlighet</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.map((i, idx) => (
          <TableRow key={idx}>
            <TableCell>{formatDate(i.date)}</TableCell>
            <TableCell>{i.type}</TableCell>
            <TableCell>
              <Badge variant={i.severity === 'Allvarlig' ? 'destructive' : 'outline'}>
                {i.severity}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ─── Återkallelser ───

function RecallDetail({ recalls }: { recalls: AnalysisDetails['recalls'] }) {
  if (recalls.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <p className="text-sm font-medium text-green-700">Inga återkallelser registrerade.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {recalls.map((r, idx) => (
        <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
          {r.resolved ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          )}
          <div className="space-y-1">
            <p className="text-sm">{r.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>
              <Badge variant={r.resolved ? 'default' : 'destructive'} className={r.resolved ? 'bg-green-100 text-green-700' : ''}>
                {r.resolved ? 'Åtgärdad' : 'Ej åtgärdad'}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Skuld & ekonomi ───

function DebtDetail({ debts, hasPurchaseBlock }: { debts: AnalysisDetails['debts']; hasPurchaseBlock: boolean }) {
  return (
    <div className="space-y-4">
      {hasPurchaseBlock && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Fordonet har en aktiv köpspärr hos Kronofogden.
          </AlertDescription>
        </Alert>
      )}
      {debts.length === 0 ? (
        !hasPurchaseBlock && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700">Inga skulder registrerade.</p>
          </div>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Typ</TableHead>
              <TableHead className="text-right">Belopp</TableHead>
              <TableHead>Datum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((d, idx) => (
              <TableRow key={idx}>
                <TableCell>{d.type}</TableCell>
                <TableCell className="text-right">{formatSek(d.amountSek)}</TableCell>
                <TableCell>{formatDate(d.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

// ─── Miljö & skatt ───

function EnvironmentDetail({
  euroClass,
  co2,
  annualTax,
  bonusMalus,
}: {
  euroClass: string | null
  co2: number | null
  annualTax: number | null
  bonusMalus: boolean | null
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <KeyValue label="Euroklass" value={euroClass ?? '–'} />
      <KeyValue label="CO₂-utsläpp" value={co2 != null ? `${co2} g/km` : '–'} />
      <KeyValue label="Årlig fordonsskatt" value={annualTax != null ? formatSek(annualTax) : '–'} />
      <KeyValue label="Bonus/Malus" value={bonusMalus == null ? '–' : bonusMalus ? 'Ja' : 'Nej'} />
    </div>
  )
}

// ─── Marknadsvärde ───

function MarketDetail({
  marketValue,
  avgPrice,
  depreciation,
  similarCars,
}: {
  marketValue: number | null
  avgPrice: number | null
  depreciation: number | null
  similarCars: AnalysisDetails['similarCars']
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <KeyValue label="Uppskattat marknadsvärde" value={marketValue != null ? formatSek(marketValue) : '–'} />
        <KeyValue label="Genomsnittspris" value={avgPrice != null ? formatSek(avgPrice) : '–'} />
        <KeyValue
          label="Värdeminskning"
          value={depreciation != null ? `${depreciation.toFixed(1)}%` : '–'}
        />
      </div>

      {similarCars.length > 0 && (
        <>
          <Separator />
          <h4 className="text-sm font-medium">Liknande bilar på marknaden</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modell</TableHead>
                <TableHead>Årsmodell</TableHead>
                <TableHead className="text-right">Pris</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {similarCars.map((c, idx) => (
                <TableRow key={idx}>
                  <TableCell>{c.model}</TableCell>
                  <TableCell>{c.year}</TableCell>
                  <TableCell className="text-right">{formatSek(c.priceSek)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}

// ─── Drivlina & tillförlitlighet ───

function DrivetrainDetail({
  reliability,
  knownIssues,
  avgRepairCost,
}: {
  reliability: number | null
  knownIssues: string[]
  avgRepairCost: number | null
}) {
  return (
    <div className="space-y-4">
      {reliability != null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Tillförlitlighet</span>
            <span>{reliability.toFixed(1)} / 10</span>
          </div>
          <Progress value={reliability * 10} className="h-2" />
        </div>
      )}

      <KeyValue label="Genomsnittlig reparationskostnad" value={avgRepairCost != null ? formatSek(avgRepairCost) : '–'} />

      {knownIssues.length > 0 && (
        <>
          <Separator />
          <h4 className="text-sm font-medium">Kända problem</h4>
          <ul className="space-y-1">
            {knownIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
                {issue}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ─── Stöld & säkerhet ───

function SecurityDetail({
  theftRisk,
  ncapRating,
  hasAlarm,
  features,
}: {
  theftRisk: string | null
  ncapRating: number | null
  hasAlarm: boolean | null
  features: string[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <KeyValue
          label="Stöldrisk"
          value={
            theftRisk ? (
              <Badge
                variant="outline"
                className={cn(
                  theftRisk === 'Låg' && 'border-green-300 text-green-700',
                  theftRisk === 'Medel' && 'border-yellow-300 text-yellow-700',
                  theftRisk === 'Hög' && 'border-red-300 text-red-700'
                )}
              >
                {theftRisk}
              </Badge>
            ) : (
              '–'
            )
          }
        />
        <KeyValue
          label="Euro NCAP"
          value={
            ncapRating != null ? (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < ncapRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </span>
            ) : (
              '–'
            )
          }
        />
        <KeyValue
          label="Larmsystem"
          value={hasAlarm == null ? '–' : hasAlarm ? 'Ja' : 'Nej'}
        />
      </div>

      {features.length > 0 && (
        <>
          <Separator />
          <h4 className="text-sm font-medium">Säkerhetsutrustning</h4>
          <div className="flex flex-wrap gap-2">
            {features.map((f, idx) => (
              <Badge key={idx} variant="secondary">
                {f}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Ålder ───

function AgeDetail({
  year,
  firstRegistration,
  isImported,
}: {
  year: number
  firstRegistration: string | null
  isImported: boolean | null
}) {
  const currentYear = new Date().getFullYear()
  const age = currentYear - year

  return (
    <div className="grid grid-cols-2 gap-4">
      <KeyValue label="Årsmodell" value={String(year)} />
      <KeyValue label="Ålder" value={`${age} år`} />
      <KeyValue
        label="Första registrering"
        value={firstRegistration ? formatDate(firstRegistration) : '–'}
      />
      <KeyValue
        label="Importerad"
        value={isImported == null ? '–' : isImported ? 'Ja' : 'Nej'}
      />
    </div>
  )
}

// ─── Miltal ───

function MileageDetail({ readings }: { readings: AnalysisDetails['mileageHistory'] }) {
  if (readings.length === 0) {
    return <EmptyState text="Ingen miltalshistorik tillgänglig." />
  }

  // Sort by date ascending
  const sorted = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead className="text-right">Miltal</TableHead>
            <TableHead>Källa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r, idx) => {
            const prevMileage = idx > 0 ? sorted[idx - 1].mileage : null
            const isSuspicious = prevMileage !== null && r.mileage < prevMileage
            return (
              <TableRow
                key={idx}
                className={cn(isSuspicious && 'bg-red-50')}
              >
                <TableCell>{formatDate(r.date)}</TableCell>
                <TableCell className={cn('text-right', isSuspicious && 'font-bold text-red-600')}>
                  {formatNumber(r.mileage)} km
                  {isSuspicious && (
                    <AlertTriangle className="ml-1 inline h-3.5 w-3.5 text-red-500" />
                  )}
                </TableCell>
                <TableCell>{r.source}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {sorted.some((r, idx) => idx > 0 && r.mileage < sorted[idx - 1].mileage) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Miltalet har minskat mellan avläsningar — detta kan tyda på manipulation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// ─── Helpers ───

function EmptyState({ text }: { text: string }) {
  return <p className="py-4 text-center text-sm text-muted-foreground">{text}</p>
}

function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
