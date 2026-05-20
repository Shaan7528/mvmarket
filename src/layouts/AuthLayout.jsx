import { Outlet, Link } from 'react-router-dom'
import { APP_NAME } from '../utils/constants'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-neutral-50">
      <Link to="/" className="text-2xl font-bold mb-8">{APP_NAME}</Link>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 page-enter">
        <Outlet />
      </div>
    </div>
  )
}
