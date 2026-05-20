import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { COLLECTIONS, ROLES } from '../../utils/constants'
import toast from 'react-hot-toast'

export function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    getDocs(collection(db, COLLECTIONS.USERS)).then((snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const setRole = async (uid, role) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { role })
    setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, role } : u))
    toast.success(`Role updated to ${role}`)
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Users</h1>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-neutral-100">
            <div>
              <p className="text-sm font-semibold">{user.displayName || user.email}</p>
              <p className="text-xs text-neutral-400">{user.email}</p>
            </div>
            <select
              value={user.role || ROLES.CUSTOMER}
              onChange={(e) => setRole(user.id, e.target.value)}
              className="text-sm px-2 py-1 bg-neutral-50 rounded-lg capitalize"
            >
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
