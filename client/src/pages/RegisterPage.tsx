import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const schema = z
  .object({
    name: z.string().min(1, 'Введите имя'),
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    password: z.string().min(6, 'Минимум 6 символов'),
    confirmPassword: z.string(),
    height_cm: z
      .string()
      .optional()
      .refine((s) => !s || s === '' || (parseInt(s, 10) >= 100 && parseInt(s, 10) <= 250), '100–250 см'),
    weight_kg: z
      .string()
      .optional()
      .refine((s) => !s || s === '' || (parseFloat(s) >= 30 && parseFloat(s) <= 200), '30–200 кг'),
    birth_date: z.string().optional().or(z.literal('')),
    gender: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    try {
      const { token } = await api.register({
        name: data.name,
        email: data.email,
        password: data.password,
        height_cm: data.height_cm && data.height_cm !== '' ? parseInt(data.height_cm, 10) : undefined,
        weight_kg: data.weight_kg && data.weight_kg !== '' ? parseFloat(data.weight_kg) : undefined,
        birth_date: data.birth_date && data.birth_date !== '' ? data.birth_date : undefined,
        gender: data.gender && data.gender !== '' ? data.gender : undefined,
      })
      login(token)
      queryClient.removeQueries({ queryKey: ['goal'] })
      navigate('/onboarding/goal', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка регистрации')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Создать аккаунт</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <p className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">
            {error}
          </p>
        )}
        <Input
          label="Имя"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Пароль"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Подтвердите пароль"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Input
          label="Рост (см)"
          type="number"
          error={errors.height_cm?.message}
          {...register('height_cm')}
        />
        <Input
          label="Вес (кг)"
          type="number"
          step="0.1"
          error={errors.weight_kg?.message}
          {...register('weight_kg')}
        />
        <Input
          label="Дата рождения"
          type="date"
          error={errors.birth_date?.message}
          {...register('birth_date')}
        />
        <Input
          label="Пол"
          type="text"
          placeholder="М/Ж или не указан"
          error={errors.gender?.message}
          {...register('gender')}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Зарегистрироваться
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-primary-600 hover:underline font-medium">
          Войти
        </Link>
      </p>
    </div>
  )
}
