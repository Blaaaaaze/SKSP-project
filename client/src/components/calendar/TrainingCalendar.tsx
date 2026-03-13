import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { SESSION_TYPE_LABELS } from '../../utils/sessionTypeLabels'
import type { CalendarItem } from '../../types'

type Props = {
  items: CalendarItem[]
}

export function TrainingCalendar({ items }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const itemsByDate = items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = startDate
  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex flex-wrap gap-4 px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100" />
          Запланировано
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-100" />
          Выполнено
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200" />
          Пропущено
        </span>
      </div>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Предыдущий месяц"
        >
          ←
        </button>
        <h3 className="font-semibold text-slate-800">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Следующий месяц"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 text-sm">
        {weekDays.map((d) => (
          <div
            key={d}
            className="p-2 text-center font-medium text-slate-500 border-b border-slate-100"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayItems = itemsByDate[dateStr] || []
          const isCurrentMonth = isSameMonth(day, currentMonth)

          return (
            <div
              key={dateStr}
              className={`min-h-[80px] p-2 border-b border-r border-slate-100 ${
                !isCurrentMonth ? 'bg-slate-50' : ''
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'bg-primary-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''
                } ${!isCurrentMonth ? 'text-slate-400' : 'text-slate-700'}`}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayItems.slice(0, 2).map((item) => {
                  const isCompleted = item.status === 'completed'
                  const isSkipped = item.status === 'skipped'
                  const linkClass = isCompleted
                    ? 'block text-xs p-1 rounded bg-green-100 text-green-800 hover:bg-green-200 truncate'
                    : isSkipped
                    ? 'block text-xs p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 truncate'
                    : 'block text-xs p-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 truncate'
                  return (
                    <Link
                      key={item.session_id}
                      to={`/training/${item.session_id}`}
                      className={linkClass}
                    >
                      {SESSION_TYPE_LABELS[item.type as keyof typeof SESSION_TYPE_LABELS] || item.type}
                    </Link>
                  )
                })}
                {dayItems.length > 2 && (
                  <span className="text-xs text-slate-500">+{dayItems.length - 2}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
