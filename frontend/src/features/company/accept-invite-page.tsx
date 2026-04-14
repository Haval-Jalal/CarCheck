import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Car, CheckCircle, XCircle, Loader2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAcceptInvite } from '@/hooks/use-company'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const acceptInvite = useAcceptInvite()
  const [status, setStatus] = useState<'accepting' | 'success' | 'error'>('accepting')
  const [errorMessage, setErrorMessage] = useState('')
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    if (!token) {
      setStatus('error')
      setErrorMessage('Inbjudningslänken är ogiltig eller saknar token.')
      return
    }

    acceptInvite.mutate(token, {
      onSuccess: () => {
        setStatus('success')
        toast.success('Du har gått med i företaget!')
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<ApiError>
        setErrorMessage(
          axiosErr.response?.data?.error ?? 'Inbjudan är ogiltig eller har gått ut.'
        )
        setStatus('error')
      },
    })
  }, [token])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">

        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-blue-400" />
          <span className="text-base font-bold">CarCheck</span>
        </div>

        {status === 'accepting' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="text-sm text-muted-foreground">Hanterar inbjudan…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Välkommen till företaget!</h1>
              <p className="text-sm text-muted-foreground">
                Du har nu tillgång till företagets CarCheck-konto och dess prenumeration.
              </p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => navigate('/dashboard')}>
              Gå till dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/company/admin')}>
              <Building2 className="mr-2 h-4 w-4" />
              Visa företagssidan
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Inbjudan ogiltig</h1>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
              Gå till dashboard
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
