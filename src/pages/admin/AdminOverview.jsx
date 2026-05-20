import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, Package, ShoppingCart, Clock } from 'lucide-react'
import { getPlatformStats } from '../../services/firestoreService'

export function AdminOverview() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getPlatformStats().then(setStats)
  }, [])

  if (!stats) return <div className="text-neutral-400">Loading stats...</div>

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Store, label: 'Total Stores', value: stats.totalStores, to: '/admin/stores' },
          { icon: Clock, label: 'Pending Approval', value: stats.pendingStores, to: '/admin/stores' },
          { icon: Package, label: 'Products', value: stats.totalProducts, to: '/admin/products' },
          { icon: ShoppingCart, label: 'Orders', value: stats.totalOrders, to: '/admin/users' },
        ].map(({ icon: Icon, label, value, to }) => (
          <Link key={label} to={to} className="p-4 bg-white rounded-2xl border border-neutral-100 hover:shadow-md">
            <Icon className="w-5 h-5 text-neutral-400 mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
