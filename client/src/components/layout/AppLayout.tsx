import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Главная' },
  { to: '/statistics', label: 'Статистика' },
  { to: '/notifications', label: 'Уведомления' },
  { to: '/profile', label: 'Профиль' },
]

export function AppLayout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/dashboard" className="text-xl font-bold text-primary-600">
            Марафон
          </NavLink>
          <nav className="hidden md:flex gap-4">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={logout}
            className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
          >
            Выйти
          </button>
        </div>
        <nav className="md:hidden flex gap-2 overflow-x-auto px-4 pb-2 border-t border-slate-100">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
