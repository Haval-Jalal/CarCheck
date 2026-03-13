import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Car, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authApi } from '@/api/auth.api'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    if (!token) {
      setStatus('error')
      setErrorMessage('Ingen verifieringslänk hittades.')
      return
    }

    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        const msg = err?.response?.data?.error ?? 'Ogiltig eller utgången verifieringslänk.'
        setErrorMessage(msg)
        setStatus('error')
      })
  }, [token])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">

        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-blue-400" />
          <span className="text-base font-bold">CarCheck</span>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="text-sm text-muted-foreground">Verifierar din e-postadress…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">E-posten verifierad!</h1>
              <p className="text-sm text-muted-foreground">
                Ditt konto är aktiverat och du har fått <strong>1 gratis sökning</strong>. Logga in för att komma igång.
              </p>
            </div>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-500">
              <Link to="/login">Logga in</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Verifiering misslyckades</h1>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Gå till inloggning</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
