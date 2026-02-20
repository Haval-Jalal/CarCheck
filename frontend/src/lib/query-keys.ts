export const queryKeys = {
  cars: {
    all: ['cars'] as const,
    byId: (carId: string) => ['cars', carId] as const,
    analysis: (carId: string) => ['cars', carId, 'analysis'] as const,
  },
  history: {
    all: ['history'] as const,
    list: (page: number, pageSize: number) => ['history', { page, pageSize }] as const,
  },
  favorites: {
    all: ['favorites'] as const,
    list: (page: number, pageSize: number) => ['favorites', { page, pageSize }] as const,
    check: (carId: string) => ['favorites', 'check', carId] as const,
  },
  billing: {
    tiers: ['billing', 'tiers'] as const,
    subscription: ['billing', 'subscription'] as const,
  },
}
