import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, Shield,
} from 'lucide-react'

export function Sidebar({ type = 'seller' }) {
  const sellerLinks = [
    { to: '/seller', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/seller/products', icon: Package, label: 'Products' },
    { to: '/seller/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/seller/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/seller/settings', icon: Settings, label: 'Settings' },
  ]

  const adminLinks = [
    { to: '/admin', icon: Shield, label: 'Overview', end: true },
    { to: '/admin/stores', icon: Package, label: 'Stores' },
    { to: '/admin/products', icon: ShoppingCart, label: 'Products' },
    { to: '/admin/categories', icon: BarChart3, label: 'Categories' },
    { to: '/admin/users', icon: Settings, label: 'Users' },
  ]

  const links = type === 'admin' ? adminLinks : sellerLinks

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-neutral-100 bg-white min-h-[calc(100vh-3.5rem)] p-4 shrink-0">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-3">
        {type === 'admin' ? 'Admin' : 'Seller'}
      </p>
      <nav className="space-y-0.5">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
