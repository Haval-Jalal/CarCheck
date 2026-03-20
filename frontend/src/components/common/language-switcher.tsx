import { useTranslation } from 'react-i18next'
import { ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Inline SVG flags — renders correctly on all platforms including Windows
function FlagSE({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-5 rounded-[2px]', className)} viewBox="0 0 20 15" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="15" fill="#006AA7" />
      <rect x="5" width="3" height="15" fill="#FECC02" />
      <rect y="6" width="20" height="3" fill="#FECC02" />
    </svg>
  )
}

function FlagGB({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-5 rounded-[2px]', className)} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

const LANGS = [
  { code: 'sv', Flag: FlagSE, label: 'Svenska' },
  { code: 'en', Flag: FlagGB, label: 'English' },
] as const

interface LanguageSwitcherProps {
  /** 'dark' for header/landing dark bg, 'light' for light bg contexts */
  variant?: 'dark' | 'light'
}

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith('en') ? 'en' : 'sv'
  const currentLang = LANGS.find(l => l.code === current)!

  const buttonLabel = current === 'en' ? 'Language' : 'Språk'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none transition-all duration-200',
            variant === 'dark'
              ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          <currentLang.Flag />
          <span className="hidden sm:inline">{buttonLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[130px]">
        {LANGS.map(({ code, Flag, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => i18n.changeLanguage(code)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <Flag />
            <span className="flex-1 text-sm">{label}</span>
            {current === code && <Check className="h-3.5 w-3.5 text-blue-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
