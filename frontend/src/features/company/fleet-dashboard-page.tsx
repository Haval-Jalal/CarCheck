import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import {
  Car, Plus, Trash2, Loader2, AlertCircle, ShieldCheck,
  ShieldAlert, XCircle, Clock, HelpCircle, ArrowLeft, FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useFleet, useAddFleetVehicle, useRemoveFleetVehicle } from '@/hooks/use-fleet'
import type { FleetVehicleResponse, FleetVehicleStatus } from '@/types/fleet.types'
import type { ApiError } from '@/types/api.types'

// ── Add vehicle form ──────────────────────────────────────────────────────────

const addSchema = z.object({
  registrationNumber: z.string()
    .min(1, 'Regnummer krävs')
    .regex(/^[A-Za-z]{3}[0-9]{2}[A-Za-z0-9]$/, 'Ogiltigt format (ex: ABC123)'),
  nickname: z.string().max(100).optional(),
})
type AddForm = z.infer<typeof addSchema>

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FleetVehicleStatus, {
  label: string; icon: typeof ShieldCheck; color: string; badge: string
}> = {
  Ok:             { label: 'OK',              icon: ShieldCheck,  color: 'text-green-600',  badge: 'bg-green-600' },
  NeedsAttention: { label: 'Behöver åtgärd',  icon: ShieldAlert,  color: 'text-yellow-600', badge: 'bg-yellow-600' },
  Critical:       { label: 'Kritisk',          icon: XCircle,      color: 'text-red-600',    badge: 'bg-red-600' },
  NotAnalyzed:    { label: 'Ej analyserad',    icon: HelpCircle,   color: 'text-gray-400',   badge: 'bg-gray-400' },
  StaleData:      { label: 'Inaktuell data',   icon: Clock,        color: 'text-orange-500', badge: 'bg-orange-500' },
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function FleetDashboardPage() {
  const { data: vehicles, isLoading, error } = useFleet()
  const [addOpen, setAddOpen] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center p-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-lg font-semibold">Kunde inte ladda flottan</p>
        <p className="text-sm text-muted-foreground">Du måste tillhöra ett företag för att se flottan.</p>
        <Link to="/company/admin">
          <Button variant="outline" size="sm">Gå till företagspanel</Button>
        </Link>
      </div>
    )
  }

  const summary = {
    total: vehicles?.length ?? 0,
    ok: vehicles?.filter(v => v.status === 'Ok').length ?? 0,
    attention: vehicles?.filter(v => v.status === 'NeedsAttention' || v.status === 'Critical').length ?? 0,
    unanalyzed: vehicles?.filter(v => v.status === 'NotAnalyzed' || v.status === 'StaleData').length ?? 0,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/company/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Flottan</h1>
            <p className="text-sm text-muted-foreground">{summary.total} fordon</p>
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Lägg till fordon
        </Button>
      </div>

      {/* Summary chips */}
      {summary.total > 0 && (
        <div className="flex flex-wrap gap-3">
          <SummaryChip label="OK" count={summary.ok} color="text-green-600 bg-green-50 border-green-200" />
          <SummaryChip label="Kräver åtgärd" count={summary.attention} color="text-red-600 bg-red-50 border-red-200" />
          <SummaryChip label="Ej analyserade" count={summary.unanalyzed} color="text-gray-500 bg-gray-50 border-gray-200" />
        </div>
      )}

      {/* Vehicle list */}
      {vehicles && vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center border rounded-xl border-dashed">
          <Car className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Inga fordon i flottan ännu.</p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Lägg till första fordonet
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles?.map(v => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onRemove={() => setRemoveId(v.id)}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <AddVehicleDialog open={addOpen} onClose={() => setAddOpen(false)} />

      {/* Remove confirm dialog */}
      <RemoveDialog
        vehicleId={removeId}
        vehicle={vehicles?.find(v => v.id === removeId) ?? null}
        onClose={() => setRemoveId(null)}
      />
    </div>
  )
}

// ── Summary chip ──────────────────────────────────────────────────────────────

function SummaryChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium', color)}>
      <span className="font-bold tabular-nums">{count}</span>
      <span>{label}</span>
    </div>
  )
}

