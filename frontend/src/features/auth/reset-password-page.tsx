import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authApi } from '@/api/auth.api'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validators'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-4">
          <Alert variant="destructive">
            <AlertDescription>Ogiltig återställningslänk. Begär en ny.</AlertDescription>
          </Alert>
          <Link
            to="/forgot-password"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Begär ny länk
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword })
      setDone(true)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      setError(axiosError.response?.data?.error || 'Något gick fel. Försök igen eller begär en ny länk.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-blue-400" />
          <span className="text-base font-bold">CarCheck</span>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Lösenordet återställt</h1>
              <p className="text-sm text-muted-foreground">
                Du kan nu logga in med ditt nya lösenord.
              </p>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-500"
              onClick={() => navigate('/login')}
            >
              Logga in
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Skapa nytt lösenord</h1>
              <p className="text-sm text-muted-foreground">
                Välj ett nytt lösenord på minst 8 tecken.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nytt lösenord</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sparar...' : 'Spara nytt lösenord'}
              </Button>
            </form>

            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka till inloggning
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
