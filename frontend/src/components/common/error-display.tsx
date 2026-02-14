import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

interface ErrorDisplayProps {
  error: Error | AxiosError<ApiError> | null
  title?: string
}

export function ErrorDisplay({ error, title = 'Fel' }: ErrorDisplayProps) {
  if (!error) return null

  const axiosError = error as AxiosError<ApiError>
  const message =
    axiosError.response?.data?.error || error.message || 'Ett oväntat fel uppstod.'

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
