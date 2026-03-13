import type { TrainingSessionType } from '../types'

export const SESSION_TYPE_LABELS: Record<TrainingSessionType, string> = {
  easy_run: 'Лёгкий бег',
  interval: 'Интервальная тренировка',
  long_run: 'Длинная пробежка',
  recovery: 'Восстановительная тренировка',
}

export const SESSION_STATUS_LABELS: Record<string, string> = {
  planned: 'Запланировано',
  in_progress: 'В процессе',
  completed: 'Выполнено',
  skipped: 'Пропущено',
}
