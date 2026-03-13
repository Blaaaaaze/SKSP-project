import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-8">
          Марафон
        </h1>
        <Outlet />
      </div>
    </div>
  )
}
