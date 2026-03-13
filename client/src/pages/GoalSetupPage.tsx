import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const DISTANCES = [
  { value: 5, label: '5 км' },
  { value: 10, label: '10 км' },
  { value: 21.1, label: '21.1 км (полумарафон)' },
  { value: 42.2, label: '42.2 км (марафон)' },
]

const schema = z
  .object({
    goalName: z.string().min(1, 'Введите название цели'),
    distance: z.number().min(0.1, 'Выберите дистанцию'),
    startDate: z.string().min(1, 'Укажите дату начала'),
    endDate: z.string().min(1, 'Укажите дату окончания'),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return end >= start
    },
    { message: 'Дата окончания должна быть после даты начала', path: ['endDate'] }
  )

type FormData = z.infer<typeof schema>

export function GoalSetupPage() {
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      distance: 10,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    },
  })

  const distance = watch('distance')

  async function onSubmit(data: FormData) {
    setError('')
    try {
      await api.createGoal({
        goal_name: data.goalName,
        distance: data.distance,
        start_date: data.startDate,
        end_date: data.endDate,
      })
      await api.generatePlan()
      sessionStorage.setItem('goalJustCreated', '1')
      window.location.replace('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка создания плана')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Выберите цель подготовки</h2>
      <p className="text-slate-600 mb-6 text-sm">
        После отправки будет автоматически создан базовый план тренировок на выбранный период.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <p className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">
            {error}
          </p>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Дистанция
          </label>
          <select
            value={distance}
            onChange={(e) => setValue('distance', parseFloat(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-primary-500 min-h-[44px]"
          >
            {DISTANCES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Название цели"
          placeholder="Например: Первый марафон"
          error={errors.goalName?.message}
          {...register('goalName')}
        />
        <Input
          label="Дата начала"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />
        <Input
          label="Дата окончания"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate')}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Сформировать план
        </Button>
      </form>
    </div>
  )
}
