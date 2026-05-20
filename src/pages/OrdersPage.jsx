import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../services/firestoreService'
import { OrderCard } from '../components/OrderCard'
import { EmptyState } from '../components/ui/EmptyState'

export function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUserOrders(user.uid).then(setOrders).finally(() => setLoading(false))
  }, [user])

  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 py-4 border-b border-neutral-100">
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))
        ) : orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Your orders will appear here"
            actionLabel="Start shopping"
            actionTo="/home"
          />
        )}
      </div>
    </div>
  )
}
