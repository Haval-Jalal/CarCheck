import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, Lock, Zap, Trophy, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { registerSchema, type RegisterFormData } from '@/lib/validators'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

const BENEFITS = [
  { icon: <Zap className="h-4 w-4 text-yellow-400" />, text: 'Få svar på sekunder — skulder, återkallelser och köpspärr direkt' },
  { icon: <Trophy className="h-4 w-4 text-blue-400" />, text: 'Förhandla med fakta — se om priset är rimligt mot marknaden' },
  { icon: <Lock className="h-4 w-4 text-green-400" />, text: 'Gratis att komma igång — inga dolda avgifter, inget kort krävs' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const regNumber = (location.state as { regNumber?: string })?.regNumber

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await registerUser({ email: data.email, password: data.password })
      navigate('/login', { state: { registered: true, regNumber } })
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      setError(axiosError.response?.data?.error || 'Registreringen misslyckades. Försök igen.')
    } finally {
      setIsSubmitting(false)
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
              Varför CarCheck?
            </p>
            {BENEFITS.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                  {b.icon}
                </div>
                <p className="text-sm text-slate-300">{b.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold leading-snug text-white">
              Ta kontroll
              <span className="block text-blue-400">innan du köper.</span>
            </h2>
            <p className="text-sm text-slate-500">
              Tiotusentals kronor kan stå på spel. Skapa ett konto och se vad säljaren inte berättar.
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
            <h1 className="text-2xl font-bold">Skapa konto</h1>
            {formattedReg ? (
              <p className="text-sm text-muted-foreground">
                för att se analysen av{' '}
                <span className="font-semibold text-foreground">{formattedReg}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Kom igång gratis — inga kortuppgifter krävs
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
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
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
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
              {isSubmitting ? 'Skapar konto...' : 'Skapa konto gratis'}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-3">Har du redan ett konto?</span>
            </div>
          </div>

          {/* Logga in — prominent */}
          <Link
            to="/login"
            state={regNumber ? { regNumber } : undefined}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 group"
          >
            <div>
              <p className="font-semibold">Logga in på ditt konto</p>
              <p className="text-xs text-muted-foreground mt-0.5">Fortsätt där du slutade</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}
