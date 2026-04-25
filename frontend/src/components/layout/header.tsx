import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Car, LogOut, Settings, History, Heart, CreditCard,
  Sun, Moon, ArrowUpDown, Menu, X, Search, Loader2, Zap, Building2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { useCarSearch } from '@/hooks/use-car-search'
import { useCompany } from '@/hooks/use-company'
import { useQuotaStore } from '@/stores/quota.store'
import { useSubscription } from '@/hooks/use-billing'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { cn } from '@/lib/utils'

function HeaderSearch() {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  const search = useCarSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const reg = value.trim()
    if (!reg || search.isPending) return
    search.mutate(
      { registrationNumber: reg },
      {
        onSuccess: (data) => {
          setValue('')
          inputRef.current?.blur()
          navigate(`/car/${data.carId}/analysis`, { state: { car: data } })
        },
        onError: (err) => {
          const msg = (err as AxiosError<ApiError>).response?.data?.error
            ?? t('dashboard.searchFailed')
          toast.error(msg)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="hidden md:flex" data-tour="header-search">
      <div className="flex items-center rounded-xl border border-white/10 bg-white/5 transition-all duration-200 focus-within:border-blue-500/60 focus-within:bg-white/8 hover:border-white/15">
        <Search className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="ABC 123"
          maxLength={10}
          className="w-28 bg-transparent py-1.5 pl-2 pr-1 text-sm font-mono font-bold tracking-widest text-white placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim() || search.isPending}
          className="mr-1 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-300 transition-all duration-200 hover:bg-slate-700 disabled:opacity-40"
        >
          {search.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('landing.searchButton')}
        </button>
      </div>
    </form>
  )
}

function CreditsChip() {
  const quota = useQuotaStore((s) => s.quota)
  if (!quota || quota.limit === 'unlimited') return null

  const label = quota.limit === 'credits'
    ? `${quota.remaining}`
    : `${quota.remaining}/${quota.limit}`

  return (
    <Link
      to="/billing"
      data-tour="credits-chip"
      className="flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 transition-all duration-200 hover:bg-blue-500/20"
    >
      <Zap className="h-3 w-3" />
      {label}
    </Link>
  )
}

export function Header() {
  const { t } = useTranslation()
  const { userEmail, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: sub } = useSubscription()
  const { data: company } = useCompany()
  const hasCompany = !!company

  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : '??'

  const NAV_LINKS = [
    { to: '/history',       label: t('nav.history'),   icon: History },
    { to: '/favorites',     label: t('nav.favorites'),  icon: Heart },
    { to: '/compare',       label: t('nav.compare'),    icon: ArrowUpDown },
    ...(hasCompany ? [{ to: '/company/admin', label: 'Företag', icon: Building2 }] : []),
    { to: '/billing',       label: t('nav.billing'),    icon: CreditCard },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080c18]/90 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex shrink-0 items-center gap-2 font-bold text-white transition-all duration-200 hover:opacity-80"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
            <Car className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <span className="hidden sm:inline text-sm tracking-tight">CarCheck</span>
        </Link>

        {/* Header search (desktop) */}
        <HeaderSearch />

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-1 md:flex" data-tour="nav-links">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Button
              key={to}
              variant="ghost"
              size="sm"
              className={cn(
                'text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white',
                location.pathname === to && 'bg-white/10 text-white'
              )}
              asChild
            >
              <Link to={to}>
                <Icon className="mr-1 h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Credits chip */}
          <CreditsChip />

          {/* Language switcher */}
          <LanguageSwitcher variant="dark" />

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white"
            aria-label={t('nav.toggleTheme')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Avatar dropdown (desktop) */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full transition-all duration-200 hover:bg-white/8">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-xs text-white">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">{userEmail}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Hamburger (mobile only) */}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white md:hidden"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#080c18]/95 px-4 pb-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white',
                location.pathname === '/dashboard' && 'bg-slate-700 text-white'
              )}
            >
              <Search className="h-4 w-4" />
              {t('nav.search')}
            </Link>
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white',
                  location.pathname === to && 'bg-slate-700 text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 border-t border-white/5 pt-3">
            <div className="mb-2 px-3 text-xs text-slate-500 truncate">{userEmail}</div>
            <Link
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-white/8 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              {t('nav.settings')}
            </Link>
            <button
              onClick={() => { setMobileOpen(false); void logout() }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-white/8"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </button>
            {/* Language switcher in mobile drawer */}
            <div className="mt-2 px-3">
              <LanguageSwitcher variant="dark" />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
