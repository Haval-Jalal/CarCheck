import { useParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Printer, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useCarAnalysis } from '@/hooks/use-car-analysis'
import { getScoreColor } from '@/lib/format'
import { NegotiationTips } from '../car/components/negotiation-tips'
import { InspectionChecklist } from '../car/components/inspection-checklist'
import { cn } from '@/lib/utils'

function recommendationVariant(rec: string) {
  if (rec.toLowerCase().includes('köp') || rec.toLowerCase().includes('rekommendera')) return 'bg-green-600'
  if (rec.toLowerCase().includes('avvakta')) return 'bg-yellow-600'
  return 'bg-red-600'
}

function FactorRow({ name, score }: { name: string; score: number }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 45 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0 print:py-1">
      <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{name}</span>
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden shrink-0">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums w-8 text-right shrink-0">{Math.round(score)}</span>
    </div>
  )
}

export function BusinessReportPage() {
  const { carId } = useParams<{ carId: string }>()
  const { data: analysis, isLoading, error } = useCarAnalysis(carId!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center p-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-lg font-semibold">Rapporten kunde inte laddas</p>
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tillbaka
          </Button>
        </Link>
      </div>
    )
  }

  const { brand, model, year, mileage, registrationNumber, score, recommendation, breakdown } = analysis
  const allFactors: { name: string; score: number }[] = [
    { name: 'Ålder', score: breakdown.ageScore },
    { name: 'Miltal', score: breakdown.mileageScore },
    { name: 'Besiktning', score: breakdown.inspectionScore },
    { name: 'Skulder & finans', score: breakdown.debtFinanceScore },
    { name: 'Marknadsvärde', score: breakdown.marketValueScore },
    { name: 'Miljö & skatt', score: breakdown.environmentScore },
    { name: 'Försäkring', score: breakdown.insuranceScore },
    { name: 'Servicehistorik', score: breakdown.serviceHistoryScore },
    { name: 'Ägarhistorik', score: breakdown.ownerHistoryScore },
    { name: 'Drivlina', score: breakdown.drivetrainScore },
    { name: 'Återkallelser', score: breakdown.recallScore },
    { name: 'Stöld & säkerhet', score: breakdown.theftSecurityScore },
  ]

  return (
    <div className="bg-white min-h-screen text-gray-900">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tillbaka
          </Button>
        </Link>
        <span className="text-sm text-gray-500 flex-1">
          {registrationNumber} — {brand} {model}
        </span>
        <Button
          size="sm"
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Printer className="h-4 w-4 mr-1.5" />
          Skriv ut / Spara PDF
        </Button>
      </div>

      {/* A4 report body */}
      <div className="max-w-[800px] mx-auto px-8 py-10 print:px-12 print:py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-800">
          <div>
            <div className="text-2xl font-black tracking-tight text-gray-900">CarCheck</div>
            <div className="text-xs text-gray-500 mt-0.5">carcheck.se — Professionell fordonsanalys</div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>Rapport genererad</div>
            <div className="font-semibold text-gray-700">
              {new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Car identity */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-3xl font-black">{brand} {model}</h1>
            <span className="text-xl text-gray-500">{year}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="font-mono font-bold text-base text-gray-900">{registrationNumber}</span>
            {mileage > 0 && (
              <span>{mileage.toLocaleString('sv-SE')} mil</span>
            )}
            {analysis.fuelType && <span>{analysis.fuelType}</span>}
            {analysis.horsePower && <span>{analysis.horsePower} hk</span>}
            {analysis.color && <span>{analysis.color}</span>}
          </div>
        </div>

        {/* Score + Recommendation */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-5 text-center">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Totalpoäng</div>
            <div className={cn('text-6xl font-black tabular-nums', getScoreColor(score))}>
              {Math.round(score)}
            </div>
            <div className="text-sm text-gray-500 mt-1">av 100</div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', score >= 70 ? 'bg-green-500' : score >= 45 ? 'bg-yellow-500' : 'bg-red-500')}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-5 flex flex-col justify-center">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Rekommendation</div>
            <Badge className={cn('text-white text-sm font-semibold px-3 py-1 self-start', recommendationVariant(recommendation))}>
              {recommendation}
            </Badge>
          </div>
        </div>

        {/* 12-factor breakdown */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Faktorer (12 kontrollpunkter)</h2>
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              {allFactors.slice(0, Math.ceil(allFactors.length / 2)).map(f => (
                <FactorRow key={f.name} name={f.name} score={f.score} />
              ))}
            </div>
            <div>
              {allFactors.slice(Math.ceil(allFactors.length / 2)).map(f => (
                <FactorRow key={f.name} name={f.name} score={f.score} />
              ))}
            </div>
          </div>
        </div>

        {/* Negotiation tips */}
        <div className="mb-8 print:break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Förhandlingstips</h2>
          <NegotiationTips breakdown={analysis.breakdown} details={analysis.details} />
        </div>

        {/* Inspection checklist */}
        <div className="print:break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Besiktningschecklista</h2>
          <InspectionChecklist breakdown={analysis.breakdown} details={analysis.details} />
        </div>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
          <span>© {new Date().getFullYear()} CarCheck — carcheck.se</span>
          <span>Analysen baseras på registrerade uppgifter och är inte en garanti för fordonets skick</span>
        </div>
      </div>
    </div>
  )
}
