import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { carSearchSchema, type CarSearchFormData } from '@/lib/validators'

interface SearchFormProps {
  onSearch: (regNumber: string) => void
  isLoading: boolean
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarSearchFormData>({
    resolver: zodResolver(carSearchSchema),
  })

  const onSubmit = (data: CarSearchFormData) => {
    onSearch(data.registrationNumber.toUpperCase().replace(/\s/g, ''))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="regNumber">Registreringsnummer</Label>
        <Input
          id="regNumber"
          placeholder="ABC 123"
          autoComplete="off"
          className="uppercase"
          {...register('registrationNumber')}
        />
        {errors.registrationNumber && (
          <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading} className="sm:w-auto">
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Söker...' : 'Sök'}
      </Button>
    </form>
  )
}
