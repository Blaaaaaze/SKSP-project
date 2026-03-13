import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Card } from '../components/ui/Card'

export function StatisticsPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: api.getStatistics,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Не удалось загрузить статистику</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Нет данных для отображения</p>
      </div>
    )
  }

  const rate = Math.round(stats.completion_rate)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Статистика</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Выполнено</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Пропущено</p>
          <p className="text-3xl font-bold text-red-600">{stats.skipped}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Процент выполнения</p>
          <p className="text-3xl font-bold text-primary-600">{rate}%</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Прогресс</h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-primary-600">
            {stats.completed}
            <span className="text-slate-400 font-normal">/{stats.total ?? stats.completed + stats.skipped}</span>
          </span>
          <span className="text-slate-600">тренировок выполнено</span>
        </div>
        <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {rate}% от запланированного
        </p>
      </Card>
    </div>
  )
}
