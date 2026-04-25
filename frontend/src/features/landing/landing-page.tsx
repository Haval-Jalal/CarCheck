import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Car, Search, Sun, Moon, ArrowRight, ShieldCheck, BarChart3, Clock, Camera, Building2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/use-theme'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { PlateScanner } from '@/components/common/plate-scanner'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [regNumber, setRegNumber] = useState('')
  const [regError, setRegError] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const hasCamera = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const reg = regNumber.trim().toUpperCase().replace(/\s/g, '')
    if (!/^[A-Z]{3}\d{3}$/.test(reg)) {
      setRegError(true)
      return
    }
    setRegError(false)
    navigate('/login', { state: { regNumber: reg } })
  }

  const isDark = theme === 'dark'

  return (
    <div className={`relative flex min-h-screen flex-col overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#080c18] text-white' : 'bg-[#f8f9fc] text-slate-900'}`}>

      {/* ── Background atmosphere ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary glow — blue */}
        <div className={`absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full blur-[160px] transition-opacity duration-500 ${isDark ? 'bg-blue-600/20 opacity-100' : 'bg-blue-400/15 opacity-100'}`} />
        {/* Secondary glow — violet */}
        <div className={`absolute top-20 -right-32 h-[500px] w-[500px] rounded-full blur-[130px] transition-opacity duration-500 ${isDark ? 'bg-violet-600/15 opacity-100' : 'bg-violet-400/10 opacity-100'}`} />
        {/* Bottom glow — indigo */}
        <div className={`absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full blur-[120px] transition-opacity duration-500 ${isDark ? 'bg-indigo-600/10 opacity-100' : 'bg-indigo-300/10 opacity-100'}`} />
        {/* Subtle grid pattern */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.04]'}`}
          style={{
            backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(to right, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex h-16 items-center justify-between px-6 md:px-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-600/10'}`}>
            <Car className="h-4 w-4 text-blue-500" />
          </div>
          <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            CarCheck
          </span>
        </div>

        {/* Right nav */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher variant={isDark ? 'dark' : 'light'} />

          <button
            onClick={toggleTheme}
            className={`rounded-xl p-2 transition-all duration-200 ${isDark ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-black/6 hover:text-slate-900'}`}
            aria-label={t('nav.toggleTheme')}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            to="/login"
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${isDark ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-600 hover:bg-black/6 hover:text-slate-900'}`}
          >
            {t('landing.login')}
          </Link>

          <Link
            to="/register"
            className="ml-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-[1.04] hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95"
          >
            {t('landing.register')}
          </Link>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-10">
        <div className="w-full max-w-2xl text-center">

          {/* Eyebrow badge */}
          <div className={`mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-300 ${
            isDark
              ? 'border border-white/10 bg-white/5 text-blue-300'
              : 'border border-blue-200 bg-blue-50 text-blue-700'
          }`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            {t('landing.eyebrow')}
          </div>

          {/* Headline */}
          <h1 className="mb-5 text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className={isDark ? 'text-white' : 'text-slate-900'}>
              {t('landing.headline')}{' '}
            </span>
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              {t('landing.headlineBlue')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`mx-auto mb-10 max-w-lg text-base leading-relaxed sm:text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('landing.subtitle')}
          </p>

          {showScanner && (
            <PlateScanner
              onDetected={(plate) => {
                setRegNumber(plate)
                setShowScanner(false)
                navigate('/login', { state: { regNumber: plate } })
              }}
              onClose={() => setShowScanner(false)}
            />
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto mb-3 max-w-lg">
            <div className={`group flex items-center gap-2 rounded-2xl p-2 shadow-2xl transition-all duration-300 ${
              isDark
                ? 'border border-white/10 bg-white/5 backdrop-blur-xl hover:border-blue-500/50 focus-within:border-blue-500/70 focus-within:bg-white/8'
                : 'border border-slate-200 bg-white shadow-slate-200/80 hover:border-blue-400/60 focus-within:border-blue-500/80'
            }`}>
              <div className="ml-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-600/30">
                <Car className="h-4.5 w-4.5 text-white" />
              </div>
              <input
                value={regNumber}
                onChange={e => { setRegNumber(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()); setRegError(false) }}
                placeholder={t('landing.searchPlaceholder')}
                maxLength={10}
                autoFocus
                className={`flex-1 bg-transparent py-2 text-center text-xl font-black tracking-[0.25em] outline-none sm:text-2xl sm:tracking-[0.3em] ${
                  isDark
                    ? 'text-white placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-600'
                    : 'text-slate-900 placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400'
                }`}
              />
              {hasCamera && (
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className={`flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 hover:scale-[1.04] active:scale-95 ${
                    isDark ? 'text-slate-400 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-black/6 hover:text-slate-700'
                  }`}
                  title="Skanna registreringsskylt"
                >
                  <Camera className="h-5 w-5" />
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/30 transition-all duration-200 hover:scale-[1.04] hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/40 active:scale-95"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">{t('landing.searchButton')}</span>
              </button>
            </div>
          </form>

          {regError && (
            <p className="mx-auto mb-4 max-w-lg text-sm font-medium text-red-500">
              {t('landing.regError')}
            </p>
          )}

          {/* Trust stats */}
          <div className={`mb-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1.5">
              <span className={`h-1 w-1 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-400'}`} />
              {t('landing.trust1')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-1 w-1 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-400'}`} />
              {t('landing.trust2')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-1 w-1 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-indigo-400'}`} />
              {t('landing.trust3')}
            </span>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                color: 'text-green-400',
                bg: isDark ? 'bg-green-500/10' : 'bg-green-50',
                border: isDark ? 'border-green-500/20' : 'border-green-200',
                label: t('landing.pill1'),
              },
              {
                icon: BarChart3,
                color: 'text-blue-400',
                bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
                border: isDark ? 'border-blue-500/20' : 'border-blue-200',
                label: t('landing.pill2'),
              },
              {
                icon: Clock,
                color: 'text-violet-400',
                bg: isDark ? 'bg-violet-500/10' : 'bg-violet-50',
                border: isDark ? 'border-violet-500/20' : 'border-violet-200',
                label: t('landing.pill3'),
              },
            ].map(({ icon: Icon, color, bg, border, label }) => (
              <div
                key={label}
                className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${bg} ${border} ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className="text-left">{label}</span>
                <ArrowRight className={`ml-auto h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className={`mx-auto mt-10 max-w-md text-xs leading-relaxed ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
            {t('landing.disclaimer')}
          </p>
        </div>
      </main>

      {/* ── För företag CTA ── */}
      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-16 md:px-10">
        <div className={`flex flex-col items-start justify-between gap-6 rounded-2xl border p-6 md:flex-row md:items-center transition-colors duration-300 ${isDark ? 'border-blue-800/60 bg-blue-950/30' : 'border-blue-200 bg-blue-50'}`}>
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>För företag</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Skapa ett företagskonto och bjud in hela teamet. Dela en prenumeration och hantera sökningar gemensamt.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            <Users className="h-4 w-4" />
            Kom igång
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`relative z-10 flex flex-wrap items-center justify-between gap-2 border-t px-6 py-4 text-xs md:px-10 transition-colors duration-300 ${isDark ? 'border-white/5 text-slate-700' : 'border-slate-200 text-slate-400'}`}>
        <div className="flex items-center gap-1.5 font-semibold">
          <Car className="h-3.5 w-3.5" />
          CarCheck
        </div>
        <div className="flex items-center gap-5">
          <Link
            to="/privacy"
            className={`transition-all duration-200 hover:underline ${isDark ? 'hover:text-slate-400' : 'hover:text-slate-700'}`}
          >
            {t('landing.privacy')}
          </Link>
          <Link
            to="/terms"
            className={`transition-all duration-200 hover:underline ${isDark ? 'hover:text-slate-400' : 'hover:text-slate-700'}`}
          >
            {t('landing.terms')}
          </Link>
          <span>&copy; {new Date().getFullYear()} CarCheck</span>
        </div>
      </footer>
    </div>
  )
}
