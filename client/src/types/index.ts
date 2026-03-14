//Персональные данные
export type User = {
  id: number
  name: string
  email: string
  height_cm?: number | null
  weight_kg?: number | null
  birth_date?: string | null
  gender?: string | null
  created_at: string
}

//Хранения информации о дистанции, названии цели и временном промежутке подготовки.
export type TrainingGoal = {
  id: number
  goal_name: string
  distance_km: number
  start_date: string
  end_date: string
}

// Типы и статусы тренировочных сессий
export type TrainingSessionStatus = 'planned' | 'in_progress' | 'completed' | 'skipped'
export type TrainingSessionType = 'easy_run' | 'interval' | 'long_run' | 'recovery'


// Упражнение, входящее в тренировочную сессию
export type Exercise = {
  id: number
  title: string
  description: string
  difficultyLevel?: 'easy' | 'medium' | 'hard'
  duration?: number
  distance_km?: number
}
// Содержит всю информацию о запланированной или выполненной тренировке
export type TrainingSession = {
  id: number
  plan_id: number
  scheduled_date: string
  session_type: TrainingSessionType
  title: string
  description?: string | null
  planned_duration_minutes?: number | null
  planned_distance_km?: number | null
  difficulty_level?: string | null
  status: TrainingSessionStatus
  started_at?: string | null
  completed_at?: string | null
  created_at: string
  exercises: Exercise[]
}

// Календарь тренировок
export type CalendarItem = {
  session_id: number
  date: string
  type: string
  status?: TrainingSessionStatus
}


// Агрегированная статистика выполнения тренировок
export type TrainingStatistics = {
  completed: number
  skipped: number
  total: number
  completion_rate: number
}

// Напоминания о тренировках,служебных сообщениях системы и фиксация статуса доставки/прочтения.
export type NotificationItem = {
  id: number
  user_id: number
  type: 'training_reminder' | 'training_completed' | 'system'
  message: string
  status: 'pending' | 'sent' | 'failed' | 'read'
  created_at: string
  sent_at?: string | null
  read_at?: string | null
}
