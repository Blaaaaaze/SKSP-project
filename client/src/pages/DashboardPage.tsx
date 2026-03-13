import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { api } from '../services/api'
import { SESSION_TYPE_LABELS } from '../utils/sessionTypeLabels'
import { Card } from '../components/ui/Card'
import { TrainingCalendar } from '../components/calendar/TrainingCalendar'

export function DashboardPage() {
  const { data: calendar, isLoading: calendarLoading } = useQuery({
    queryKey: ['calendar'],
    queryFn: api.getCalendar,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: api.getStatistics,
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
  })

  const items = calendar || []
  const today = format(new Date(), 'yyyy-MM-dd')
  const upcoming = items
    .filter((i) => i.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  if (calendarLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-48" />
        <div className="h-64 bg-slate-200 rounded animate-pulse" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">План тренировок ещё не создан</p>
        <Link
          to="/onboarding/goal"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
        >
          Создать цель и план
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Главная</h1>

      {upcoming && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-2">Ближайшая тренировка</h3>
          <p className="text-slate-600 text-sm mb-1">
            {format(parseISO(upcoming.date), 'd MMMM', { locale: ru })}
          </p>
          <p className="font-medium text-primary-700 mb-3">
            {SESSION_TYPE_LABELS[upcoming.type as keyof typeof SESSION_TYPE_LABELS] || upcoming.type}
          </p>
          <Link
            to={`/training/${upcoming.session_id}`}
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            Открыть
          </Link>
        </Card>
      )}

      {stats && !statsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-slate-500">Выполнено</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Пропущено</p>
            <p className="text-2xl font-bold text-red-600">{stats.skipped}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Процент</p>
            <p className="text-2xl font-bold text-primary-600">
              {Math.round(stats.completion_rate)}%
            </p>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Календарь тренировок</h2>
        <TrainingCalendar items={items} />
      </div>

      {notifications && notifications.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-3">Последние уведомления</h3>
          <ul className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <li key={n.id} className="text-sm text-slate-600 border-b border-slate-100 pb-2 last:border-0">
                {n.message}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
