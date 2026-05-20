import { Outlet, Navigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/constants'

export function SellerDashboardLayout() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="p-8 text-center text-neutral-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== ROLES.SELLER && profile?.role !== ROLES.ADMIN) {
    return <Navigate to="/seller/setup" replace />
  }
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar showLogo />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar type="seller" />
        <main className="flex-1 p-4 md:p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function AdminDashboardLayout() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="p-8 text-center text-neutral-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== ROLES.ADMIN) return <Navigate to="/home" replace />
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar showLogo />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar type="admin" />
        <main className="flex-1 p-4 md:p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
