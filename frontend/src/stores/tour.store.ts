import { create } from 'zustand'

const TOUR_KEY = 'carcheck-tour-v1'

interface TourStore {
  isActive: boolean
  stepIndex: number
  startTour: () => void
  completeTour: () => void
  setStep: (index: number) => void
}

export const useTourStore = create<TourStore>((set) => ({
  isActive: !localStorage.getItem(TOUR_KEY),
  stepIndex: 0,
  startTour: () => {
    localStorage.removeItem(TOUR_KEY)
    set({ isActive: true, stepIndex: 0 })
  },
  completeTour: () => {
    localStorage.setItem(TOUR_KEY, 'done')
    set({ isActive: false, stepIndex: 0 })
  },
  setStep: (index) => set({ stepIndex: index }),
}))
