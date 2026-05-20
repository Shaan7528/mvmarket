import { useEffect, useState } from 'react'
import { SearchBar } from '../components/SearchBar'
import { StoreCard } from '../components/StoreCard'
import { getStores } from '../services/firestoreService'
import { EmptyState } from '../components/ui/EmptyState'
import { Store } from 'lucide-react'

export function StoresPage() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStores({ pageSize: 30 }).then(setStores).finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 pt-3 pb-2">
        <h1 className="text-lg font-bold mb-3 md:hidden">Popular Stores</h1>
        <SearchBar />
      </div>
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))
        ) : stores.length > 0 ? (
          stores.map((store) => <StoreCard key={store.id} store={store} variant="horizontal" />)
        ) : (
          <EmptyState icon={Store} title="No stores yet" description="Be the first to open a store!" actionLabel="Open store" actionTo="/register" />
        )}
      </div>
    </div>
  )
}
