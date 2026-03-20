import { useState } from 'react'
import { Outlet } from 'react-router'
import { MailWarning } from 'lucide-react'
import { Header } from './header'
import { useAuth } from '@/hooks/use-auth'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { OnboardingTour } from '@/components/onboarding/onboarding-tour'

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
    <div className="border-b border-yellow-500/20 bg-yellow-500/8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 md:px-6">
        <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
          <MailWarning className="h-4 w-4 shrink-0" />
          <span>Verifiera din e-postadress för att låsa upp alla funktioner.</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={loading || sent}
          className="shrink-0 border-yellow-500/40 text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400"
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
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Glow orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 left-1/4 h-[700px] w-[700px] rounded-full bg-blue-600/10 blur-[160px] dark:bg-blue-500/15" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[150px] dark:bg-violet-500/12" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-indigo-600/6 blur-[140px] dark:bg-indigo-500/10" />
      </div>

      <Header />
      {showBanner && <EmailVerificationBanner />}
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <Outlet />
      </main>
      <OnboardingTour />
    </div>
  )
}
