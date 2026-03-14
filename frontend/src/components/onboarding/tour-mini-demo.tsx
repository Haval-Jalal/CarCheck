import { useEffect, useRef, useState } from 'react'
import { ChevronRight, ArrowLeft, Car, Banknote, ClipboardList, Shield } from 'lucide-react'

// ── Demo data — mirrors real CATEGORY_GROUPS + ScoreGauge ─────────────────────

const DEMO_SCORE_TARGET = 74

const DEMO_GROUPS = [
  {
    title: 'Fordonets skick',
    icon: <Car className="h-3.5 w-3.5" />,
    items: [
      { label: 'Ålder',      value: 78, weight: '12%', detail: 'Fordonet är 6 år gammalt — ett bra åldersintervall med rimlig risk för slitage.' },
      { label: 'Miltal',     value: 82, weight: '12%', detail: '4 500 mil är under genomsnittet för årsmodellen. Låg användning tyder på god driftshistorik.' },
      { label: 'Besiktning', value: 91, weight: '10%', detail: 'Godkänd utan anmärkningar på senaste besiktning. Bra tecken på ett välskött fordon.' },
    ],
  },
  {
    title: 'Ekonomi & juridik',
    icon: <Banknote className="h-3.5 w-3.5" />,
    items: [
      { label: 'Skuld & ekonomi', value: 95, weight: '15%', detail: 'Inga registrerade skulder eller betalningsanmärkningar kopplade till fordonet.' },
      { label: 'Marknadsvärde',   value: 62, weight: '5%',  detail: 'Priset är något över marknadsvärde. Förhandla om ca 5 000–10 000 kr nedåt.' },
      { label: 'Miljö & skatt',   value: 70, weight: '5%',  detail: 'Bilen uppfyller Euro 6-utsläppskrav. Fordonsskatt: 1 320 kr/år.' },
    ],
  },
  {
    title: 'Historik & underhåll',
    icon: <ClipboardList className="h-3.5 w-3.5" />,
    items: [
      { label: 'Försäkring',      value: 88, weight: '9%',  detail: 'Kontinuerlig försäkring utan längre avbrott. Indikerar aktiv och ansvarsfull ägare.' },
      { label: 'Servicehistorik', value: 55, weight: '8%',  detail: 'Begränsad servicehistorik registrerad. Fråga säljaren om serviceboken.' },
      { label: 'Ägarhistorik',    value: 65, weight: '5%',  detail: '3 tidigare ägare. Fråga om anledningen till ägarbyten och ägandeperiodernas längd.' },
    ],
  },
  {
    title: 'Säkerhet & tillförlitlighet',
    icon: <Shield className="h-3.5 w-3.5" />,
    items: [
      { label: 'Drivlina',         value: 80, weight: '8%',  detail: 'Drivlinan är i gott skick baserat på tillgänglig data. Inga varningssignaler noterade.' },
      { label: 'Återkallelser',    value: 90, weight: '6%',  detail: 'Inga utestående återkallelser från Transportstyrelsen registrerade för detta fordon.' },
      { label: 'Stöld & säkerhet', value: 85, weight: '5%',  detail: 'Inga stöldanmälningar eller säkerhetsrelaterade incidenter i historiken.' },
    ],
  },
]

// Flatten all factors for the animation sequence
const ALL_FACTORS = DEMO_GROUPS.flatMap((g, gi) => g.items.map((item, fi) => ({ ...item, gi, fi })))

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(v: number) {
  return v >= 70 ? '#22c55e' : v >= 40 ? '#eab308' : '#ef4444'
}

function recLabel(s: number) {
  return s >= 70 ? 'Rekommenderas' : s >= 40 ? 'Köp med försiktighet' : 'Undvik'
}

function recBadgeBg(s: number) {
  return s >= 70 ? 'bg-green-600' : s >= 40 ? 'bg-yellow-600' : 'bg-red-600'
}

