import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  Car, LogOut, Settings, History, Heart, CreditCard,
  Sun, Moon, ArrowUpDown, Menu, X, Search,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Sök', icon: Search },
  { to: '/history', label: 'Historik', icon: History },
  { to: '/favorites', label: 'Favoriter', icon: Heart },
  { to: '/compare', label: 'Jämför', icon: ArrowUpDown },
  { to: '/billing', label: 'Abonnemang', icon: CreditCard },
]

export function Header() {
  const { userEmail, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : '??'

  return (
    <header className="border-b border-slate-700 bg-slate-900">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-semibold text-white"
          onClick={() => setMobileOpen(false)}
        >
          <Car className="h-5 w-5 text-blue-400" />
          <span>CarCheck</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Button
              key={to}
              variant="ghost"
              size="sm"
              className={cn(
                'text-slate-300 hover:bg-slate-700 hover:text-white',
                location.pathname === to && 'bg-slate-700 text-white'
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
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Växla tema"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Avatar dropdown (desktop) */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-700">
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
                    Inställningar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logga ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Hamburger (mobile only) */}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-slate-700 hover:text-white md:hidden"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Stäng meny' : 'Öppna meny'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-700 bg-slate-900 px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white',
                  location.pathname === to && 'bg-slate-700 text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 border-t border-slate-700 pt-3">
            <div className="mb-2 px-3 text-xs text-slate-500">{userEmail}</div>
            <Link
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Inställningar
            </Link>
            <button
              onClick={() => { setMobileOpen(false); void logout() }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
              Logga ut
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
