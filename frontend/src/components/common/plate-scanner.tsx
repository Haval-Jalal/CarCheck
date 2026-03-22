import { useRef, useState, useEffect, useCallback } from 'react'
import { Camera, X, RefreshCw, Check, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlateScannerProps {
  onDetected: (plate: string) => void
  onClose: () => void
}

type ScanState = 'camera' | 'scanning' | 'detected' | 'error'

const PLATE_REGEX = /[A-Z]{3}\d{3}/

function extractPlate(text: string): string | null {
  const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const match = clean.match(PLATE_REGEX)
  return match ? match[0] : null
}

export function PlateScanner({ onDetected, onClose }: PlateScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<ScanState>('camera')
  const [detectedPlate, setDetectedPlate] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [progress, setProgress] = useState(0)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('camera')
    } catch {
      setErrorMsg('Kunde inte öppna kameran. Kontrollera att kameraåtkomst är tillåten.')
      setState('error')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const handleCapture = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    setState('scanning')
    setProgress(0)

    try {
      // Lazy-load Tesseract to avoid impacting initial bundle size
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round((m.progress ?? 0) * 100))
          }
        },
      })
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      })
      const { data } = await worker.recognize(canvas)
      await worker.terminate()

      const plate = extractPlate(data.text)
      if (plate) {
        setDetectedPlate(plate)
        setState('detected')
      } else {
        setErrorMsg('Kunde inte läsa av registreringsskylten. Försök igen med bättre ljus och vinkel.')
        setState('error')
      }
    } catch {
      setErrorMsg('Något gick fel vid bildanalysen. Försök igen.')
      setState('error')
    }
  }

  const handleRetry = () => {
    setDetectedPlate(null)
    setErrorMsg('')
    setProgress(0)
    startCamera()
  }

  const handleConfirm = () => {
    if (detectedPlate) {
      stopCamera()
      onDetected(detectedPlate)
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-white">Skanna registreringsskylt</span>
        <button onClick={handleClose} className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Camera / result area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover transition-opacity ${state === 'camera' ? 'opacity-100' : 'opacity-30'}`}
        />
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Targeting frame (shown during camera state) */}
        {state === 'camera' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-20 w-72">
              {/* Corner marks */}
              {[
                'top-0 left-0 border-t-2 border-l-2 rounded-tl',
                'top-0 right-0 border-t-2 border-r-2 rounded-tr',
                'bottom-0 left-0 border-b-2 border-l-2 rounded-bl',
                'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
              ].map((cls, i) => (
                <div key={i} className={`absolute h-5 w-5 border-blue-400 ${cls}`} />
              ))}
              {/* Scan line animation */}
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 animate-pulse bg-blue-400/60" />
            </div>
            <p className="absolute bottom-[30%] text-xs font-medium text-white/70">
              Rikta kameran mot registreringsskylten
            </p>
          </div>
        )}

        {/* Scanning overlay */}
        {state === 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <ScanLine className="h-10 w-10 animate-pulse text-blue-400" />
            <p className="text-sm font-medium text-white">Analyserar bild... {progress}%</p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Detected overlay */}
        {state === 'detected' && detectedPlate && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60">
            <div className="flex items-center gap-2 rounded-xl bg-green-500/20 px-5 py-2.5 ring-1 ring-green-500/40">
              <Check className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-black tracking-[0.3em] text-white">
                {detectedPlate.slice(0, 3)} {detectedPlate.slice(3)}
              </span>
            </div>
            <p className="text-sm text-white/60">Är detta rätt registreringsnummer?</p>
          </div>
        )}

        {/* Error overlay */}
        {state === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-8">
            <Camera className="h-10 w-10 text-white/40" />
            <p className="text-center text-sm text-white/70">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-8 pt-4">
        {state === 'camera' && (
          <button
            onClick={handleCapture}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg active:scale-95"
          >
            <Camera className="h-7 w-7 text-slate-900" />
          </button>
        )}

        {state === 'detected' && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Försök igen
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={handleConfirm}>
              <Check className="mr-2 h-4 w-4" />
              Använd {detectedPlate?.slice(0, 3)} {detectedPlate?.slice(3)}
            </Button>
          </div>
        )}

        {state === 'error' && (
          <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Försök igen
          </Button>
        )}

        {state === 'scanning' && (
          <div className="h-10" /> // spacer while scanning
        )}
      </div>
    </div>
  )
}
