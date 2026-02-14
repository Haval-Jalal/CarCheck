import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './protected-route'
import { PublicRoute } from './public-route'
import { AppShell } from '@/components/layout/app-shell'
import { LandingPage } from '@/features/landing/landing-page'
import { LoginPage } from '@/features/auth/login-page'
import { RegisterPage } from '@/features/auth/register-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { CarResultPage } from '@/features/car/car-result-page'
import { CarAnalysisPage } from '@/features/car/car-analysis-page'
import { HistoryPage } from '@/features/history/history-page'
import { FavoritesPage } from '@/features/favorites/favorites-page'
import { BillingPage } from '@/features/billing/billing-page'
import { SettingsPage } from '@/features/settings/settings-page'

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/car/:carId', element: <CarResultPage /> },
          { path: '/car/:carId/analysis', element: <CarAnalysisPage /> },
          { path: '/history', element: <HistoryPage /> },
          { path: '/favorites', element: <FavoritesPage /> },
          { path: '/billing', element: <BillingPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])
