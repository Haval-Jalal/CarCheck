import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './protected-route'
import { PublicRoute } from './public-route'
import { AppShell } from '@/components/layout/app-shell'

const LandingPage = lazy(() => import('@/features/landing/landing-page').then(m => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('@/features/auth/login-page').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/register-page').then(m => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('@/features/dashboard/dashboard-page').then(m => ({ default: m.DashboardPage })))
const CarResultPage = lazy(() => import('@/features/car/car-result-page').then(m => ({ default: m.CarResultPage })))
const CarAnalysisPage = lazy(() => import('@/features/car/car-analysis-page').then(m => ({ default: m.CarAnalysisPage })))
const HistoryPage = lazy(() => import('@/features/history/history-page').then(m => ({ default: m.HistoryPage })))
const FavoritesPage = lazy(() => import('@/features/favorites/favorites-page').then(m => ({ default: m.FavoritesPage })))
const BillingPage = lazy(() => import('@/features/billing/billing-page').then(m => ({ default: m.BillingPage })))
const SettingsPage = lazy(() => import('@/features/settings/settings-page').then(m => ({ default: m.SettingsPage })))
const SharePage = lazy(() => import('@/features/share/share-page').then(m => ({ default: m.SharePage })))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/', element: <Lazy><LandingPage /></Lazy> },
      { path: '/login', element: <Lazy><LoginPage /></Lazy> },
      { path: '/register', element: <Lazy><RegisterPage /></Lazy> },
      { path: '/share/:carId', element: <Lazy><SharePage /></Lazy> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <Lazy><DashboardPage /></Lazy> },
          { path: '/car/:carId', element: <Lazy><CarResultPage /></Lazy> },
          { path: '/car/:carId/analysis', element: <Lazy><CarAnalysisPage /></Lazy> },
          { path: '/history', element: <Lazy><HistoryPage /></Lazy> },
          { path: '/favorites', element: <Lazy><FavoritesPage /></Lazy> },
          { path: '/billing', element: <Lazy><BillingPage /></Lazy> },
          { path: '/settings', element: <Lazy><SettingsPage /></Lazy> },
        ],
      },
    ],
  },
])
