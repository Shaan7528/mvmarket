import { NavLink } from 'react-router-dom'
import { Home, Compass, ShoppingBag, Heart, User } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/cart', icon: ShoppingBag, label: 'Cart' },
  { to: '/favorites', icon: Heart, label: 'Saved' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const itemCount = useCartStore((s) => s.getItemCount())

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-100 safe-bottom md:hidden">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? 'text-neutral-900' : 'text-neutral-400'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" strokeWidth={2} />
              {to === '/cart' && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center bg-neutral-900 text-white text-[10px] font-bold rounded-full">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
