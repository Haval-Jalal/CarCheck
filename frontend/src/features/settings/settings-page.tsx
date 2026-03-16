import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Settings, Shield, Download, Trash2, BookOpen } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { gdprApi } from '@/api/gdpr.api'
import { useTourStore } from '@/stores/tour.store'
import { useSubscription } from '@/hooks/use-billing'
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validators'
import { clearTokens } from '@/lib/token'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

export function SettingsPage() {
  const navigate = useNavigate()
  const { data: sub } = useSubscription()
  const startTour = useTourStore(s => s.startTour)

  // Change password
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSubmitting, setPwSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setPwError(null)
    setPwSubmitting(true)
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      reset()
      toast.success('Lösenordet ändrat. Du loggas ut om ett ögonblick...')
      setTimeout(() => {
        clearTokens()
        navigate('/login')
      }, 2000)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      setPwError(axiosErr.response?.data?.error || 'Kunde inte ändra lösenord.')
    } finally {
      setPwSubmitting(false)
    }
  }

  // GDPR Export
  const [exporting, setExporting] = useState(false)
  const handleExport = async () => {
    setExporting(true)
    try {
      const { data } = await gdprApi.exportData()

      const sep  = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      const fmt  = (d: string) => new Date(d).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })
      const fmtD = (d: string) => new Date(d).toLocaleDateString('sv-SE')
      const sek  = (n: number) => n.toLocaleString('sv-SE') + ' kr'

      const lines: string[] = [
        'CARCHECK — PERSONUPPGIFTSEXPORT',
        'Enligt EU:s dataskyddsförordning (GDPR), artikel 20 — Dataportabilitet',
        `Exportdatum: ${fmt(data.exportedAt)}`,
        '',
        sep,
        'KONTOINFORMATION',
        sep,
        `E-postadress:          ${data.profile.email}`,
        `Konto skapat:          ${fmtD(data.profile.createdAt)}`,
        `E-post verifierad:     ${data.profile.emailVerified ? 'Ja' : 'Nej'}`,
        `Tvåfaktorsinloggning:  ${data.profile.twoFactorEnabled ? 'Aktiverad' : 'Ej aktiverad'}`,
        '',
      ]

      // Köptransaktioner
      lines.push(sep, `KÖPTRANSAKTIONER (${data.creditTransactions.length} st)`, sep)
      if (data.creditTransactions.length === 0) {
        lines.push('Inga transaktioner registrerade.')
      } else {
        lines.push('Datum                Beskrivning                              Belopp')
        lines.push('─────────────────────────────────────────────────────────────────')
        for (const t of data.creditTransactions) {
          const date = fmt(t.date).padEnd(21)
          const desc = t.description.padEnd(41)
          const amount = t.amountSek > 0 ? sek(t.amountSek) : 'Kostnadsfri'
          lines.push(`${date}${desc}${amount}`)
        }
      }
      lines.push('')

      // Prenumerationer
      lines.push(sep, `PRENUMERATIONER (${data.subscriptions.length} st)`, sep)
      if (data.subscriptions.length === 0) {
        lines.push('Inga prenumerationer registrerade.')
      } else {
        for (const s of data.subscriptions) {
          lines.push(`Plan:    ${s.tier === 'Pro' ? 'Månadsplan (obegränsade sökningar)' : s.tier}`)
          lines.push(`Status:  ${s.isActive ? 'Aktiv' : 'Avslutad'}`)
          lines.push(`Start:   ${fmtD(s.startDate)}`)
          if (s.endDate) lines.push(`Slut:    ${fmtD(s.endDate)}`)
          lines.push('')
        }
      }

      // Sökhistorik
      lines.push(sep, `SÖKHISTORIK (${data.searchHistory.length} sökningar)`, sep)
      if (data.searchHistory.length === 0) {
        lines.push('Ingen sökhistorik registrerad.')
      } else {
        for (const s of data.searchHistory) {
          lines.push(`${fmt(s.searchedAt)}    Analys-ID: ${s.carId}`)
        }
      }
      lines.push('')

      // Favoriter
      lines.push(sep, `SPARADE FAVORITER (${data.favorites.length} st)`, sep)
      if (data.favorites.length === 0) {
        lines.push('Inga sparade favoriter.')
      } else {
        for (const f of data.favorites) {
          lines.push(`${fmt(f.createdAt)}    Analys-ID: ${f.carId}`)
        }
      }
      lines.push('')

      // Footer
      lines.push(sep)
      lines.push('Frågor om denna export? Kontakta support@carcheck.se')
      lines.push(sep)

      const text = lines.join('\n')
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `carcheck-export-${new Date().toISOString().split('T')[0]}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exporterad')
    } catch {
      toast.error('Kunde inte exportera data')
    } finally {
      setExporting(false)
    }
  }

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteReasonOther, setDeleteReasonOther] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deletingRef = useRef(false)

  const handleDelete = async () => {
    if (deletingRef.current) return
    deletingRef.current = true
    setDeleteError(null)
    setDeleting(true)
    const reason = deleteReason === 'other'
      ? (deleteReasonOther.trim() || 'other')
      : deleteReason || undefined
    try {
      await gdprApi.deleteAccount({ password: deletePassword, reason })
      clearTokens()
      navigate('/')
      toast.success('Ditt konto har raderats')
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      setDeleteError(axiosErr.response?.data?.error || 'Kunde inte radera konto')
    } finally {
      deletingRef.current = false
      setDeleting(false)
    }
  }

  const handleDeleteOpenChange = (open: boolean) => {
    setDeleteOpen(open)
    if (!open) {
      setDeleteStep(1)
      setDeletePassword('')
      setDeleteReason('')
      setDeleteReasonOther('')
      setDeleteError(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inställningar</h1>
        <p className="text-muted-foreground">Hantera ditt konto</p>
      </div>

      {/* Guide & hjälp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            Guide & hjälp
          </CardTitle>
          <CardDescription>Lär dig använda CarCheck</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Visa guide igen</p>
              <p className="text-sm text-muted-foreground">
                Gå igenom introduktionen steg för steg
              </p>
            </div>
            <Button variant="outline" onClick={startTour}>
              <BookOpen className="mr-2 h-4 w-4" />
              Starta guide
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Ändra lösenord
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onChangePassword)} className="max-w-md space-y-4">
            {pwError && (
              <Alert variant="destructive">
                <AlertDescription>{pwError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
              <Input id="currentPassword" type="password" {...register('currentPassword')} />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nytt lösenord</Label>
              <Input id="newPassword" type="password" {...register('newPassword')} />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Bekräfta nytt lösenord</Label>
              <Input id="confirmNewPassword" type="password" {...register('confirmNewPassword')} />
              {errors.confirmNewPassword && (
                <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={pwSubmitting}>
              {pwSubmitting ? 'Sparar...' : 'Ändra lösenord'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* GDPR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            GDPR & Integritet
          </CardTitle>
          <CardDescription>Hantera dina personuppgifter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exportera mina data</p>
              <p className="text-sm text-muted-foreground">
                Ladda ner en fil med all data kopplad till ditt konto
              </p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporterar...' : 'Exportera'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Radera mitt konto</p>
              <p className="text-sm text-muted-foreground">
                Permanent radering av konto och all kopplad data
              </p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Radera konto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog — step 1: password + reason */}
      <Dialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent>
          {deleteStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>Radera konto</DialogTitle>
                <DialogDescription>
                  Ditt konto, all historik, favoriter och kvarvarande krediter raderas permanent.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {deleteError && (
                  <Alert variant="destructive">
                    <AlertDescription>{deleteError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">Bekräfta med ditt lösenord</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Ditt lösenord"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Anledning (valfritt)</Label>
                  <div className="space-y-2 text-sm">
                    {[
                      { value: 'no_value', label: 'Hittade inte vad jag sökte' },
                      { value: 'too_expensive', label: 'För dyrt' },
                      { value: 'not_using', label: 'Använder inte tjänsten längre' },
                      { value: 'other', label: 'Annan anledning' },
                    ].map((option) => (
                      <div key={option.value}>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name="deleteReason"
                            value={option.value}
                            checked={deleteReason === option.value}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            className="accent-destructive"
                          />
                          {option.label}
                        </label>
                        {option.value === 'other' && deleteReason === 'other' && (
                          <textarea
                            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={2}
                            placeholder="Berätta gärna mer..."
                            value={deleteReasonOther}
                            onChange={(e) => setDeleteReasonOther(e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleDeleteOpenChange(false)}>
                  Avbryt
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { setDeleteError(null); setDeleteStep(2) }}
                  disabled={!deletePassword}
                >
                  Fortsätt
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Är du helt säker?</DialogTitle>
                <DialogDescription>
                  Den här åtgärden kan inte ångras. Ditt konto och all data raderas omedelbart och
                  permanent. Det finns ingen väg tillbaka.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive space-y-1">
                <p>Allt raderas: historik, favoriter och eventuella kvarvarande sökningar.</p>
                {(sub?.credits ?? 0) > 0 && (
                  <p className="font-semibold">
                    Du har {sub!.credits} {sub!.credits === 1 ? 'sökning' : 'sökningar'} kvar som
                    försvinner permanent vid radering.
                  </p>
                )}
              </div>
              {deleteError && (
                <Alert variant="destructive">
                  <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteStep(1)}>
                  Tillbaka
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Raderar...' : 'Ja, radera mitt konto'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
