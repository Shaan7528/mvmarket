import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { subscribeStoreOrders, updateOrderStatus } from '../../services/firestoreService'
import { formatPrice, formatDate } from '../../utils/format'
import { ORDER_STATUS } from '../../utils/constants'
import toast from 'react-hot-toast'

const statuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED]

export function SellerOrders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.storeId) {
      setLoading(false)
      return
    }
    const unsub = subscribeStoreOrders(profile.storeId, (list) => {
      setOrders(list)
      setLoading(false)
    })
    return unsub
  }, [profile?.storeId])

  const handleStatusChange = async (orderId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return
    try {
      await updateOrderStatus(orderId, newStatus)
      const msg =
        newStatus === ORDER_STATUS.CONFIRMED
          ? 'Order confirmed — customer notified'
          : 'Order updated — customer notified'
      toast.success(msg)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to update order')
    }
  }

  const pendingCount = orders.filter((o) => o.status === ORDER_STATUS.PENDING).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Orders</h1>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
            <Bell className="w-3.5 h-3.5" />
            {pendingCount} new
          </span>
        )}
      </div>
      <p className="text-xs text-neutral-500 mb-4">
        New orders appear here automatically. MarketMV does not send orders to Telegram — manage everything in this dashboard.
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`p-4 bg-white rounded-2xl border ${
                order.status === ORDER_STATUS.PENDING
                  ? 'border-amber-200 ring-1 ring-amber-100'
                  : 'border-neutral-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold">#{order.id?.slice(-6)}</p>
                  <p className="text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
                  {order.status === ORDER_STATUS.PENDING && (
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      New — action needed
                    </span>
                  )}
                </div>
                <p className="font-bold">{formatPrice(order.total)}</p>
              </div>
              <div className="text-sm text-neutral-600 space-y-1 mb-3">
                {order.items?.map((item, i) => (
                  <p key={i}>{item.quantity}x {item.name}</p>
                ))}
                <p className="text-xs text-neutral-500">
                  {order.deliveryAddress?.name} · {order.deliveryAddress?.phone}
                </p>
                <p className="text-xs text-neutral-400">
                  {order.deliveryAddress?.island} — {order.deliveryAddress?.address}
                </p>
                {order.orderNotes && (
                  <p className="text-xs text-neutral-500 italic">Note: {order.orderNotes}</p>
                )}
                {order.paymentMethod === 'bank_transfer' && (
                  <p className="flex items-center gap-1 text-xs text-amber-700">
                    {order.paymentConfirmed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Bank transfer confirmed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        Bank transfer awaiting confirmation
                      </>
                    )}
                    {order.paymentScreenshot && (
                      <span className="text-amber-600/80">(screenshot attached)</span>
                    )}
                  </p>
                )}
              </div>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value, order.status)}
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl text-sm capitalize"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12 text-neutral-400 text-sm">
              <p>No orders yet.</p>
              <p className="mt-1 text-xs">When customers checkout, orders show up here instantly.</p>
            </div>
          )}
        </div>
      )}

      <Link
        to="/notifications"
        className="mt-6 block text-center text-sm text-sky-600 font-medium"
      >
        View all notifications →
      </Link>
    </div>
  )
}
