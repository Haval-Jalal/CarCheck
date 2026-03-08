import { Link } from 'react-router'
import { Car, ArrowLeft } from 'lucide-react'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-400" />
            <span className="text-base font-bold">CarCheck</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Integritetspolicy</h1>
          <p className="text-sm text-muted-foreground">Senast uppdaterad: mars 2026</p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6">

          <p>
            CarCheck ("vi", "oss", "tjänsten") värnar om din integritet. Den här policyn beskriver vilken
            persondata vi samlar in, varför vi samlar in den och hur vi hanterar den.
          </p>

          <h2>1. Personuppgiftsansvarig</h2>
          <p>
            CarCheck är personuppgiftsansvarig för behandlingen av dina personuppgifter.
            Kontakt: <span className="text-foreground">info@carcheck.se</span>
          </p>

          <h2>2. Vilken data vi samlar in</h2>
          <p>Vi samlar in följande uppgifter när du använder tjänsten:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Kontouppgifter</strong> — e-postadress och krypterat lösenord (bcrypt)</li>
            <li><strong className="text-foreground">Sökhistorik</strong> — registreringsnummer du sökt på, tidpunkt</li>
            <li><strong className="text-foreground">Favoriter</strong> — bilar du sparat som favoriter</li>
            <li><strong className="text-foreground">Betalningsinformation</strong> — transaktionsstatus (vi lagrar inga kortuppgifter)</li>
            <li><strong className="text-foreground">Säkerhetshändelser</strong> — inloggningsförsök, lösenordsbyten (för säkerhetsändamål)</li>
            <li><strong className="text-foreground">Tekniska uppgifter</strong> — IP-adress (rate-limiting), session-tokens</li>
          </ul>

          <h2>3. Varför vi behandlar uppgifterna</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>För att tillhandahålla tjänsten (avtalsuppfyllelse)</li>
            <li>För att säkra ditt konto och förhindra missbruk (berättigat intresse)</li>
            <li>För att fullgöra rättsliga förpliktelser (t.ex. bokföring)</li>
          </ul>

          <h2>4. Lagringsplats och säkerhet</h2>
          <p>
            Din data lagras hos <strong className="text-foreground">Supabase</strong> på servrar inom EU
            (eu-west-1, Irland). All kommunikation sker krypterat via HTTPS/TLS.
            Lösenord lagras aldrig i klartext — vi använder bcrypt-hashing.
          </p>

          <h2>5. Hur länge vi sparar data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kontodata — tills du raderar ditt konto</li>
            <li>Sökhistorik — tills du rensar den eller raderar kontot</li>
            <li>Säkerhetshändelser — 90 dagar</li>
            <li>Inaktiva konton — raderas efter 24 månaders inaktivitet</li>
          </ul>

          <h2>6. Dina rättigheter (GDPR)</h2>
          <p>Du har rätt att:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Tillgång</strong> — begära ett utdrag av all din data (Inställningar → Exportera min data)</li>
            <li><strong className="text-foreground">Radering</strong> — radera ditt konto och all tillhörande data (Inställningar → Radera konto)</li>
            <li><strong className="text-foreground">Rättelse</strong> — kontakta oss för att rätta felaktig data</li>
            <li><strong className="text-foreground">Invändning</strong> — invända mot behandling baserad på berättigat intresse</li>
            <li><strong className="text-foreground">Klagomål</strong> — lämna klagomål till Integritetsskyddsmyndigheten (IMY)</li>
          </ul>

          <h2>7. Delning med tredje part</h2>
          <p>
            Vi säljer aldrig din data. Vi delar data enbart med underleverantörer som behövs för
            att driva tjänsten (Supabase för databas). Dessa är bundna av databehandlingsavtal
            och GDPR-krav.
          </p>

          <h2>8. Cookies</h2>
          <p>
            Vi använder enbart nödvändiga tekniska cookies och localStorage för att hålla dig inloggad
            (session-token) och spara dina inställningar (tema). Inga spårningscookies eller
            tredjeparts-annonsering används.
          </p>

          <h2>9. Ändringar</h2>
          <p>
            Vi kan uppdatera denna policy. Väsentliga ändringar meddelas via e-post eller
            via tjänsten minst 30 dagar i förväg.
          </p>

          <h2>10. Kontakt</h2>
          <p>
            Frågor om din data? Kontakta oss på{' '}
            <span className="text-foreground">info@carcheck.se</span>
          </p>
        </div>
      </div>
    </div>
  )
}
