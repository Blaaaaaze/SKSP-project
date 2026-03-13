import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const profileSchema = z.object({
  name: z.string().min(1, 'Введите имя'),
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

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfilePage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)

  const { data: user } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: api.getMe,
    retry: false,
  })

  const { data: goal } = useQuery({
    queryKey: ['goal'],
    queryFn: api.getCurrentGoal,
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      api.updateProfile({
        name: data.name,
        height_cm: data.height_cm && data.height_cm !== '' ? parseInt(data.height_cm, 10) : null,
        weight_kg: data.weight_kg && data.weight_kg !== '' ? parseFloat(data.weight_kg) : null,
        birth_date: data.birth_date && data.birth_date !== '' ? data.birth_date : null,
        gender: data.gender && data.gender !== '' ? data.gender : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      setEditing(false)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      height_cm: user?.height_cm != null ? String(user.height_cm) : '',
      weight_kg: user?.weight_kg != null ? String(user.weight_kg) : '',
      birth_date: user?.birth_date ?? '',
      gender: user?.gender ?? '',
    },
  })

  const startEdit = () => {
    reset({
      name: user?.name ?? '',
      height_cm: user?.height_cm != null ? String(user.height_cm) : '',
      weight_kg: user?.weight_kg != null ? String(user.weight_kg) : '',
      birth_date: user?.birth_date ?? '',
      gender: user?.gender ?? '',
    })
    setEditing(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Профиль</h1>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Данные аккаунта</h3>
        {user ? (
          editing ? (
            <form
              onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
              className="space-y-6"
            >
              <Input
                label="Имя"
                type="text"
                error={errors.name?.message}
                {...register('name')}
              />
              <div className="text-slate-600 text-sm">
                <span className="text-slate-500">Email:</span> {user.email}
                <span className="ml-2 text-slate-400 text-xs">(не редактируется)</span>
              </div>
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
              {updateMutation.error && (
                <p className="text-sm text-red-600" role="alert">
                  {updateMutation.error.message}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" isLoading={updateMutation.isPending}>
                  Сохранить
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-800">
                <span className="text-slate-500 text-sm">Имя:</span> {user.name}
              </p>
              <p className="text-slate-800">
                <span className="text-slate-500 text-sm">Email:</span> {user.email}
                <span className="ml-2 text-slate-400 text-xs">(не редактируется)</span>
              </p>
              {user.height_cm != null && (
                <p className="text-slate-800">
                  <span className="text-slate-500 text-sm">Рост:</span> {user.height_cm} см
                </p>
              )}
              {user.weight_kg != null && (
                <p className="text-slate-800">
                  <span className="text-slate-500 text-sm">Вес:</span> {user.weight_kg} кг
                </p>
              )}
              {user.birth_date && (
                <p className="text-slate-800">
                  <span className="text-slate-500 text-sm">Дата рождения:</span>{' '}
                  {format(parseISO(user.birth_date), 'd.MM.yyyy', { locale: ru })}
                </p>
              )}
              {user.gender && (
                <p className="text-slate-800">
                  <span className="text-slate-500 text-sm">Пол:</span> {user.gender}
                </p>
              )}
              <Button variant="outline" onClick={startEdit} className="mt-4">
                Редактировать
              </Button>
            </div>
          )
        ) : (
          <p className="text-slate-600 text-sm">Загрузка...</p>
        )}
      </Card>

      {goal && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Текущая цель</h3>
          <p className="font-medium text-slate-800">{goal.goal_name}</p>
          <p className="text-slate-600 text-sm mt-1">
            {goal.distance_km} км ·{' '}
            {format(parseISO(goal.start_date), 'd MMM', { locale: ru })} —{' '}
            {format(parseISO(goal.end_date), 'd MMM yyyy', { locale: ru })}
          </p>
        </Card>
      )}

      <Card>
        <p className="text-slate-600 text-sm">
          Для выхода из аккаунта нажмите «Выйти» в верхней панели.
        </p>
      </Card>
    </div>
  )
}
