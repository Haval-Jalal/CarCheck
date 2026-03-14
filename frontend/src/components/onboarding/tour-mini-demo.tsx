import { useEffect, useRef, useState } from 'react'
import { ChevronRight, ArrowLeft } from 'lucide-react'

// ── Mock data ──────────────────────────────────────────────────────────────────

const DEMO_SCORE = 74

const DEMO_FACTORS = [
  {
    label: 'Körsträcka',
    value: 82,
    detail: '4 500 mil — under genomsnittet för årsmodellen. Låg användning tyder på god driftshistorik.',
  },
  {
    label: 'Antal ägare',
    value: 58,
    detail: 'Bilen har haft 3 ägare. Fler ägarbyten kan indikera kortare ägandeperioder — fråga om bakgrunden.',
  },
  {
    label: 'Besiktning',
    value: 91,
    detail: 'Godkänd utan anmärkningar. Tyder på ett välskött fordon med regelbunden service.',
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function barColor(v: number) {
  return v >= 70 ? '#22c55e' : v >= 40 ? '#eab308' : '#ef4444'
}

function recLabel(score: number) {
  return score >= 70 ? 'Rekommenderas' : score >= 40 ? 'Köp med försiktighet' : 'Undvik'
}

function recClass(score: number) {
  return score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
}

// ── Cursor SVG ─────────────────────────────────────────────────────────────────

function CursorSvg({ clicking }: { clicking: boolean }) {
  return (
    <svg
      width="13"
      height="17"
      viewBox="0 0 13 17"
      style={{
        transform: clicking ? 'scale(0.78)' : 'scale(1)',
        transition: 'transform 0.1s ease',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))',
      }}
    >
      <path
        d="M1 1L1 13.5L3.8 10.2L6.1 15.5L7.7 14.8L5.5 9.5L9.5 9.5L1 1Z"
        fill="white"
        stroke="#0f172a"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Score preview (step: analysis-score) ──────────────────────────────────────

function ScorePreview() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    let cur = 0
    const id = setInterval(() => {
      cur = Math.min(cur + 3, DEMO_SCORE)
      setScore(cur)
      if (cur >= DEMO_SCORE) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [])

  const color = barColor(score)

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 mt-3">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4"
        style={{ borderColor: color, transition: 'border-color 0.25s' }}
      >
        <span className="text-xl font-black tabular-nums" style={{ color, transition: 'color 0.25s' }}>
          {score}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Helhetsbetyg</p>
        <p className={`text-sm font-bold mt-0.5 ${recClass(score)}`}>{recLabel(score)}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full"
            style={{
              width: `${score}%`,
              backgroundColor: color,
              transition: 'width 0.08s linear, background-color 0.25s',
            }}
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-600">Baserat på 12 analyserade faktorer</p>
      </div>
    </div>
  )
}

// ── Factors preview (step: analysis-factors) ──────────────────────────────────

// Animation sequence (ms):
//  moving   → cursor glides to factor row
//  clicking → cursor scale-down (click pulse)
//  detail   → detail panel visible
//  closing  → panel slides back down
//  waiting  → brief pause before next factor

const SEQUENCE: Array<{ phase: string; ms: number }> = [
  { phase: 'moving',   ms: 700 },
  { phase: 'clicking', ms: 220 },
  { phase: 'detail',   ms: 2400 },
  { phase: 'closing',  ms: 220 },
  { phase: 'waiting',  ms: 380 },
]

const ROW_H = 43

function FactorsPreview() {
  const [factorIdx, setFactorIdx] = useState(0)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Use a ref-based loop so we never have stale-closure issues
  const stateRef = useRef({ factorIdx: 0, phaseIdx: 0 })

  useEffect(() => {
    let cancelled = false

    function tick() {
      if (cancelled) return
      const { phaseIdx: pi, factorIdx: fi } = stateRef.current
      const { phase, ms } = SEQUENCE[pi]

      // Apply side effects for entering this phase
      if (phase === 'clicking') setShowDetail(true)
      if (phase === 'closing')  setShowDetail(false)

      timerRef.current = setTimeout(() => {
        if (cancelled) return
        // Advance to next phase
        const nextPi = (pi + 1) % SEQUENCE.length
        const nextFi = nextPi === 0 ? (fi + 1) % DEMO_FACTORS.length : fi

        stateRef.current = { phaseIdx: nextPi, factorIdx: nextFi }
        setPhaseIdx(nextPi)
        if (nextFi !== fi) setFactorIdx(nextFi)

        tick()
      }, ms)
    }

    tick()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, []) // run once on mount, loop internally

  const { phase } = SEQUENCE[phaseIdx]
  const factor = DEMO_FACTORS[factorIdx]
  const color = barColor(factor.value)
  const clicking = phase === 'clicking' || phase === 'closing'
  const cursorTop = factorIdx * ROW_H + 13

  return (
    <div
      className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-800/60"
      style={{ height: DEMO_FACTORS.length * ROW_H }}
    >
      {/* Factor rows */}
      {DEMO_FACTORS.map((f, i) => (
        <div
          key={f.label}
          className="flex items-center gap-2 px-3 transition-colors duration-200"
          style={{
            height: ROW_H,
            backgroundColor:
              i === factorIdx && !showDetail ? 'rgba(255,255,255,0.045)' : 'transparent',
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between pr-4">
              <span className="text-[11px] font-medium text-slate-300">{f.label}</span>
              <span className="text-[10px] text-slate-500">{f.value}/100</span>
            </div>
            <div className="mt-1 h-[3px] w-full rounded-full bg-slate-700">
              <div
                className="h-full rounded-full"
                style={{ width: `${f.value}%`, backgroundColor: barColor(f.value) }}
              />
            </div>
          </div>
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-600" />
        </div>
      ))}

      {/* Animated cursor */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: cursorTop,
          right: 16,
          transition: 'top 0.55s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <CursorSvg clicking={clicking} />
      </div>

      {/* Detail panel slides up from bottom */}
      <div
        className="absolute inset-0 flex flex-col bg-slate-800 px-3 py-2.5"
        style={{
          transform: showDetail ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
            <ArrowLeft className="h-2.5 w-2.5 text-slate-400" />
          </div>
          <span className="text-[11px] font-semibold text-white">{factor.label}</span>
          <span className="ml-auto text-[11px] font-bold" style={{ color }}>{factor.value}/100</span>
        </div>

        <div className="h-[3px] w-full rounded-full bg-slate-700 mb-2.5">
          <div className="h-full rounded-full" style={{ width: `${factor.value}%`, backgroundColor: color }} />
        </div>

        <p className="text-[10px] leading-relaxed text-slate-400 line-clamp-3">{factor.detail}</p>
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
