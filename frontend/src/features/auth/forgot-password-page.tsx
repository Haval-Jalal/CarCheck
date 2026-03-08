import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authApi } from '@/api/auth.api'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators'

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    try {
      await authApi.forgotPassword(data)
    } finally {
      // Always show confirmation regardless of outcome (security: no user enumeration)
      setSubmitted(true)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-blue-400" />
          <span className="text-base font-bold">CarCheck</span>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Kolla din e-post</h1>
              <p className="text-sm text-muted-foreground">
                Om e-postadressen finns registrerad har vi skickat en länk för att återställa lösenordet. Länken gäller i 1 timme.
              </p>
            </div>
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka till inloggning
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Glömt lösenord?</h1>
              <p className="text-sm text-muted-foreground">
                Ange din e-postadress så skickar vi en återställningslänk.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="namn@exempel.se"
                  autoComplete="email"
                  autoFocus
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Skickar...' : 'Skicka återställningslänk'}
              </Button>
            </form>

            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka till inloggning
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
