import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Users, Mail, Trash2, Crown, Plus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  useCompany,
  useCreateCompany,
  useInviteMember,
  useRemoveMember,
} from '@/hooks/use-company'
import { COMPANY_MEMBER_ROLE, roleLabel } from '@/types/company.types'
import type { CompanyMemberRole } from '@/types/company.types'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

// ── Schemas ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(2, 'Minst 2 tecken').max(200, 'Max 200 tecken'),
  orgNumber: z.string().max(20).optional(),
})
type CreateForm = z.infer<typeof createSchema>

const inviteSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  role: z.coerce.number().pipe(z.union([z.literal(0), z.literal(1)])),
})
type InviteForm = z.infer<typeof inviteSchema>

// ── Main component ────────────────────────────────────────────────────────────

export function CompanyAdminPage() {
  const { data: company, isLoading, error } = useCompany()
  const createCompany = useCreateCompany()

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!company && !isLoading) {
    return <CreateCompanyForm onCreated={() => {}} isPending={createCompany.isPending} />
  }

  if (error && !company) {
    return <CreateCompanyForm onCreated={() => {}} isPending={createCompany.isPending} />
  }

  return <CompanyDashboard />
}

// ── Create company form ───────────────────────────────────────────────────────

function CreateCompanyForm({ onCreated, isPending }: { onCreated: () => void; isPending: boolean }) {
  const createCompany = useCreateCompany()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  })

  const onSubmit = async (data: CreateForm) => {
    setServerError(null)
    try {
      await createCompany.mutateAsync({ name: data.name, orgNumber: data.orgNumber || undefined })
      toast.success('Företagskonto skapat!')
      onCreated()
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      setServerError(axiosErr.response?.data?.error ?? 'Något gick fel.')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Skapa företagskonto</h1>
        <p className="text-sm text-muted-foreground">
          Bjud in kollegor, dela sökningar och hantera prenumeration gemensamt.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Företagsnamn *</Label>
              <Input id="name" placeholder="Björks Bil AB" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="orgNumber">Organisationsnummer</Label>
              <Input id="orgNumber" placeholder="556xxx-xxxx" {...register('orgNumber')} />
              {errors.orgNumber && <p className="text-xs text-destructive">{errors.orgNumber.message}</p>}
            </div>
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={createCompany.isPending}>
              {createCompany.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Skapa företagskonto
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Company dashboard ─────────────────────────────────────────────────────────

function CompanyDashboard() {
  const { data: company } = useCompany()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<{ memberId: string; email: string } | null>(null)
  const removeMember = useRemoveMember()

  if (!company) return null

  const handleRemove = async () => {
    if (!confirmRemove) return
    try {
      await removeMember.mutateAsync(confirmRemove.memberId)
      toast.success(`${confirmRemove.email} har tagits bort.`)
      setConfirmRemove(null)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      toast.error(axiosErr.response?.data?.error ?? 'Kunde inte ta bort medlemmen.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-400" />
            <h1 className="text-2xl font-bold">{company.name}</h1>
          </div>
          {company.orgNumber && (
            <p className="text-sm text-muted-foreground">Org.nr: {company.orgNumber}</p>
          )}
        </div>
        <Button onClick={() => setShowInviteDialog(true)} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Bjud in
        </Button>
      </div>

      {/* Members */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Medlemmar ({company.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          {company.members.map((member, i) => (
            <div key={member.memberId}>
              {i > 0 && <Separator className="my-1" />}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{member.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Gick med {formatDate(member.joinedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === COMPANY_MEMBER_ROLE.ADMIN ? 'default' : 'secondary'}
                    className={member.role === COMPANY_MEMBER_ROLE.ADMIN ? 'bg-blue-600 hover:bg-blue-600' : ''}>
                    {member.role === COMPANY_MEMBER_ROLE.ADMIN && <Crown className="mr-1 h-3 w-3" />}
                    {roleLabel(member.role)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmRemove({ memberId: member.memberId, email: member.email })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending invites */}
      {company.pendingInvites.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Väntande inbjudningar ({company.pendingInvites.length})
            </CardTitle>
            <CardDescription>Inbjudningar som ännu inte accepterats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {company.pendingInvites.map((invite, i) => (
              <div key={invite.inviteId}>
                {i > 0 && <Separator className="my-1" />}
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Går ut {formatDate(invite.expiresAt)}
                    </p>
                  </div>
                  <Badge variant="outline">{roleLabel(invite.role)}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invite dialog */}
      <InviteDialog open={showInviteDialog} onClose={() => setShowInviteDialog(false)} />

      {/* Remove confirm dialog */}
      <Dialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta bort medlem?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmRemove?.email} kommer att tas bort från företaget och förlora åtkomst till bolagets prenumeration.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>Avbryt</Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removeMember.isPending}
            >
              {removeMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ta bort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Invite dialog ─────────────────────────────────────────────────────────────

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inviteMember = useInviteMember()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: COMPANY_MEMBER_ROLE.MEMBER },
  })

  const onSubmit = async (data: InviteForm) => {
    setServerError(null)
    try {
      await inviteMember.mutateAsync({ email: data.email, role: data.role as CompanyMemberRole })
      toast.success(`Inbjudan skickad till ${data.email}`)
      reset()
      onClose()
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      setServerError(axiosErr.response?.data?.error ?? 'Kunde inte skicka inbjudan.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setServerError(null); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bjud in en kollega</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">E-postadress</Label>
            <Input id="invite-email" type="email" placeholder="kollega@foretag.se" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Roll</Label>
            <select
              id="invite-role"
              {...register('role')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={COMPANY_MEMBER_ROLE.MEMBER}>Medlem</option>
              <option value={COMPANY_MEMBER_ROLE.ADMIN}>Administratör</option>
            </select>
          </div>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); setServerError(null); onClose() }}>
              Avbryt
            </Button>
            <Button type="submit" disabled={inviteMember.isPending}>
              {inviteMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Skicka inbjudan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