// ── Cursor SVG ─────────────────────────────────────────────────────────────────

function Cursor({ clicking }: { clicking: boolean }) {
  return (
    <svg
      width="14" height="18" viewBox="0 0 14 18"
      style={{
        transform: clicking ? 'scale(0.75)' : 'scale(1)',
        transition: 'transform 0.1s ease',
        filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))',
      }}
    >
      <path
        d="M1 1L1 14.5L4 11L6.5 16.5L8.2 15.7L5.8 10.5L10.5 10.5L1 1Z"
        fill="white" stroke="#0f172a" strokeWidth="1.2" strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Animation sequence ─────────────────────────────────────────────────────────

type Phase = 'moving' | 'clicking' | 'detail' | 'closing' | 'waiting'

const DURATIONS: Record<Phase, number> = {
  moving: 700, clicking: 200, detail: 2200, closing: 200, waiting: 350,
}
const NEXT_PHASE: Record<Phase, Phase> = {
  moving: 'clicking', clicking: 'detail', detail: 'closing', closing: 'waiting', waiting: 'moving',
}

// ── Score preview (step: analysis-score) ──────────────────────────────────────

export function ScorePreview() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    let cur = 0
    function tick() {
      cur = Math.min(cur + 2, DEMO_SCORE_TARGET)
      setScore(cur)
      if (cur < DEMO_SCORE_TARGET) setTimeout(tick, 20)
    }
    const t = setTimeout(tick, 300)
    return () => clearTimeout(t)
  }, [])

  const color = scoreColor(score)
  const markerColor = color

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      {/* Car header */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20">
          <Car className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">Volvo XC60 · 2020</p>
          <p className="text-[10px] text-slate-500">ABC123 · 4 500 mil</p>
        </div>
      </div>

      {/* Score gauge — faithful replica */}
      <div className="rounded-xl border border-white/10 bg-slate-800/80 px-4 py-4 space-y-3">
        <div className="flex items-center gap-4">
          {/* Circle */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4"
            style={{ borderColor: color, transition: 'border-color 0.3s' }}
          >
            <span className="text-3xl font-bold tabular-nums" style={{ color, transition: 'color 0.3s' }}>
              {score}
            </span>
          </div>

          {/* Badge + gradient bar */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold text-white ${recBadgeBg(score)}`}
                style={{ transition: 'background-color 0.3s' }}
              >
                {recLabel(score)}
              </span>
              <span className="text-xs text-slate-500">av 100</span>
            </div>
            {/* Gradient bar */}
            <div>
              <div
                className="relative h-3 w-full rounded-full"
                style={{ background: 'linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)' }}
              >
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white shadow-lg"
                  style={{ left: `${score}%`, backgroundColor: markerColor, transition: 'left 0.06s linear, background-color 0.3s' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 select-none">
                <span>Undvik</span><span>50</span><span>Rekommenderas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick facts grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Märke & Modell', value: 'Volvo XC60' },
          { label: 'Årsmodell', value: '2020' },
          { label: 'Miltal', value: '4 500 mil' },
          { label: 'Bränsle', value: 'Bensin' },
          { label: 'Hästkrafter', value: '197 hk' },
          { label: 'Färg', value: 'Silver' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-white/8 bg-slate-800/60 px-3 py-2">
            <p className="text-[10px] text-slate-500">{label}</p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Factors preview (step: analysis-factors) ──────────────────────────────────

export function FactorsPreview() {
  const [factorIdx, setFactorIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('moving')
  const [showDetail, setShowDetail] = useState(false)
  const [cursorY, setCursorY] = useState(0)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({ factorIdx: 0, phase: 'moving' as Phase })

  // Update cursor Y when factorIdx changes (via DOM measurement)
  useEffect(() => {
    const container = containerRef.current
    const row = rowRefs.current[factorIdx]
    if (!container || !row) return
    const cRect = container.getBoundingClientRect()
    const rRect = row.getBoundingClientRect()
    setCursorY(rRect.top - cRect.top + rRect.height / 2 - 9)
  }, [factorIdx])

  // Animation loop
  useEffect(() => {
    let cancelled = false

    function tick() {
      if (cancelled) return
      const { factorIdx: fi, phase: ph } = stateRef.current

      if (ph === 'clicking') setShowDetail(true)
      if (ph === 'closing')  setShowDetail(false)

      setTimeout(() => {
        if (cancelled) return
        const nextPhase = NEXT_PHASE[ph]
        const nextFi = nextPhase === 'moving' && ph === 'waiting'
          ? (fi + 1) % ALL_FACTORS.length
          : fi

        stateRef.current = { factorIdx: nextFi, phase: nextPhase }
        setPhase(nextPhase)
        if (nextFi !== fi) setFactorIdx(nextFi)
        tick()
      }, DURATIONS[ph])
    }

    tick()
    return () => { cancelled = true }
  }, [])

  const activeFactor = ALL_FACTORS[factorIdx]
  const clicking = phase === 'clicking' || phase === 'closing'
  let flatIdx = 0

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto p-3">
      {/* Factor groups */}
      <p className="mb-2 text-[11px] font-semibold text-slate-400">Detaljanalys — 12 faktorer</p>
      <div className="grid grid-cols-2 gap-2.5">
        {DEMO_GROUPS.map((group) => (
          <div
            key={group.title}
            className="rounded-xl border border-white/10 bg-slate-800/70 p-3 space-y-0.5"
          >
            {/* Group header */}
            <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {group.icon}
              {group.title}
            </div>

            {/* Factor rows */}
            {group.items.map(({ label, value, weight }) => {
              const fi = flatIdx++
              const isActive = fi === factorIdx && !showDetail
              return (
                <button
                  key={label}
                  ref={el => { rowRefs.current[fi] = el }}
                  type="button"
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors"
                  style={{ backgroundColor: isActive ? 'rgba(59,130,246,0.10)' : 'transparent' }}
                >
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-200">{label}</span>
                      <span className="text-slate-500 shrink-0 ml-1">
                        {value}/100
                        <span className="text-slate-600 ml-0.5">({weight})</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${value}%`, backgroundColor: scoreColor(value) }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Animated cursor — positioned over the active row's ChevronRight */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: cursorY,
          right: 20,
          transition: 'top 0.55s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 10,
        }}
      >
        <Cursor clicking={clicking} />
      </div>

      {/* Detail panel slides up */}
      <div
        className="absolute inset-0 flex flex-col bg-slate-900/98 p-4"
        style={{
          transform: showDetail ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Detail header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
            <ArrowLeft className="h-3 w-3 text-slate-300" />
          </div>
          <span className="text-sm font-semibold text-white">{activeFactor.label}</span>
          <span
            className="ml-auto text-sm font-bold tabular-nums"
            style={{ color: scoreColor(activeFactor.value) }}
          >
            {activeFactor.value}/100
          </span>
        </div>

        {/* Detail score bar */}
        <div className="h-2 w-full rounded-full bg-slate-700 mb-1 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${activeFactor.value}%`, backgroundColor: scoreColor(activeFactor.value) }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mb-4">
          <span>0</span><span>50</span><span>100</span>
        </div>

        {/* Detail text */}
        <p className="text-sm leading-relaxed text-slate-300">{activeFactor.detail}</p>

        {/* Mock tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-slate-400">
            Vikt: {activeFactor.weight}
          </span>
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] text-blue-400">
            Klicka för att läsa mer
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Public export ──────────────────────────────────────────────────────────────

export function TourMiniDemo({ stepId }: { stepId: string }) {
  if (stepId === 'analysis-score')   return <ScorePreview />
  if (stepId === 'analysis-factors') return <FactorsPreview />
  return null
}
