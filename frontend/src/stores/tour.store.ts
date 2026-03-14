import { create } from 'zustand'

const TOUR_KEY = 'carcheck-tour-v1'

interface TourStore {
  isActive: boolean
  startTour: () => void
  completeTour: () => void
}

export const useTourStore = create<TourStore>((set) => ({
  isActive: !localStorage.getItem(TOUR_KEY),
  startTour: () => {
    localStorage.removeItem(TOUR_KEY)
    set({ isActive: true })
  },
  completeTour: () => {
    localStorage.setItem(TOUR_KEY, 'done')
    set({ isActive: false })
  },
}))
