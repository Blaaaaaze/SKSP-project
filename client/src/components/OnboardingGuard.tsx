import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const ONBOARDING_PATHS = ['/onboarding/goal']

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const isOnboardingPath = ONBOARDING_PATHS.some((p) => location.pathname.startsWith(p))
  const justCreatedGoal = sessionStorage.getItem('goalJustCreated')

  const { data: goal, isLoading } = useQuery({
    queryKey: ['goal'],
    queryFn: api.getCurrentGoal,
    retry: false,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (justCreatedGoal) sessionStorage.removeItem('goalJustCreated')
  }, [justCreatedGoal])

  if (isLoading && !justCreatedGoal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Загрузка...</div>
      </div>
    )
  }

  if (!goal && !isOnboardingPath && !justCreatedGoal) {
    return <Navigate to="/onboarding/goal" replace />
  }

  return <>{children}</>
}
