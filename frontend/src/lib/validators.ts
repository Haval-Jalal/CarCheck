import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Lösenordet måste vara minst 8 tecken')
  .regex(/[0-9]/, 'Lösenordet måste innehålla minst en siffra')

export const loginSchema = z.object({
  email: z.string().email('Ange en giltig e-postadress'),
  password: z.string().min(1, 'Ange ditt lösenord'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Ange en giltig e-postadress'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Lösenorden matchar inte',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ange ditt nuvarande lösenord'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Lösenorden matchar inte',
    path: ['confirmNewPassword'],
  })

export const carSearchSchema = z.object({
  registrationNumber: z
    .string()
    .min(2, 'Minst 2 tecken')
    .max(10, 'Max 10 tecken')
    .regex(/^[A-Za-z0-9 ]+$/, 'Endast bokstäver, siffror och mellanslag'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Ange en giltig e-postadress'),
})

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Lösenorden matchar inte',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type CarSearchFormData = z.infer<typeof carSearchSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
