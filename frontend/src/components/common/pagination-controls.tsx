import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationControlsProps {
  page: number
  hasMore: boolean
  onPageChange: (page: number) => void
}

export function PaginationControls({ page, hasMore, onPageChange }: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Föregående
      </Button>
      <span className="px-3 text-sm text-muted-foreground">Sida {page}</span>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        Nästa
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
