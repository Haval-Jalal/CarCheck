import { useState, useCallback } from 'react'
import { ClipboardCheck, Copy, Check, ChevronDown, ChevronRight, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AnalysisBreakdown, AnalysisDetails } from '@/types/car.types'

interface CheckItem {
  id: string
  text: string
  priority: 'critical' | 'important' | 'normal'
}

interface CheckGroup {
  title: string
  items: CheckItem[]
}

function buildChecklist(
  breakdown: AnalysisBreakdown,
  details: AnalysisDetails | null,
): CheckGroup[] {
  const groups: CheckGroup[] = []

  // ── Motor & Drivlina ──
  const motorItems: CheckItem[] = [
    { id: 'motor-start', text: 'Kolla att motorn startar enkelt (kallt)', priority: 'critical' },
    { id: 'motor-oil', text: 'Kontrollera oljenivå och oljans färg (bör ej vara svart)', priority: 'important' },
    { id: 'motor-kylvatten', text: 'Kontrollera kylvätskans nivå och färg', priority: 'important' },
    { id: 'motor-rök', text: 'Titta på avgasröret — vit/blå rök = varningssignal', priority: 'important' },
  ]

  if (breakdown.drivetrainScore < 70) {
    motorItems.push(
      { id: 'motor-transmission', text: 'Provkör — kontrollera växling, inga ryck eller kärvhet', priority: 'critical' },
      { id: 'motor-vibration', text: 'Lyssna efter ovanliga ljud från motor och drivaxlar', priority: 'critical' },
    )
  }

  if (details?.knownIssues && details.knownIssues.length > 0) {
    motorItems.push({
      id: 'motor-known',
      text: `Kontrollera specifikt: ${details.knownIssues.slice(0, 2).join(', ')} (kända problem för denna modell)`,
      priority: 'critical',
    })
  }

  groups.push({ title: 'Motor & Drivlina', items: motorItems })

  // ── Kaross & Exteriör ──
  const karossItems: CheckItem[] = [
    { id: 'kaross-rost', text: 'Kontrollera under trösklarna och hjulhusen för rost', priority: 'critical' },
    { id: 'kaross-lack', text: 'Kontrollera lacken i dagsljus för repor, bucklor eller färgskillnader', priority: 'important' },
    { id: 'kaross-fogar', text: 'Kontrollera att alla karosspaneler har jämna fogar (ojämna = olycka)', priority: 'critical' },
    { id: 'kaross-glass', text: 'Kontrollera alla rutor för sprickor', priority: 'normal' },
    { id: 'kaross-dörrar', text: 'Öppna och stäng alla dörrar — ska sitta rätt och stänga mjukt', priority: 'normal' },
  ]

  const seriousIncidents = details?.insuranceIncidents.filter(i => i.severity === 'Allvarlig') ?? []
  if (seriousIncidents.length > 0) {
    karossItems.unshift({
      id: 'kaross-skada',
      text: `${seriousIncidents.length} allvarlig(a) försäkringsskada(r) registrerad(e) — var extra noggrann med karossens symmetri`,
      priority: 'critical',
    })
  }

  groups.push({ title: 'Kaross & Exteriör', items: karossItems })

  // ── Däck & Bromsar ──
  const bromsar: CheckItem[] = [
    { id: 'däck-slitage', text: 'Kontrollera däckmönsterdjup på alla fyra hjul (min. 1,6 mm lag, 3 mm rekommenderat)', priority: 'critical' },
    { id: 'däck-ojämnt', text: 'Kontrollera att däcken inte har ojämnt slitage (felaktig hjulinställning)', priority: 'important' },
    { id: 'bromsar-tramp', text: 'Trampa in bromspedalen hårt — ska vara fast, ej sjunka', priority: 'critical' },
    { id: 'bromsar-skivor', text: 'Kontrollera bromssskivornas tjocklek visuellt (spår/räfflor = slitage)', priority: 'important' },
  ]

  const latestMileage = details?.mileageHistory?.at(-1)?.mileage ?? 0
  if (latestMileage > 100000) {
    bromsar.push({
      id: 'bromsar-klossar',
      text: 'Fråga om bromsklossarna är bytta — vid denna miltal är det sannolikt nödvändigt',
      priority: 'important',
    })
  }

  groups.push({ title: 'Däck & Bromsar', items: bromsar })

  // ── Interiör ──
  const interior: CheckItem[] = [
    { id: 'int-lukt', text: 'Sniffa efter fukt- eller mögellukt (kan tyda på takläckage)', priority: 'important' },
    { id: 'int-mätare', text: 'Kontrollera att alla instrumentmätare fungerar vid start', priority: 'normal' },
    { id: 'int-ac', text: 'Testa luftkonditioneringen — ska blåsa kallt', priority: 'normal' },
    { id: 'int-fönster', text: 'Testa alla elfönster upp och ned', priority: 'normal' },
    { id: 'int-säten', text: 'Kontrollera sätesinställning och att sätena inte är sönder', priority: 'normal' },
  ]

  groups.push({ title: 'Interiör', items: interior })

  // ── Papper & Historik ──
  const papper: CheckItem[] = [
    { id: 'papper-regbevis', text: 'Be om att se registreringsbeviset (del 1 + del 2)', priority: 'critical' },
    { id: 'papper-servicebok', text: 'Be om servicebok eller digitala kvitton från verkstad', priority: 'critical' },
    { id: 'papper-nycklar', text: 'Kontrollera att du får alla nycklar/fjärrkontroller', priority: 'important' },
    { id: 'papper-garantier', text: 'Fråga om aktiva garantier (fabriksgaranti, däckgaranti etc.)', priority: 'normal' },
  ]

  if (details?.recalls && details.recalls.filter(r => !r.resolved).length > 0) {
    papper.unshift({
      id: 'papper-återkallelse',
      text: 'Kräv bevis på att återkallelsen är åtgärdad av auktoriserad verkstad',
      priority: 'critical',
    })
  }

  if (details?.debts && details.debts.length > 0) {
    papper.unshift({
      id: 'papper-skulder',
      text: 'Begär skriftligt bevis på att alla registrerade skulder är lösta',
      priority: 'critical',
    })
  }

  groups.push({ title: 'Papper & Historik', items: papper })

  // ── Provkörning ──
  const provkorning: CheckItem[] = [
    { id: 'prov-kall', text: 'Kör bilen kall (utan att motorn är varm) — enklast att höra problem', priority: 'important' },
    { id: 'prov-motorvärmare', text: 'Testa motorvärmare om bilen har det', priority: 'normal' },
    { id: 'prov-bromsning', text: 'Bromsa hårt på ett säkert ställe — bilen ska inte dra åt sidan', priority: 'critical' },
    { id: 'prov-körning', text: 'Kör på motorväg — kontrollera att det inte vibrerar vid hög hastighet', priority: 'important' },
    { id: 'prov-sväng', text: 'Sväng fullt till båda håll — kontrollera att det inte knäpper (drivknutar)', priority: 'important' },
  ]

  groups.push({ title: 'Provkörning', items: provkorning })

  return groups
}

