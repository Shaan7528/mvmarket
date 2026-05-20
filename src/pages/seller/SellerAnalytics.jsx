import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStoreOrders } from '../../services/firestoreService'
import { formatPrice } from '../../utils/format'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#171717', '#737373', '#a3a3a3', '#d4d4d4']

export function SellerAnalytics() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!profile?.storeId) return
    getStoreOrders(profile.storeId).then(setOrders)
  }, [profile?.storeId])

  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const statusData = ['pending', 'confirmed', 'delivered', 'cancelled'].map((status) => ({
    name: status,
    value: orders.filter((o) => o.status === status).length,
  })).filter((d) => d.value > 0)

  const salesData = orders.slice(0, 10).reverse().map((o, i) => ({
    name: `#${i + 1}`,
    sales: o.total,
  }))

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Analytics</h1>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-white rounded-2xl border border-neutral-100">
          <p className="text-xs text-neutral-500">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-neutral-100">
          <p className="text-xs text-neutral-500">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
      </div>

      {salesData.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4">
          <h2 className="font-semibold text-sm mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatPrice(v)} />
              <Line type="monotone" dataKey="sales" stroke="#171717" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {statusData.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4">
          <h2 className="font-semibold text-sm mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
