import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'
import { getScoreColor } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FactorDetailContent } from './factor-detail-content'
import type { AnalysisBreakdown, AnalysisDetails } from '@/types/car.types'

type FactorKey = keyof AnalysisBreakdown

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  factorKey: FactorKey | null
  factorLabel: string
  score: number
  details: AnalysisDetails | null
  year: number
}

export function FactorDetailSheet({
  open,
  onOpenChange,
  factorKey,
  factorLabel,
  score,
  details,
  year,
}: Props) {
  const rounded = Math.round(score)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{factorLabel}</SheetTitle>
          <SheetDescription>
            <span className={cn('text-lg font-bold', getScoreColor(rounded))}>{rounded}</span>
            <span className="text-muted-foreground"> / 100</span>
          </SheetDescription>
          <Progress value={rounded} className="h-2" />
        </SheetHeader>
        <div className="mt-6">
          {factorKey && details ? (
            <FactorDetailContent factorKey={factorKey} details={details} year={year} />
          ) : (
            <p className="text-sm text-muted-foreground">Ingen detaljdata tillgänglig.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