const PRIORITY_DOT: Record<CheckItem['priority'], string> = {
  critical: 'bg-red-500',
  important: 'bg-yellow-500',
  normal: 'bg-slate-400',
}

export function InspectionChecklist({ breakdown, details }: {
  breakdown: AnalysisBreakdown
  details: AnalysisDetails | null
}) {
  const groups = buildChecklist(breakdown, details)
  const allIds = groups.flatMap(g => g.items.map(i => i.id))
  const [isOpen, setIsOpen] = useState(false)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const toggleItem = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleGroup = (title: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(title) ? next.delete(title) : next.add(title)
      return next
    })
  }

  const handleDownload = useCallback(async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const today = new Date().toLocaleDateString('sv-SE')
    const M = 14
    const MAX_Y = 277
    let y = 20

    const checkPage = (needed: number) => {
      if (y + needed > MAX_Y) { doc.addPage(); y = 20 }
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Besiktningschecklista - CarCheck', M, y)
    y += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(`Genererad: ${today}`, M, y)
    doc.setTextColor(0, 0, 0)
    y += 10

    const PRIORITY_COLOR: Record<CheckItem['priority'], [number, number, number]> = {
      critical: [220, 38, 38],
      important: [202, 138, 4],
      normal: [100, 116, 139],
    }

    for (const group of groups) {
      checkPage(12)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(group.title, M, y)
      y += 6

      for (const item of group.items) {
        checkPage(8)
        const isChecked = checked.has(item.id)
        const [r, g, b] = PRIORITY_COLOR[item.priority]
        doc.setFontSize(8)
        doc.setTextColor(r, g, b)
        doc.text('\u25CF', M + 2, y)
        doc.setTextColor(isChecked ? 150 : 0, isChecked ? 150 : 0, isChecked ? 150 : 0)
        doc.setFontSize(9)
        doc.setFont('helvetica', isChecked ? 'italic' : 'normal')
        const prefix = isChecked ? '[x] ' : '[ ] '
        const lines = doc.splitTextToSize(prefix + item.text, 165)
        doc.text(lines, M + 8, y)
        y += lines.length * 5 + 1
      }
      y += 4
    }

    checkPage(14)
    y += 2
    doc.setDrawColor(200, 200, 200)
    doc.line(M, y, 196, y)
    y += 5

    const legendItems: [string, [number, number, number]][] = [
      ['Kritiskt', [220, 38, 38]],
      ['Viktigt', [202, 138, 4]],
      ['Normal', [100, 116, 139]],
    ]
    let lx = M
    doc.setFontSize(7)
    for (const [label, [r, g, b]] of legendItems) {
      doc.setTextColor(r, g, b)
      doc.text('\u25CF', lx, y)
      doc.setTextColor(80, 80, 80)
      doc.text(label, lx + 4, y)
      lx += 22
    }
    y += 5
    doc.setTextColor(160, 160, 160)
    doc.text(
      'Checklistan genereras baserat pa bilens analysdata. Ersatter inte en professionell besiktning.',
      M, y
    )

    doc.save('besiktningschecklista.pdf')
  }, [groups, checked])

  const handleCopy = useCallback(() => {
    const text = groups
      .map(g => {
        const lines = g.items.map(i => `${checked.has(i.id) ? '✅' : '☐'} ${i.text}`)
        return `${g.title}\n${lines.join('\n')}`
      })
      .join('\n\n')
    navigator.clipboard.writeText(`Besiktningschecklista från CarCheck\n\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [groups, checked])

  const doneCount = checked.size
  const totalCount = allIds.length

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4 text-blue-500" />
            Besiktningschecklista för visning
          </CardTitle>
          <div className="flex items-center gap-2">
            {isOpen && (
              <>
                <span className="text-xs text-muted-foreground">{doneCount}/{totalCount} klara</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => { e.stopPropagation(); handleDownload() }}
                  className="h-7 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="ml-1">Ladda ner</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => { e.stopPropagation(); handleCopy() }}
                  className="h-7 text-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="ml-1">{copied ? 'Kopierat!' : 'Kopiera'}</span>
                </Button>
              </>
            )}
            {isOpen
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {isOpen && <CardContent className="space-y-4">
        {groups.map((group) => {
          const isCollapsed = collapsed.has(group.title)
          const groupDone = group.items.filter(i => checked.has(i.id)).length
          return (
            <div key={group.title} className="rounded-lg border">
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold hover:bg-muted/40 rounded-lg"
              >
                <span>{group.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-normal text-muted-foreground">
                    {groupDone}/{group.items.length}
                  </span>
                  {isCollapsed
                    ? <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {!isCollapsed && (
                <div className="border-t px-3 pb-2 pt-1 space-y-1">
                  {group.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-1.5 hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        checked={checked.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                      />
                      <span
                        className={cn(
                          'text-sm leading-snug',
                          checked.has(item.id) && 'line-through text-muted-foreground'
                        )}
                      >
                        <span className={cn('mr-1.5 inline-block h-2 w-2 rounded-full', PRIORITY_DOT[item.priority])} />
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Kritiskt</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" /> Viktigt</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400 inline-block" /> Normal</span>
        </div>
        <p className="text-xs text-muted-foreground/60 italic">
          Checklistan genereras baserat på bilens analysdata. Ersätter inte en professionell besiktning.
        </p>
      </CardContent>}
    </Card>
  )
}
