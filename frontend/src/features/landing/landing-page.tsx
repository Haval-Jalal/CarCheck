import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Car,
  Search,
  BarChart3,
  Shield,
  Sun,
  Moon,
  History,
  Heart,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/hooks/use-theme'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [regNumber, setRegNumber] = useState('')

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/register')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Car className="h-5 w-5 text-blue-400" />
            <span>CarCheck</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-label="Växla tema"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-slate-700 hover:text-white"
              asChild
            >
              <Link to="/login">Logga in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              asChild
            >
              <Link to="/register">Kom igång</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 py-20 text-center md:py-32">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
            <CheckCircle className="h-4 w-4" />
            Gratis att prova — ingen registrering krävs för demo
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Kontrollera bilen
            <span className="text-blue-400"> innan du köper</span>
          </h1>
          <p className="mt-4 text-lg text-blue-100/80 md:text-xl">
            Få en komplett analys av begagnade bilar med registreringsnummer.
            Historik, värdering och rekommendation — direkt.
          </p>

          {/* Hero search form */}
          <form onSubmit={handleHeroSearch} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Input
              value={regNumber}
              onChange={e => setRegNumber(e.target.value.toUpperCase())}
              placeholder="ABC 123"
              className="h-12 w-full max-w-xs border-slate-600 bg-slate-800/80 text-center text-lg font-semibold tracking-widest text-white placeholder:text-slate-400 focus:border-blue-500"
            />
            <Button type="submit" size="lg" className="h-12 bg-blue-600 px-8 text-white hover:bg-blue-700">
              <Search className="mr-2 h-5 w-5" />
              Kontrollera
            </Button>
          </form>

          <p className="mt-3 text-sm text-slate-400">
            Redan medlem?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
              Logga in här
            </Link>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-slate-50 py-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">10 000+</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">bilar kontrollerade</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">12</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">analysparametrar</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 md:text-3xl">Gratis</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">att prova</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            Så fungerar det
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                icon: <Search className="h-6 w-6 text-white" />,
                title: 'Sök registreringsnummer',
                desc: 'Ange bilens registreringsnummer för att hämta all tillgänglig data från officiella register.',
              },
              {
                step: '2',
                icon: <BarChart3 className="h-6 w-6 text-white" />,
                title: 'Få en analys',
                desc: 'Vår motor analyserar ålder, miltal, försäkring, återkallelser och besiktning automatiskt.',
              },
              {
                step: '3',
                icon: <Shield className="h-6 w-6 text-white" />,
                title: 'Fatta rätt beslut',
                desc: 'Få en tydlig rekommendation och poäng 0–100 så du köper tryggt och informerat.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30">
                    {icon}
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
                    {step}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            Allt du behöver — på ett ställe
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <History className="h-6 w-6 text-blue-500" />,
                title: 'Sökhistorik',
                desc: 'Alla dina tidigare sökningar sparas så du enkelt kan gå tillbaka.',
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
                title: '12 faktorer',
                desc: 'Ålder, miltal, försäkring, återkallelser, besiktning och mer.',
              },
              {
                icon: <Shield className="h-6 w-6 text-blue-500" />,
                title: 'Rekommendation',
                desc: 'Tydlig köp/avvakta/undvik-bedömning baserad på objektiv data.',
              },
              {
                icon: <Heart className="h-6 w-6 text-blue-500" />,
                title: 'Favoriter',
                desc: 'Spara intressanta bilar och jämför dem i lugn och ro.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  {icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Redo att köpa din nästa bil tryggt?
          </h2>
          <p className="mt-3 text-blue-200">
            Skapa ett gratis konto och kör din första bilkontroll på under en minut.
          </p>
          <Button
            size="lg"
            className="mt-6 bg-blue-500 px-8 text-white hover:bg-blue-400"
            asChild
          >
            <Link to="/register">
              Kom igång gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} CarCheck. Alla rättigheter förbehållna.</p>
      </footer>
    </div>
  )
}
