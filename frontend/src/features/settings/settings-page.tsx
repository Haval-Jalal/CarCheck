import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      toast.success(t('settings.password.success'))
      setTimeout(() => {
        clearTokens()
        navigate('/login')
      }, 2000)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      setPwError(axiosErr.response?.data?.error || t('settings.password.error'))
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
      toast.success(t('settings.gdpr.exportSuccess'))
    } catch {
      toast.error(t('settings.gdpr.exportError'))
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
      toast.success(t('settings.delete.success'))
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      setDeleteError(axiosErr.response?.data?.error || t('settings.delete.error'))
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

  const deleteReasons = [
    { value: 'no_value',     label: t('settings.delete.reasons.no_value') },
    { value: 'too_expensive', label: t('settings.delete.reasons.too_expensive') },
    { value: 'not_using',    label: t('settings.delete.reasons.not_using') },
    { value: 'other',        label: t('settings.delete.reasons.other') },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      {/* Guide & hjälp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            {t('settings.guide.title')}
          </CardTitle>
          <CardDescription>{t('settings.guide.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.guide.label')}</p>
              <p className="text-sm text-muted-foreground">
                {t('settings.guide.sublabel')}
              </p>
            </div>
            <Button variant="outline" onClick={startTour} className="transition-all duration-200">
              <BookOpen className="mr-2 h-4 w-4" />
              {t('settings.guide.button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            {t('settings.password.title')}
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
              <Label htmlFor="currentPassword">{t('settings.password.current')}</Label>
              <Input id="currentPassword" type="password" {...register('currentPassword')} />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('settings.password.new')}</Label>
              <Input id="newPassword" type="password" {...register('newPassword')} />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">{t('settings.password.confirm')}</Label>
              <Input id="confirmNewPassword" type="password" {...register('confirmNewPassword')} />
              {errors.confirmNewPassword && (
                <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={pwSubmitting} className="transition-all duration-200">
              {pwSubmitting ? t('settings.password.submitting') : t('settings.password.submit')}
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
            {t('settings.gdpr.title')}
          </CardTitle>
          <CardDescription>{t('settings.gdpr.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.gdpr.exportLabel')}</p>
              <p className="text-sm text-muted-foreground">
                {t('settings.gdpr.exportSub')}
              </p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={exporting} className="transition-all duration-200">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? t('settings.gdpr.exporting') : t('settings.gdpr.exportButton')}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">{t('settings.gdpr.deleteLabel')}</p>
              <p className="text-sm text-muted-foreground">
                {t('settings.gdpr.deleteSub')}
              </p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="transition-all duration-200">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('settings.gdpr.deleteButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent>
          {deleteStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>{t('settings.delete.step1Title')}</DialogTitle>
                <DialogDescription>
                  {t('settings.delete.step1Description')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {deleteError && (
                  <Alert variant="destructive">
                    <AlertDescription>{deleteError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">{t('settings.delete.passwordLabel')}</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder={t('settings.delete.passwordPlaceholder')}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t('settings.delete.reasonLabel')}</Label>
                  <div className="space-y-2 text-sm">
                    {deleteReasons.map((option) => (
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
                            placeholder={t('settings.delete.otherPlaceholder')}
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
                  {t('settings.delete.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { setDeleteError(null); setDeleteStep(2) }}
                  disabled={!deletePassword}
                >
                  {t('settings.delete.continue')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t('settings.delete.step2Title')}</DialogTitle>
                <DialogDescription>
                  {t('settings.delete.step2Description')}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive space-y-1">
                <p>{t('settings.delete.warning')}</p>
                {(sub?.credits ?? 0) > 0 && (
                  <p className="font-semibold">
                    {t('settings.delete.creditsWarning_other', { count: sub!.credits })}
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
                  {t('settings.delete.back')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? t('settings.delete.confirming') : t('settings.delete.confirm')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
