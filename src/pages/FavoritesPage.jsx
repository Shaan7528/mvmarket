import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserFavorites } from '../services/firestoreService'
import { ProductGrid } from '../components/ProductGrid'
import { EmptyState } from '../components/ui/EmptyState'

export function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUserFavorites(user.uid).then(setProducts).finally(() => setLoading(false))
  }, [user])

  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 py-4 border-b border-neutral-100">
        <h1 className="text-lg font-bold">Saved Products</h1>
      </div>
      <div className="px-4 py-4">
        {products.length > 0 ? (
          <ProductGrid products={products} loading={loading} />
        ) : !loading ? (
          <EmptyState
            icon={Heart}
            title="No saved products"
            description="Tap the heart on products you love"
            actionLabel="Explore products"
            actionTo="/explore"
          />
        ) : (
          <ProductGrid products={[]} loading />
        )}
      </div>
    </div>
  )
}
