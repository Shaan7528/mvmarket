import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getStore, getStoreOrders, getProducts } from '../../services/firestoreService'
import { STORE_STATUS } from '../../utils/constants'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function SellerOverview() {
  const { profile } = useAuth()
  const [store, setStore] = useState(null)
  const [orders, setOrders] = useState([])
  const [productCount, setProductCount] = useState(0)

  useEffect(() => {
    if (!profile?.storeId) return
    async function load() {
      const s = await getStore(profile.storeId)
      setStore(s)
      const [orderList, products] = await Promise.all([
        getStoreOrders(profile.storeId),
        getProducts({ storeId: profile.storeId, pageSize: 100 }),
      ])
      setOrders(orderList)
      setProductCount(products.items.length)
    }
    load()
  }, [profile?.storeId])

  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const chartData = orders.slice(0, 7).reverse().map((o, i) => ({
    name: `Order ${i + 1}`,
    amount: o.total || 0,
  }))

  if (!store) {
    return <div className="text-center py-12 text-neutral-400">Loading store...</div>
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{store.name}</h1>
      {store.status === STORE_STATUS.PENDING && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Your store is pending admin approval
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Package, label: 'Products', value: productCount, to: '/seller/products' },
          { icon: ShoppingCart, label: 'Pending Orders', value: pendingOrders, to: '/seller/orders' },
          { icon: TrendingUp, label: 'Revenue (MVR)', value: totalRevenue.toLocaleString(), to: '/seller/analytics' },
          { icon: TrendingUp, label: 'Followers', value: store.followersCount || 0, to: '/seller/settings' },
        ].map(({ icon: Icon, label, value, to }) => (
          <Link key={label} to={to} className="p-4 bg-white rounded-2xl border border-neutral-100 hover:shadow-md transition-shadow">
            <Icon className="w-5 h-5 text-neutral-400 mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4">
          <h2 className="font-semibold text-sm mb-4">Recent Sales</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#171717" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
