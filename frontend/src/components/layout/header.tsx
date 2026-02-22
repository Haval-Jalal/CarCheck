import { Link } from 'react-router'
import { Car, LogOut, Settings, History, Heart, CreditCard, Sun, Moon, ArrowUpDown } from 'lucide-react'
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

export function Header() {
  const { userEmail, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : '??'

  return (
    <header className="border-b border-slate-700 bg-slate-900">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-white">
          <Car className="h-5 w-5 text-blue-400" />
          <span>CarCheck</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 hover:text-white"
            asChild
          >
            <Link to="/dashboard">Sök</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 hover:text-white"
            asChild
          >
            <Link to="/history">
              <History className="mr-1 h-4 w-4" />
              Historik
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 hover:text-white"
            asChild
          >
            <Link to="/favorites">
              <Heart className="mr-1 h-4 w-4" />
              Favoriter
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 hover:text-white"
            asChild
          >
            <Link to="/compare">
              <ArrowUpDown className="mr-1 h-4 w-4" />
              Jämför
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 hover:text-white"
            asChild
          >
            <Link to="/billing">
              <CreditCard className="mr-1 h-4 w-4" />
              Abonnemang
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Växla tema"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-700">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-xs text-white">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {userEmail}
              </div>
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
      </div>
    </header>
  )
}
