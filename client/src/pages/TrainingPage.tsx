import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../services/api'
import { SESSION_STATUS_LABELS } from '../utils/sessionTypeLabels'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const completeSchema = z.object({
  actual_distance: z.coerce.number().min(0, 'Не может быть отрицательным'),
  actual_duration: z.coerce.number().min(1, 'Минимум 1 минута'),
  feeling_rating: z.coerce.number().min(1, 'Выберите самочувствие').max(5, 'Выберите самочувствие'),
})

type CompleteFormData = z.infer<typeof completeSchema>

export function TrainingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  const sessionId = id ? parseInt(id, 10) : 0

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['training', sessionId],
    queryFn: () => api.getTraining(sessionId),
    enabled: !!sessionId,
  })

  const { data: calendar } = useQuery({
    queryKey: ['calendar'],
    queryFn: api.getCalendar,
    enabled: !!sessionId,
  })

  const startMutation = useMutation({
    mutationFn: () => api.startTraining(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (data: CompleteFormData) =>
      api.completeTraining(sessionId, {
        actual_distance: data.actual_distance,
        actual_duration: data.actual_duration,
        feeling_rating: data.feeling_rating,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      setShowCompleteModal(false)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteFormData>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      actual_distance: 0,
      actual_duration: 30,
      feeling_rating: 3,
    },
  })

  if (isLoading || !session) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-48" />
        <div className="h-64 bg-slate-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Тренировка не найдена</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:underline"
        >
          Назад
        </button>
      </div>
    )
  }

  const canStart = session.status === 'planned'
  const canComplete = session.status === 'in_progress'

  const items = calendar || []
  const currentIdx = items.findIndex((i) => i.session_id === sessionId)
  const prevSession = currentIdx > 0 ? items[currentIdx - 1] : null
  const nextSession = currentIdx >= 0 && currentIdx < items.length - 1 ? items[currentIdx + 1] : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-600 hover:text-slate-900 text-sm"
        >
          ← Назад
        </button>
        <div className="flex gap-2">
          {prevSession && (
            <button
              onClick={() => navigate(`/training/${prevSession.session_id}`)}
              className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              ← Пред.
            </button>
          )}
          {nextSession && (
            <button
              onClick={() => navigate(`/training/${nextSession.session_id}`)}
              className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              След. →
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="text-slate-500 text-sm">
          {format(parseISO(session.scheduled_date), 'd MMMM yyyy', { locale: ru })}
        </p>
        <h1 className="text-2xl font-bold text-slate-800">{session.title}</h1>
        <span
          className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
            session.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : session.status === 'in_progress'
              ? 'bg-amber-100 text-amber-800'
              : session.status === 'skipped'
              ? 'bg-red-100 text-red-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {SESSION_STATUS_LABELS[session.status] || session.status}
        </span>
      </div>

      {session.description && (
        <Card>
          <p className="text-slate-600">{session.description}</p>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Упражнения</h3>
        <ol className="space-y-4">
          {session.exercises?.map((ex, i) => (
            <li key={ex.id} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium text-sm">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-slate-800">{ex.title}</p>
                {ex.description && (
                  <p className="text-sm text-slate-600 mt-0.5">{ex.description}</p>
                )}
                {(ex.distance_km ?? 0) > 0 ? (
                  <p className="text-xs text-slate-500 mt-1">{ex.distance_km} км</p>
                ) : (ex.duration ?? 0) > 0 ? (
                  <p className="text-xs text-slate-500 mt-1">{ex.duration} мин</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex flex-col gap-3">
        {canStart && (
          <Button
            onClick={() => startMutation.mutate()}
            isLoading={startMutation.isPending}
            className="w-full md:w-auto min-h-[48px]"
          >
            Начать тренировку
          </Button>
        )}
        {canComplete && (
          <Button
            onClick={() => setShowCompleteModal(true)}
            className="w-full md:w-auto min-h-[48px]"
          >
            Завершить тренировку
          </Button>
        )}
      </div>

      {showCompleteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCompleteModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Завершить тренировку
            </h3>
            <form
              onSubmit={handleSubmit((data) => completeMutation.mutate(data))}
            >
              <Input
                label="Фактическая дистанция (км)"
                type="number"
                step="0.1"
                error={errors.actual_distance?.message}
                {...register('actual_distance')}
              />
              <Input
                label="Фактическая длительность (мин)"
                type="number"
                error={errors.actual_duration?.message}
                {...register('actual_duration')}
              />
              <div className="mb-4">
                <p className="block text-sm font-medium text-slate-700 mb-2">Я чувствую</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">Легко</span>
                  <div className="flex gap-2 flex-1 justify-center">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <label
                        key={v}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={v}
                          className="w-5 h-5 rounded-full border-2 border-slate-300 text-primary-600 focus:ring-primary-500"
                          {...register('feeling_rating')}
                        />
                      </label>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">Утомленно</span>
                </div>
                {errors.feeling_rating && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.feeling_rating.message}
                  </p>
                )}
              </div>
              {completeMutation.error && (
                <p className="mb-4 text-sm text-red-600" role="alert">
                  {completeMutation.error.message}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  isLoading={completeMutation.isPending}
                  className="flex-1"
                >
                  Сохранить
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
