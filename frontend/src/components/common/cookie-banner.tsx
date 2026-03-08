import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const COOKIE_KEY = 'cookie-consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-4 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Vi använder nödvändiga cookies för att hålla dig inloggad och spara dina inställningar.
          Inga spårningscookies.{' '}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Läs mer
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={decline}
            className="text-muted-foreground hover:text-foreground"
          >
            Avvisa
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="bg-blue-600 hover:bg-blue-500"
          >
            Acceptera
          </Button>
          <button
            onClick={decline}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Stäng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
