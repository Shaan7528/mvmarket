import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeNotifications, markNotificationRead } from '../services/firestoreService'
import { formatRelativeTime } from '../utils/format'
import { EmptyState } from '../components/ui/EmptyState'

export function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  useEffect(() => {
    if (!user) return
    const unsub = subscribeNotifications(user.uid, (list) => {
      setNotifications(list)
    })
    return unsub
  }, [user])

  const handleOpen = async (n) => {
    try {
      await markNotificationRead(n.id)
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      )
    } catch (err) {
      console.error(err)
    }
    if (n.link) navigate(n.link)
  }

  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h1 className="text-lg font-bold">Notifications</h1>
        {unread > 0 && (
          <span className="text-xs font-medium text-sky-600">{unread} unread</span>
        )}
      </div>
      <div className="divide-y divide-neutral-50">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleOpen(n)}
              className={`w-full text-left px-4 py-4 hover:bg-neutral-50 ${
                !n.read ? 'bg-sky-50/50' : ''
              }`}
            >
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-sm text-neutral-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-neutral-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
            </button>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="When a seller confirms your order, you will see it here."
          />
        )}
      </div>
    </div>
  )
}
