import { Link, Navigate } from 'react-router-dom'
import {
  User, Package, Heart, Settings, Store, LogOut, ChevronRight, Shield,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { logout } from '../services/authService'
import { ROLES } from '../utils/constants'
import toast from 'react-hot-toast'

const menuItems = [
  { icon: Package, label: 'My Orders', to: '/orders' },
  { icon: Heart, label: 'Saved Products', to: '/favorites' },
  { icon: Settings, label: 'Settings', to: '/settings' },
]

export function ProfilePage() {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="p-8 text-center text-neutral-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 py-6 flex items-center gap-4 border-b border-neutral-100">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-neutral-400" />
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold">{profile?.displayName || 'User'}</h1>
          {profile?.username && (
            <p className="text-sm text-neutral-500">@{profile.username}</p>
          )}
          <p className="text-xs text-neutral-400 capitalize mt-0.5">{profile?.role || 'customer'}</p>
        </div>
      </div>

      {!profile?.username && (
        <Link
          to="/profile/setup"
          className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center justify-between"
        >
          Set up your username <ChevronRight className="w-4 h-4" />
        </Link>
      )}

      <div className="px-4 py-4 space-y-1">
        {menuItems.map(({ icon: Icon, label, to }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50"
          >
            <Icon className="w-5 h-5 text-neutral-500" />
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </Link>
        ))}

        {profile?.role === ROLES.SELLER && (
          <Link to="/seller" className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50">
            <Store className="w-5 h-5 text-neutral-500" />
            <span className="flex-1 text-sm font-medium">Seller Dashboard</span>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </Link>
        )}

        {profile?.role !== ROLES.SELLER && (
          <Link to="/seller/setup" className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50">
            <Store className="w-5 h-5 text-neutral-500" />
            <span className="flex-1 text-sm font-medium">Open a Store</span>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </Link>
        )}

        {profile?.role === ROLES.ADMIN && (
          <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50">
            <Shield className="w-5 h-5 text-neutral-500" />
            <span className="flex-1 text-sm font-medium">Admin Dashboard</span>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 mt-4"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  )
}
