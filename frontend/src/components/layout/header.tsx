import { Link } from 'react-router'
import { Car, LogOut, Settings, History, Heart, CreditCard } from 'lucide-react'
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

export function Header() {
  const { userEmail, logout } = useAuth()

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : '??'

  return (
    <header className="border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Car className="h-5 w-5" />
          <span>CarCheck</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">Sök</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history">
              <History className="mr-1 h-4 w-4" />
              Historik
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/favorites">
              <Heart className="mr-1 h-4 w-4" />
              Favoriter
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/billing">
              <CreditCard className="mr-1 h-4 w-4" />
              Abonnemang
            </Link>
          </Button>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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
    </header>
  )
}