// ── Vehicle card ──────────────────────────────────────────────────────────────

function VehicleCard({ vehicle, onRemove }: { vehicle: FleetVehicleResponse; onRemove: () => void }) {
  const cfg = STATUS_CONFIG[vehicle.status]
  const Icon = cfg.icon

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3 hover:bg-accent/30 transition-colors">
      <Icon className={cn('h-5 w-5 shrink-0', cfg.color)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-sm">{vehicle.registrationNumber}</span>
          {vehicle.nickname && (
            <span className="text-sm text-muted-foreground">— {vehicle.nickname}</span>
          )}
          <Badge className={cn('text-white text-xs px-2 py-0', cfg.badge)}>
            {cfg.label}
          </Badge>
        </div>
        {vehicle.latestScore != null ? (
          <p className="text-xs text-muted-foreground mt-0.5">
            Poäng: <span className="font-semibold">{Math.round(vehicle.latestScore)}</span>
            {vehicle.analyzedAt && ` · ${new Date(vehicle.analyzedAt).toLocaleDateString('sv-SE')}`}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">Ingen analys genomförd</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {vehicle.latestScore != null && (
          <Link to={`/business/report/${vehicle.registrationNumber}`}>
            <Button variant="ghost" size="icon" title="Dealer-rapport">
              <FileText className="h-4 w-4 text-blue-500" />
            </Button>
          </Link>
        )}
        <Link to={`/dashboard`} state={{ pendingSearch: vehicle.registrationNumber }}>
          <Button variant="ghost" size="sm" className="text-xs">
            Analysera
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={onRemove} title="Ta bort">
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
        </Button>
      </div>
    </div>
  )
}

// ── Add vehicle dialog ────────────────────────────────────────────────────────

function AddVehicleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addVehicle = useAddFleetVehicle()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
  })

  const onSubmit = async (data: AddForm) => {
    setServerError(null)
    try {
      await addVehicle.mutateAsync({
        registrationNumber: data.registrationNumber.toUpperCase().trim(),
        nickname: data.nickname || undefined,
      })
      toast.success(`${data.registrationNumber.toUpperCase()} lades till i flottan`)
      reset()
      onClose()
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      setServerError(axiosErr.response?.data?.error ?? 'Kunde inte lägga till fordonet.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setServerError(null); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lägg till fordon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reg">Regnummer</Label>
            <Input
              id="reg"
              placeholder="ABC123"
              className="uppercase"
              {...register('registrationNumber')}
            />
            {errors.registrationNumber && (
              <p className="text-xs text-destructive">{errors.registrationNumber.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nickname">Smeknamn <span className="text-muted-foreground">(valfritt)</span></Label>
            <Input id="nickname" placeholder="ex: Säljbil 1" {...register('nickname')} />
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); setServerError(null); onClose() }}>
              Avbryt
            </Button>
            <Button type="submit" disabled={addVehicle.isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
              {addVehicle.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lägg till
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Remove confirm dialog ─────────────────────────────────────────────────────

function RemoveDialog({
  vehicleId, vehicle, onClose,
}: { vehicleId: string | null; vehicle: FleetVehicleResponse | null; onClose: () => void }) {
  const removeVehicle = useRemoveFleetVehicle()

  const handleRemove = async () => {
    if (!vehicleId) return
    try {
      await removeVehicle.mutateAsync(vehicleId)
      toast.success('Fordonet har tagits bort')
      onClose()
    } catch {
      toast.error('Kunde inte ta bort fordonet')
    }
  }

  return (
    <Dialog open={!!vehicleId} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ta bort fordon</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Vill du ta bort{' '}
          <span className="font-mono font-bold text-foreground">{vehicle?.registrationNumber}</span>
          {vehicle?.nickname && ` (${vehicle.nickname})`} från flottan?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Avbryt</Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={removeVehicle.isPending}
          >
            {removeVehicle.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ta bort
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
