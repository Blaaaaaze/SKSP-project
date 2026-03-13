import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { TrainingCalendar } from '../components/calendar/TrainingCalendar'

export function CalendarPage() {
  const { data: calendar, isLoading } = useQuery({
    queryKey: ['calendar'],
    queryFn: api.getCalendar,
  })

  const items = calendar || []

  if (isLoading) {
    return (
      <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600">Нет тренировок в плане</p>
        <p className="text-sm text-slate-500 mt-1">Создайте цель подготовки</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Календарь</h1>
      <TrainingCalendar items={items} />
    </div>
  )
}
