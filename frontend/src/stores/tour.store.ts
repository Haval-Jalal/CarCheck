import { create } from 'zustand'
import apiClient from '@/api/client'

const TOUR_KEY = 'carcheck-tour-v1'

interface TourStore {
  isActive: boolean
  stepIndex: number
  /** Called once after auth resolves with the server-side flag. */
  initTour: (serverCompleted: boolean) => void
  startTour: () => void
  completeTour: () => void
  setStep: (index: number) => void
}

export const useTourStore = create<TourStore>((set) => ({
  // Start inactive — initTour() decides whether to show it after auth.
  isActive: false,
  stepIndex: 0,

  initTour: (serverCompleted) => {
    // If the server says completed, sync localStorage and stay inactive.
    if (serverCompleted) {
      localStorage.setItem(TOUR_KEY, 'done')
      return
    }
    // If neither the server nor localStorage has recorded completion, show the tour.
    if (!localStorage.getItem(TOUR_KEY)) {
      set({ isActive: true, stepIndex: 0 })
    }
  },

  startTour: () => {
    localStorage.removeItem(TOUR_KEY)
    set({ isActive: true, stepIndex: 0 })
  },

  completeTour: () => {
    localStorage.setItem(TOUR_KEY, 'done')
    set({ isActive: false, stepIndex: 0 })
    // Persist on the server so the tour stays dismissed across all devices.
    apiClient.post('/user/complete-tour').catch(() => {
      // Fire-and-forget — failure is non-critical.
    })
  },

  setStep: (index) => set({ stepIndex: index }),
}))
