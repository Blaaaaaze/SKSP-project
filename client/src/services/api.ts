import type {
  CalendarItem,
  TrainingSession,
  TrainingStatistics,
  NotificationItem,
  TrainingGoal,
} from '../types'

// URL backend: из env при сборке, иначе относительные пути (/api) — nginx proxy
function getApiBase(): string {
  const env = import.meta.env.VITE_API_URL
  if (env) return env
  return ''
}
const API_BASE = getApiBase()

// Синхронизация токена с AuthContext — избегаем гонки при быстрой навигации после login
let _token: string | null = localStorage.getItem('token')

export function setApiToken(t: string | null) {
  _token = t
  if (t) localStorage.setItem('token', t)
  else localStorage.removeItem('token')
}

function getToken(): string | null {
  return _token ?? localStorage.getItem('token')
}

// Формирует стандарные заголовки для JSON-запросов и при необходимости добавляет Bearer-токен
function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  const token = getToken()
  if (includeAuth && token) {
    const h = headers as Record<string, string>
    h['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// Централизованно обрабатывает ответы API и сбрасывает авторизацию при 401
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    setApiToken(null)
    window.location.href = '/login'
    throw new Error('Сессия истекла')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Ошибка ${res.status}`)
  }
  return data as T
}

// Основной набор методов для работы с backend API приложения
export const api = {
  async register(data: {
    name: string
    email: string
    password: string
    height_cm?: number
    weight_kg?: number
    birth_date?: string
    gender?: string
  }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data),
    })
    return handleResponse<{ token: string }>(res)
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data),
    })
    return handleResponse<{ token: string }>(res)
  },

  async createGoal(data: {
    goal_name: string
    distance: number
    start_date: string
    end_date: string
  }) {
    const res = await fetch(`${API_BASE}/api/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async getCurrentGoal() {
    const res = await fetch(`${API_BASE}/api/goals/current`, {
      headers: getHeaders(),
    })
    if (res.status === 404) return null
    return handleResponse<TrainingGoal>(res)
  },

  async generatePlan() {
    const res = await fetch(`${API_BASE}/api/training-plan/generate`, {
      method: 'POST',
      headers: getHeaders(),
    })
    return handleResponse<{ plan_id: number }>(res)
  },

  async getCalendar() {
    const res = await fetch(`${API_BASE}/api/calendar`, {
      headers: getHeaders(),
    })
    return handleResponse<CalendarItem[]>(res)
  },

  async getTraining(id: number) {
    const res = await fetch(`${API_BASE}/api/training/${id}`, {
      headers: getHeaders(),
    })
    return handleResponse<TrainingSession>(res)
  },

  async startTraining(id: number) {
    const res = await fetch(`${API_BASE}/api/training/${id}/start`, {
      method: 'POST',
      headers: getHeaders(),
    })
    return handleResponse(res)
  },

  async completeTraining(id: number, data: {
    actual_distance: number
    actual_duration: number
    feeling_rating?: number
  }) {
    const res = await fetch(`${API_BASE}/api/training/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async getStatistics() {
    const res = await fetch(`${API_BASE}/api/statistics`, {
      headers: getHeaders(),
    })
    return handleResponse<TrainingStatistics>(res)
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: getHeaders(),
    })
    return handleResponse<NotificationItem[]>(res)
  },

  async markNotificationRead(id: number) {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders(),
    })
    return handleResponse(res)
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      headers: getHeaders(),
    })
    return handleResponse<import('../types').User>(res)
  },

  async updateProfile(data: {
    name: string
    height_cm?: number | null
    weight_kg?: number | null
    birth_date?: string | null
    gender?: string | null
  }) {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<import('../types').User>(res)
  },
}
