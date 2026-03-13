import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OnboardingGuard } from './components/OnboardingGuard'
import { AuthLayout } from './components/layout/AuthLayout'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { GoalSetupPage } from './pages/GoalSetupPage'
import { DashboardPage } from './pages/DashboardPage'
import { CalendarPage } from './pages/CalendarPage'
import { TrainingPage } from './pages/TrainingPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
})

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <OnboardingGuard>
              <Navigate to="/dashboard" replace />
            </OnboardingGuard>
          }
        />
        <Route
          path="onboarding/goal"
          element={<GoalSetupPage />}
        />
        <Route
          path="dashboard"
          element={
            <OnboardingGuard>
              <DashboardPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="calendar"
          element={
            <OnboardingGuard>
              <CalendarPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="training/:id"
          element={
            <OnboardingGuard>
              <TrainingPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="statistics"
          element={
            <OnboardingGuard>
              <StatisticsPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="notifications"
          element={
            <OnboardingGuard>
              <NotificationsPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="profile"
          element={<ProfilePage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
