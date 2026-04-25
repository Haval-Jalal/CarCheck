import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Car, Shield, BarChart3, Lightbulb, ChevronRight, Search, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { useAuth } from '@/hooks/use-auth'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import type { AxiosError } from 'axios'

const FEATURE_ICONS = [
  <Shield className="h-4 w-4 text-green-400" />,
  <BarChart3 className="h-4 w-4 text-blue-400" />,
  <Lightbulb className="h-4 w-4 text-yellow-400" />,
]

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fromState = (location.state as { from?: { pathname: string } })?.from?.pathname
  const fromQuery = new URLSearchParams(location.search).get('from')
  const from = fromState || fromQuery || '/dashboard'
  const regNumber = (location.state as { regNumber?: string })?.regNumber
  const fromParam = fromQuery ? `?from=${encodeURIComponent(fromQuery)}` : ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data)
      if (regNumber) {
        navigate('/dashboard', { replace: true, state: { pendingSearch: regNumber } })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>
      setError(axiosError.response?.data?.error || t('auth.login.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedReg = regNumber
    ? regNumber.replace(/^([A-Za-z]{3})(\d{3})$/, '$1 $2').toUpperCase()
    : null

  const features = t('auth.login.features', { returnObjects: true }) as string[]

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between bg-slate-950 px-12 py-10">
        {/* Logo + language switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Car className="h-5 w-5 text-blue-400" />
            <span className="text-base font-bold tracking-tight">CarCheck</span>
          </div>
          <LanguageSwitcher variant="dark" />
        </div>

        {/* Center content */}
        <div className="space-y-8">
          {/* Reg context card */}
          {formattedReg && (
            <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 backdrop-blur">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-blue-300/70">{t('auth.login.searching')}</p>
                <p className="text-xl font-black tracking-[0.2em] text-white">{formattedReg}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {t('auth.login.whatYouGet')}
            </p>
            {features.map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                  {FEATURE_ICONS[i]}
                </div>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold leading-snug text-white">
              {t('auth.login.tagline')}
              <span className="block text-blue-400">{t('auth.login.taglineBlue')}</span>
            </h2>
            <p className="text-sm text-slate-500">{t('auth.login.taglineSub')}</p>
          </div>
        </div>

        <p className="text-xs text-slate-700">
          &copy; {new Date().getFullYear()} CarCheck.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex w-full flex-col justify-center bg-background px-4 py-8 sm:px-6 sm:py-12 lg:w-[45%] lg:px-16">
        <div className="mx-auto w-full max-w-sm space-y-8">

          {/* Mobile header */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-400" />
              <span className="text-base font-bold">CarCheck</span>
            </div>
            <LanguageSwitcher variant="light" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
            {formattedReg ? (
              <p className="text-sm text-muted-foreground">
                {t('auth.login.subtitleReg')}{' '}
                <span className="font-semibold text-foreground">{formattedReg}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{t('auth.login.subtitle')}</p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.emailPlaceholder')}
                autoComplete="email"
                autoFocus
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.login.password')}</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-3">{t('auth.login.noAccount')}</span>
            </div>
          </div>

          <Link
            to={`/register${fromParam}`}
            state={regNumber ? { regNumber } : undefined}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 group"
          >
            <div>
              <p className="font-semibold">{t('auth.login.createAccount')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('auth.login.createAccountSub')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}
