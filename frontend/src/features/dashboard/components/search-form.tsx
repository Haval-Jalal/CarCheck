import { useState, useEffect } from 'react'
import { Search, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseRegFromUrl, isUrl } from '@/lib/parse-reg-from-url'

interface SearchFormProps {
  onSearch: (regNumber: string) => void
  isLoading: boolean
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [value, setValue] = useState('')
  const [urlHint, setUrlHint] = useState<string | null>(null)
  const [urlError, setUrlError] = useState(false)
  const [regError, setRegError] = useState(false)

  useEffect(() => {
    if (isUrl(value)) {
      const reg = parseRegFromUrl(value)
      if (reg) {
        setUrlHint(reg)
        setUrlError(false)
      } else {
        setUrlHint(null)
        setUrlError(true)
      }
    } else {
      setUrlHint(null)
      setUrlError(false)
    }
  }, [value])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return

    let reg: string
    if (isUrl(trimmed)) {
      const parsed = parseRegFromUrl(trimmed)
      if (!parsed) return
      reg = parsed
    } else {
      reg = trimmed.toUpperCase().replace(/\s/g, '')
      if (!/^[A-Z]{3}\d{3}$/.test(reg)) {
        setRegError(true)
        return
      }
    }

    setRegError(false)
    onSearch(reg)
  }

  const isInputUrl = isUrl(value)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="regNumber">Registreringsnummer eller annons-URL</Label>
        <div className="relative">
          {isInputUrl && (
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
          )}
          <Input
            id="regNumber"
            placeholder="ABC 123 eller klistra in Blocket/Bytbil-länk"
            autoComplete="off"
            className={isInputUrl ? 'pl-9 font-normal' : 'uppercase'}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setRegError(false)
            }}
          />
        </div>
        {urlHint && (
          <p className="flex items-center gap-1.5 text-sm text-blue-500">
            <LinkIcon className="h-3.5 w-3.5" />
            Hittade regnummer: <strong>{urlHint.slice(0, 3)} {urlHint.slice(3)}</strong>
          </p>
        )}
        {urlError && (
          <p className="text-sm text-destructive">
            Kunde inte hitta ett regnummer i länken. Ange regnumret manuellt (t.ex. ABC 123).
          </p>
        )}
        {regError && (
          <p className="text-sm text-destructive">
            Ogiltigt regnummer. Använd formatet ABC 123.
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isLoading || urlError || (isInputUrl && !urlHint)}
        className="sm:w-auto"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Söker...' : 'Sök'}
      </Button>
    </form>
  )
}
