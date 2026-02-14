import { Link } from 'react-router'
import { Car, Search, BarChart3, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Car className="h-5 w-5" />
            <span>CarCheck</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Logga in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Kom igång</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center md:py-32">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Kontrollera bilen innan du köper
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Få en komplett analys av begagnade bilar med registreringsnummer.
            Historik, värdering och rekommendation — direkt.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/register">Kom igång gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Logga in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/40 py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold">Så fungerar det</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Search className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold">1. Sök registreringsnummer</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ange bilens registreringsnummer för att hämta all tillgänglig data.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold">2. Få en analys</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Vår motor analyserar ålder, miltal, försäkring, återkallelser och besiktning.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold">3. Fatta rätt beslut</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Få en tydlig rekommendation och poäng 0–100 så du köper tryggt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CarCheck. Alla rättigheter förbehållna.</p>
      </footer>
    </div>
  )
}
