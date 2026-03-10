import { useNavigate } from 'react-router'
import { Car, ArrowLeft } from 'lucide-react'

export function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-400" />
            <span className="text-base font-bold">CarCheck</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka
          </button>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Användarvillkor</h1>
          <p className="text-sm text-muted-foreground">Senast uppdaterad: mars 2026</p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6">

          <p>
            Genom att använda CarCheck ("tjänsten") godkänner du dessa villkor. Läs dem
            noggrant innan du skapar ett konto.
          </p>

          <h2>1. Om tjänsten</h2>
          <p>
            CarCheck tillhandahåller analysverktyg för begagnade bilar baserat på tillgänglig
            offentlig information. Tjänsten är ett beslutsstöd — inte ett juridiskt eller
            tekniskt intyg.
          </p>

          <h2>2. Ansvarsbegränsning</h2>
          <p>
            Analyserna baseras på tillgänglig data och är <strong className="text-foreground">inte garantier</strong> för
            ett fordons faktiska skick, historia eller värde. CarCheck ansvarar inte för beslut
            fattade baserat på tjänstens information. Genomför alltid en oberoende besiktning
            innan köp.
          </p>

          <h2>3. Konto och åtkomst</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Du måste vara minst 18 år för att skapa ett konto</li>
            <li>Du ansvarar för att hålla ditt lösenord hemligt</li>
            <li>Ett konto per person — delning av konton är inte tillåtet</li>
            <li>Vi förbehåller oss rätten att stänga av konton som missbrukar tjänsten</li>
          </ul>

          <h2>4. Betalning och krediter</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Krediter och prenumerationer är personliga och kan inte överlåtas</li>
            <li>Köpta krediter är giltiga i 12 månader från köpdatum</li>
            <li>Prenumerationer löper månadsvis och kan sägas upp när som helst</li>
            <li>Återbetalning beviljas inte för förbrukade krediter eller påbörjad prenumerationsperiod</li>
            <li>Priser anges i SEK inklusive moms</li>
          </ul>

          <h2>5. Tillåten användning</h2>
          <p>Du får inte:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Skrapa eller automatisera förfrågningar mot tjänsten</li>
            <li>Försöka kringgå rate-limiting eller kvotbegränsningar</li>
            <li>Använda tjänsten för kommersiella ändamål utan skriftligt avtal</li>
            <li>Dela, sälja eller vidarebefordra analysresultat i kommersiellt syfte</li>
          </ul>

          <h2>6. Immateriella rättigheter</h2>
          <p>
            Allt innehåll, kod och design i CarCheck tillhör CarCheck. Du beviljas en
            begränsad, personlig, icke-exklusiv licens att använda tjänsten för privat bruk.
          </p>

          <h2>7. Tillgänglighet</h2>
          <p>
            Vi strävar efter hög tillgänglighet men garanterar inte avbrottsfri drift.
            Planerat underhåll meddelas i förväg när möjligt.
          </p>

          <h2>8. Ändringar av villkor</h2>
          <p>
            Vi kan uppdatera dessa villkor. Väsentliga ändringar meddelas via e-post
            minst 30 dagar i förväg. Fortsatt användning av tjänsten innebär att du
            accepterar de uppdaterade villkoren.
          </p>

          <h2>9. Tillämplig lag</h2>
          <p>
            Dessa villkor regleras av svensk rätt. Tvister avgörs i svensk domstol.
          </p>

          <h2>10. Kontakt</h2>
          <p>
            Frågor om villkoren? Kontakta oss på{' '}
            <span className="text-foreground">info@carcheck.se</span>
          </p>
        </div>
      </div>
    </div>
  )
}
