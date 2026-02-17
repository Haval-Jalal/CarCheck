import { useParams, useLocation, Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Car, Fuel, Palette, Gauge, Heart } from 'lucide-react'
import { formatSek, formatNumber } from '@/lib/format'
import { useCheckFavorite, useAddFavorite, useRemoveFavorite } from '@/hooks/use-favorites'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CarSearchResponse } from '@/types/car.types'

export function CarResultPage() {
  const { carId } = useParams<{ carId: string }>()
  const location = useLocation()
  const car = (location.state as { car?: CarSearchResponse })?.car
  const queryClient = useQueryClient()
  const { data: isFavorite } = useCheckFavorite(carId)
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const handleToggleFavorite = () => {
    if (!carId) return
    // Optimistic update
    queryClient.setQueryData(['favorite-check', carId], !isFavorite)
    if (isFavorite) {
      removeFavorite.mutate(carId, {
        onSuccess: () => toast.success('Borttagen från favoriter'),
        onError: () => {
          queryClient.setQueryData(['favorite-check', carId], true)
          toast.error('Kunde inte ta bort favorit')
        },
      })
    } else {
      addFavorite.mutate(carId, {
        onSuccess: () => toast.success('Sparad som favorit'),
        onError: () => {
          queryClient.setQueryData(['favorite-check', carId], false)
          toast.error('Kunde inte spara favorit')
        },
      })
    }
  }

  if (!car) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Bildata hittades inte. Gå tillbaka och sök igen.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Tillbaka</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{car.brand} {car.model}</h1>
          <p className="text-muted-foreground">Registreringsnummer: {car.registrationNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {car.registrationNumber}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={addFavorite.isPending || removeFavorite.isPending}
            aria-label={isFavorite ? 'Ta bort från favoriter' : 'Spara som favorit'}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
            />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4" />
              Fordonsinformation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Märke</dt>
                <dd className="font-medium">{car.brand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Modell</dt>
                <dd className="font-medium">{car.model}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Årsmodell</dt>
                <dd className="font-medium">{car.year}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Miltal</dt>
                <dd className="font-medium">{formatNumber(car.mileage)} km</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4" />
              Detaljer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {car.fuelType && (
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <Fuel className="h-3 w-3" /> Bränsle
                  </dt>
                  <dd className="font-medium">{car.fuelType}</dd>
                </div>
              )}
              {car.horsePower && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Hästkrafter</dt>
                  <dd className="font-medium">{car.horsePower} hk</dd>
                </div>
              )}
              {car.color && (
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <Palette className="h-3 w-3" /> Färg
                  </dt>
                  <dd className="font-medium">{car.color}</dd>
                </div>
              )}
              {car.marketValueSek != null && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Marknadsvärde</dt>
                  <dd className="font-semibold text-green-700">{formatSek(car.marketValueSek)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link to={`/car/${carId}/analysis`}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Visa analys
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/dashboard">Ny sökning</Link>
        </Button>
      </div>
    </div>
  )
}
