import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { subscribeNotifications } from '../services/firestoreService'

/**
 * Shows a toast when a new in-app notification arrives (e.g. seller confirmed order).
 */
export function NotificationListener() {
  const { user } = useAuth()
  const seenIds = useRef(new Set())
  const ready = useRef(false)

  useEffect(() => {
    if (!user?.uid) return

    const unsub = subscribeNotifications(user.uid, (list) => {
      if (!ready.current) {
        list.forEach((n) => seenIds.current.add(n.id))
        ready.current = true
        return
      }

      for (const n of list) {
        if (seenIds.current.has(n.id)) continue
        seenIds.current.add(n.id)

        if (n.type === 'order_update' || n.type === 'order') {
          toast.success(n.message || n.title, { duration: 5000 })
        }
      }
    })

    return () => {
      ready.current = false
      seenIds.current.clear()
      unsub()
    }
  }, [user?.uid])

  return null
}
