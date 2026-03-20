import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
            <AlertDescription>{t('auth.resetPassword.invalidToken')}</AlertDescription>
          </Alert>
          <Link
            to="/forgot-password"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.resetPassword.requestNew')}
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
      setError(axiosError.response?.data?.error || t('auth.resetPassword.failed'))
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
              <h1 className="text-2xl font-bold">{t('auth.resetPassword.successTitle')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('auth.resetPassword.successSubtitle')}
              </p>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-500"
              onClick={() => navigate('/login')}
            >
              {t('auth.login.submit')}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{t('auth.resetPassword.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('auth.resetPassword.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('auth.resetPassword.password')}</Label>
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
                <Label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPassword')}</Label>
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
                {isSubmitting ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submit')}
              </Button>
            </form>

            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
