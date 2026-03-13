import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, Shield, BarChart3, Lightbulb, ChevronRight, Search, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { authApi } from '@/api/auth.api'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import type { AxiosError } from 'axios'

const FEATURES = [
  { icon: <Shield className="h-4 w-4 text-green-400" />, text: 'Se vad säljaren inte berättar — skulder, köpspärr och återkallelser' },
  { icon: <BarChart3 className="h-4 w-4 text-blue-400" />, text: 'Ta reda på om priset är rimligt innan du ens frågar' },
  { icon: <Lightbulb className="h-4 w-4 text-yellow-400" />, text: 'Gå till visningen förberedd — med rätt frågor och förhandlingsargument' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendSent, setResendSent] = useState(false)

  const fromState = (location.state as { from?: { pathname: string } })?.from?.pathname
  const fromQuery = new URLSearchParams(location.search).get('from')
  const from = fromState || (fromQuery ? decodeURIComponent(fromQuery) : '/dashboard')
  const regNumber = (location.state as { regNumber?: string })?.regNumber

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setUnverifiedEmail(null)
    setResendSent(false)
    setIsSubmitting(true)
    try {
      await login(data)
      if (regNumber) {
        navigate('/dashboard', { replace: true, state: { pendingSearch: regNumber } })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string; code?: string }>
      const code = axiosError.response?.data?.code
      if (code === 'email_not_verified') {
        setUnverifiedEmail(data.email)
        setError(null)
      } else {
        setError(axiosError.response?.data?.error || 'Inloggningen misslyckades. Försök igen.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!unverifiedEmail) return
    try {
      await authApi.resendVerification(unverifiedEmail)
      setResendSent(true)
    } catch {
      // fail silently — backend always returns 200
    }
  }

  const formattedReg = regNumber
    ? regNumber.replace(/^([A-Za-z]{3})(\d{3})$/, '$1 $2').toUpperCase()
    : null

  return (
    <div className="flex min-h-screen">

      {/* ── Vänster panel — branding ── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between bg-slate-950 px-12 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2 text-white">
          <Car className="h-5 w-5 text-blue-400" />
          <span className="text-base font-bold tracking-tight">CarCheck</span>
        </div>

        {/* Mitten-innehåll */}
        <div className="space-y-8">
          {/* Reg-kontextkort */}
          {formattedReg && (
            <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 backdrop-blur">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-blue-300/70">Du söker på</p>
                <p className="text-xl font-black tracking-[0.2em] text-white">{formattedReg}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Vad du får tillgång till
            </p>
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                  {f.icon}
                </div>
                <p className="text-sm text-slate-300">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold leading-snug text-white">
              Säljarens hemligheter
              <span className="block text-blue-400">avslöjas på sekunder.</span>
            </h2>
            <p className="text-sm text-slate-500">
              Tiotusentals kronor kan stå på spel. CarCheck ger dig svaret innan du bestämmer dig.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-700">
          &copy; {new Date().getFullYear()} CarCheck. Alla rättigheter förbehållna.
        </p>
      </div>

      {/* ── Höger panel — formulär ── */}
      <div className="flex w-full flex-col justify-center bg-background px-4 py-8 sm:px-6 sm:py-12 lg:w-[45%] lg:px-16">
        <div className="mx-auto w-full max-w-sm space-y-8">

          {/* Mobil-logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Car className="h-5 w-5 text-blue-400" />
            <span className="text-base font-bold">CarCheck</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Logga in</h1>
            {formattedReg ? (
              <p className="text-sm text-muted-foreground">
                för att se analysen av{' '}
                <span className="font-semibold text-foreground">{formattedReg}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ange din e-post och ditt lösenord
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {unverifiedEmail && (
              <Alert>
                <AlertDescription className="space-y-2">
                  <p>Du behöver verifiera din e-postadress innan du kan logga in. Kolla din inkorg.</p>
                  {resendSent ? (
                    <p className="text-sm font-medium text-green-600">En ny verifieringslänk har skickats!</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-sm font-medium underline hover:no-underline"
                    >
                      Skicka ny verifieringslänk
                    </button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="namn@exempel.se"
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
                <Label htmlFor="password">Lösenord</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Glömt lösenord?
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
                  aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
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
              {isSubmitting ? 'Loggar in...' : 'Logga in'}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-3">Har du inget konto?</span>
            </div>
          </div>

          {/* Skapa konto — prominent */}
          <Link
            to="/register"
            state={regNumber ? { regNumber } : undefined}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 group"
          >
            <div>
              <p className="font-semibold">Skapa konto — det är gratis</p>
              <p className="text-xs text-muted-foreground mt-0.5">Kom igång på under en minut</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}
