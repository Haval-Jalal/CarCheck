import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Ange en giltig e-postadress'),
  password: z.string().min(1, 'Ange ditt lösenord'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Ange en giltig e-postadress'),
    password: z.string().min(8, 'Lösenordet måste vara minst 8 tecken'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Lösenorden matchar inte',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ange ditt nuvarande lösenord'),
    newPassword: z.string().min(8, 'Lösenordet måste vara minst 8 tecken'),
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

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type CarSearchFormData = z.infer<typeof carSearchSchema>
