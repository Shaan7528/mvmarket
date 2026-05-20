import { Link } from 'react-router-dom'
import { Bell, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCartStore } from '../stores/cartStore'
import { APP_NAME } from '../utils/constants'

export function Navbar({ showLogo = true }) {
  const { user, profile } = useAuth()
  const itemCount = useCartStore((s) => s.getItemCount())

  return (
    <header className="hidden md:flex items-center justify-between h-14 px-6 border-b border-neutral-100 bg-white sticky top-0 z-30">
      {showLogo && (
        <Link to="/home" className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>
      )}
      <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
        <Link to="/home" className="hover:text-neutral-900">Home</Link>
        <Link to="/explore" className="hover:text-neutral-900">Explore</Link>
        <Link to="/stores" className="hover:text-neutral-900">Stores</Link>
        {profile?.role === 'seller' && (
          <Link to="/seller" className="hover:text-neutral-900">Dashboard</Link>
        )}
        {profile?.role === 'admin' && (
          <Link to="/admin" className="hover:text-neutral-900">Admin</Link>
        )}
      </nav>
      <div className="flex items-center gap-3">
        {user && (
          <Link to="/notifications" className="p-2 rounded-full hover:bg-neutral-100 relative">
            <Bell className="w-5 h-5" />
          </Link>
        )}
        <Link to="/cart" className="p-2 rounded-full hover:bg-neutral-100 relative">
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
        <Link
          to={user ? '/profile' : '/login'}
          className="px-4 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800"
        >
          {user ? profile?.displayName?.split(' ')[0] || 'Profile' : 'Sign in'}
        </Link>
      </div>
    </header>
  )
}
