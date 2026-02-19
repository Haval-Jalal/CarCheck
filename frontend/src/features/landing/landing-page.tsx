import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Car, Search, Sun, Moon, Shield, BarChart3, History } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [regNumber, setRegNumber] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/register')
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">

      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex h-16 items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-2 text-base font-bold tracking-tight">
          <Car className="h-5 w-5 text-blue-400" />
          CarCheck
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Växla tema"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Logga in
          </Link>
          <Link
            to="/register"
            className="ml-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Skapa konto
          </Link>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-8 md:px-10">
        <div className="w-full max-w-2xl text-center">

          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-400 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Din guide till ett tryggt bilköp
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Vet vad du köper
            <span className="block text-blue-400">innan du betalar.</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-lg text-base text-slate-400 sm:text-lg">
            Ange registreringsnumret på vilken begagnad bil som helst och få en
            datadriven rekommendation — baserad på besiktning, miltal, försäkring
            och 9 andra faktorer.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto mb-8 max-w-lg">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/40 transition focus-within:border-blue-500">
              <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600/20">
                <Car className="h-4 w-4 text-blue-400" />
              </div>
              <input
                value={regNumber}
                onChange={e => setRegNumber(e.target.value.toUpperCase())}
                placeholder="ABC 123"
                maxLength={10}
                autoFocus
                className="flex-1 bg-transparent py-2 text-center text-2xl font-black tracking-[0.3em] text-white outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-600 sm:text-3xl"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-95"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Sök</span>
              </button>
            </div>
          </form>

          {/* Trust row */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 sm:gap-6">
            <span>10 000+ analyser genomförda</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>12 kontrollfaktorer</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>Kostnadsfritt att prova</span>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: <Shield className="h-3.5 w-3.5" />, label: 'Köp · Avvakta · Undvik' },
              { icon: <BarChart3 className="h-3.5 w-3.5" />, label: 'Poäng 0–100 per bil' },
              { icon: <History className="h-3.5 w-3.5" />, label: 'Sparas i din historik' },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                {icon}
                {label}
              </span>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="mx-auto mt-8 max-w-md text-xs leading-relaxed text-slate-600">
            CarCheck tillhandahåller information baserad på officiellt registrerade uppgifter.
            Vi friskriver oss från ansvar för fordonets faktiska skick vid köptillfället.
          </p>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 flex items-center justify-between px-6 py-4 text-xs text-slate-700 md:px-10">
        <div className="flex items-center gap-1.5 font-medium">
          <Car className="h-3.5 w-3.5" />
          CarCheck
        </div>
        <p>&copy; {new Date().getFullYear()} CarCheck. Alla rättigheter förbehållna.</p>
      </footer>
    </div>
  )
}
