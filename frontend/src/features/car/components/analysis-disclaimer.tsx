import { Info } from 'lucide-react'
import { Link } from 'react-router'

export function AnalysisDisclaimer() {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/20 px-5 py-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground/70">
        <Info className="h-4 w-4 shrink-0 text-muted-foreground/60" />
        Om denna rapport
      </div>

      <div className="grid gap-4 sm:grid-cols-3 text-xs text-muted-foreground leading-relaxed">
        <div className="space-y-1">
          <p className="font-semibold text-foreground/60">Informationstjänst</p>
          <p>
            CarCheck sammanställer och visualiserar registrerad data från offentliga
            källor. Analysen utgör inte köp-, juridisk eller finansiell rådgivning.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground/60">Datakvalitet</p>
          <p>
            Uppgifterna kan vara ofullständiga, inaktuella eller innehålla fel.
            CarCheck garanterar inte att informationen är korrekt eller heltäckande.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground/60">Innan du köper</p>
          <p>
            Anlita alltid en auktoriserad besiktningsman. Vid rättsliga frågor,
            kontakta en jurist. CarCheck ansvarar inte för beslut fattade
            utifrån rapporten.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/40 pt-3 text-xs text-muted-foreground/50">
        <span>© CarCheck</span>
        <Link
          to="/terms"
          className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
        >
          Användarvillkor
        </Link>
        <Link
          to="/privacy"
          className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
        >
          Integritetspolicy
        </Link>
      </div>
    </div>
  )
}
