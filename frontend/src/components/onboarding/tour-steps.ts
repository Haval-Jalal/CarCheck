export interface TourStep {
  id: string
  title: string
  description: string
  route: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    route: '/dashboard',
    title: 'Välkommen till CarCheck',
    description: 'På under 30 sekunder vet du allt om en begagnad bil — skulder, köpspärr, skador och om priset är rimligt. Vi guidar dig igenom de viktigaste delarna.',
  },
  {
    id: 'search',
    route: '/dashboard',
    title: 'Sök på valfri bil',
    description: 'Ange regnumret på bilen du vill kolla — med eller utan mellanslag. Du kan även klistra in en Blocket- eller Bytbil-länk så hittar vi regnumret automatiskt.',
    target: 'search-card',
    position: 'bottom',
  },
  {
    id: 'history',
    route: '/history',
    title: 'Din sökhistorik',
    description: 'Varje bil du sökt på sparas automatiskt här. Klicka på en bil för att se analysen igen — utan att använda en ny sökning.',
    target: 'history-header',
    position: 'bottom',
  },
  {
    id: 'favorites',
    route: '/favorites',
    title: 'Favoriter',
    description: 'Markera bilar du vill hålla koll på som favoriter direkt från analysresultatet. Perfekt när du jämför flera alternativ innan du bestämmer dig.',
    target: 'favorites-header',
    position: 'bottom',
  },
  {
    id: 'billing',
    route: '/billing',
    title: 'Sökningar & abonnemang',
    description: 'Här köper du fler sökningar eller uppgraderar till månadsplanen för obegränsade analyser. Nya användare får 1 gratis sökning vid e-postverifiering.',
    target: 'billing-plans',
    position: 'bottom',
  },
  {
    id: 'done',
    route: '/dashboard',
    title: 'Du är redo!',
    description: 'Nu kan du använda CarCheck fullt ut. Vill du se den här guiden igen hittar du den under Inställningar. Lycka till med bilköpet!',
  },
]
