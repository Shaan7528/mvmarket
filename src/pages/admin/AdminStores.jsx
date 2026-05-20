import { useEffect, useState, useCallback } from 'react'
import { Check, X, RefreshCw } from 'lucide-react'
import { getPendingStores, approveStore, updateStore } from '../../services/firestoreService'
import { STORE_STATUS } from '../../utils/constants'
import { LazyImage } from '../../components/ui/LazyImage'
import toast from 'react-hot-toast'

export function AdminStores() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await getPendingStores()
      setStores(list)
    } catch (err) {
      console.error('getPendingStores failed:', err)
      setError(err.message || 'Failed to load pending stores')
      setStores([])
      toast.error('Could not load pending stores. Check console or Firestore rules.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (store) => {
    try {
      await approveStore(store.id, store.ownerId)
      toast.success('Store approved!')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to approve')
    }
  }

  const handleReject = async (store) => {
    if (!confirm('Reject this store?')) return
    try {
      await updateStore(store.id, { status: STORE_STATUS.REJECTED })
      toast.success('Store rejected')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to reject')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Pending Stores</h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-neutral-200 rounded-full hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <div key={store.id} className="flex gap-3 p-4 bg-white rounded-2xl border border-neutral-100">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                <LazyImage src={store.logo} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{store.name}</h3>
                <p className="text-sm text-neutral-500">@{store.username} · {store.island}</p>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{store.description}</p>
                <p className="text-xs text-amber-600 mt-1 capitalize">Status: {store.status}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => handleApprove(store)}
                  title="Approve"
                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReject(store)}
                  title="Reject"
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {stores.length === 0 && !error && (
            <p className="text-center text-neutral-400 py-8 text-sm">No pending stores</p>
          )}
        </div>
      )}
    </div>
  )
}
