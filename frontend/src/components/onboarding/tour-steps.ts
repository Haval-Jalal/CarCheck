export interface TourStep {
  id: string
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Välkommen till CarCheck',
    description: 'På under 30 sekunder vet du allt om en begagnad bil — skulder, köpspärr, skador och om priset är rimligt. Vi guidar dig igenom de viktigaste delarna.',
  },
  {
    id: 'search',
    title: 'Sök på valfri bil',
    description: 'Skriv in regnumret på bilen du vill kolla — med eller utan mellanslag. Du kan söka härifrån i headern, eller från startsidan.',
    target: 'header-search',
    position: 'bottom',
  },
  {
    id: 'credits',
    title: 'Dina sökningar',
    description: 'Här ser du hur många sökningar du har kvar. Du får 1 gratis sökning när du verifierar din e-post. Köp fler under Abonnemang när det behövs.',
    target: 'credits-chip',
    position: 'bottom',
  },
  {
    id: 'nav',
    title: 'Historik & Favoriter',
    description: 'Varje bil du sökt på sparas automatiskt i Historik. Markera bilar du vill hålla koll på som Favoriter — perfekt när du jämför flera alternativ innan du bestämmer dig.',
    target: 'nav-links',
    position: 'bottom',
  },
  {
    id: 'done',
    title: 'Du är redo!',
    description: 'Nu kan du använda CarCheck fullt ut. Vill du se den här guiden igen hittar du den under Inställningar. Lycka till med bilköpet!',
  },
]
