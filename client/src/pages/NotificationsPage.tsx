import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { api } from '../services/api'
import { Card } from '../components/ui/Card'

const TYPE_LABELS: Record<string, string> = {
  training_reminder: 'Напоминание',
  training_completed: 'Завершено',
  system: 'Система',
}

export function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-48" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Не удалось загрузить уведомления</p>
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Уведомления</h1>
        <Card>
          <p className="text-slate-600 text-center py-8">Нет уведомлений</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Уведомления</h1>

      <ul className="space-y-3">
        {notifications.map((n) => (
          <li key={n.id}>
            <Card
              className={n.status !== 'read' ? 'border-l-4 border-l-primary-500' : ''}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs text-slate-500">
                    {TYPE_LABELS[n.type] || n.type}
                  </span>
                  <p className="mt-1 text-slate-800">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {format(parseISO(n.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                  </p>
                </div>
                {n.status !== 'read' && (
                  <button
                    onClick={() => markReadMutation.mutate(n.id)}
                    disabled={markReadMutation.isPending}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Прочитано
                  </button>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
