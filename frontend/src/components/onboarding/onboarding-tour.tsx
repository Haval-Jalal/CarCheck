import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router'
import { X, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTourStore } from '@/stores/tour.store'
import { TOUR_STEPS } from './tour-steps'
import { TourMiniDemo } from './tour-mini-demo'

const PADDING = 12
const CARD_W_NORMAL = 340
const CARD_W_DEMO   = 780

interface Rect { x: number; y: number; width: number; height: number }

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
}

function getTooltipPosition(
  rect: Rect | null,
  position: string | undefined,
  cardW: number,
): React.CSSProperties {
  if (!rect) {
    return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: cardW }
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const p  = PADDING + 8

  const spaceBelow = vh - (rect.y + rect.height)
  const spaceAbove = rect.y

  let top: number
  if (position !== 'top' && spaceBelow > 220) {
    top = rect.y + rect.height + p
  } else if (spaceAbove > 220) {
    top = rect.y - p - 200
  } else {
    top = rect.y
  }

  const left = Math.max(16, Math.min(rect.x, vw - cardW - 16))
  top = Math.max(16, Math.min(top, vh - 240))

  return { position: 'fixed', top, left, width: cardW }
}

const DEMO_STEPS = new Set(['analysis-score', 'analysis-factors'])

export function OnboardingTour() {
  const { isActive, stepIndex, setStep, completeTour } = useTourStore()
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [visible, setVisible]       = useState(false)
  const navigate   = useNavigate()
  const location   = useLocation()
  const navigatedRef = useRef(false)

  const step      = TOUR_STEPS[stepIndex]
  const isLast    = stepIndex === TOUR_STEPS.length - 1
  const hasDemo   = DEMO_STEPS.has(step.id)
  const cardW     = hasDemo
    ? Math.min(window.innerWidth - 32, CARD_W_DEMO)
    : CARD_W_NORMAL

  const updateRect = useCallback(() => {
    setTargetRect(step.target ? getTargetRect(step.target) : null)
  }, [step.target])

  useEffect(() => {
    if (!isActive) return
    setVisible(false)
    navigatedRef.current = false

    const needsNav = step.route && location.pathname !== step.route
    if (needsNav) {
      navigate(step.route, { replace: true })
      navigatedRef.current = true
    }

    const delay = needsNav ? 400 : 80
    const t = setTimeout(() => { updateRect(); setVisible(true) }, delay)
    return () => clearTimeout(t)
  }, [isActive, stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isActive) return
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [isActive, updateRect])

  const handleNext = () => { if (isLast) { completeTour() } else { setStep(stepIndex + 1) } }
  const handleSkip = () => completeTour()

  if (!isActive) return null

  const spotlight = targetRect
    ? { x: targetRect.x - PADDING, y: targetRect.y - PADDING, width: targetRect.width + PADDING * 2, height: targetRect.height + PADDING * 2 }
    : null

  const tooltipStyle = getTooltipPosition(targetRect, step.position, cardW)
  const isCentered   = !step.target || !targetRect

  return createPortal(
    <div
      className={`fixed inset-0 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ zIndex: 9999 }}
    >
      {/* Dimmed overlay */}
      <svg className="fixed inset-0 h-full w-full" style={{ zIndex: 9999 }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect x={spotlight.x} y={spotlight.y} width={spotlight.width} height={spotlight.height} rx="10" fill="black" />
            )}
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill={isCentered ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.8)'}
          mask={spotlight ? 'url(#tour-mask)' : undefined}
        />
      </svg>

      {/* Spotlight ring */}
      {spotlight && (
        <div
          className="fixed rounded-xl ring-2 ring-blue-400 animate-pulse pointer-events-none"
          style={{ zIndex: 10000, top: spotlight.y, left: spotlight.x, width: spotlight.width, height: spotlight.height }}
        />
      )}

      {/* Click-to-skip backdrop */}
      <div className="fixed inset-0" style={{ zIndex: 10000 }} onClick={handleSkip} />

      {/* Card */}
      <div
        style={{ ...tooltipStyle, zIndex: 10001 }}
        className="rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Progress header (always full-width) ── */}
        <div className="flex items-center gap-1.5 border-b border-white/5 px-5 py-3.5">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === stepIndex ? 'w-8 bg-blue-500'
                : i < stepIndex ? 'w-2 bg-blue-500/40'
                : 'w-2 bg-slate-700'
              }`}
            />
          ))}
          <button
            onClick={handleSkip}
            className="ml-auto rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {hasDemo ? (
          /* ── Two-column layout for analysis steps ── */
          <div className="flex" style={{ height: 460 }}>
            {/* Left: text + nav */}
            <div className="flex w-60 shrink-0 flex-col border-r border-white/5">
              <div className="flex-1 px-5 py-5">
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-blue-400">
                  {stepIndex + 1} / {TOUR_STEPS.length}
                </p>
                <h3 className="mb-2 text-base font-bold text-white leading-snug">{step.title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{step.description}</p>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
                <button onClick={handleSkip} className="text-xs text-slate-500 transition-colors hover:text-slate-300">
                  Hoppa över
                </button>
                <Button onClick={handleNext} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-500">
                  {isLast
                    ? <><CheckCircle2 className="h-4 w-4" /> Kom igång!</>
                    : <>Nästa <ArrowRight className="h-4 w-4" /></>
                  }
                </Button>
              </div>
            </div>

            {/* Right: demo panel */}
            <div className="flex-1 overflow-hidden bg-slate-950/40">
              <TourMiniDemo key={step.id} stepId={step.id} />
            </div>
          </div>
        ) : (
          /* ── Normal single-column layout ── */
          <>
            <div className="px-5 py-5">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-blue-400">
                {stepIndex + 1} / {TOUR_STEPS.length}
              </p>
              <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
              <button onClick={handleSkip} className="text-xs text-slate-500 transition-colors hover:text-slate-300">
                Hoppa över
              </button>
              <Button onClick={handleNext} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-500">
                {isLast
                  ? <><CheckCircle2 className="h-4 w-4" /> Kom igång!</>
                  : <>Nästa <ArrowRight className="h-4 w-4" /></>
                }
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
