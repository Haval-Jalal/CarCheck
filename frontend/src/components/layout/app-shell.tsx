import { useState } from 'react'
import { Outlet } from 'react-router'
import { MailWarning } from 'lucide-react'
import { Header } from './header'
import { useAuth } from '@/hooks/use-auth'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function EmailVerificationBanner() {
  const { userEmail } = useAuth()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    if (!userEmail || loading || sent) return
    setLoading(true)
    try {
      await authApi.resendVerification(userEmail)
      setSent(true)
      toast.success('Verifieringsmail skickat! Kolla din inkorg.')
    } catch {
      toast.error('Kunde inte skicka mail, försök igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30">
      <div className="mx-auto max-w-5xl px-4 py-2 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
          <MailWarning className="h-4 w-4 shrink-0" />
          <span>Verifiera din e-postadress för att låsa upp alla funktioner.</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={loading || sent}
          className="shrink-0 border-yellow-500/40 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/10"
        >
          {sent ? 'Mail skickat!' : loading ? 'Skickar...' : 'Skicka ny länk'}
        </Button>
      </div>
    </div>
  )
}

export function AppShell() {
  const { isAuthenticated, emailVerified } = useAuth()
  const showBanner = isAuthenticated && emailVerified === false

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      {showBanner && <EmailVerificationBanner />}
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  )
}
