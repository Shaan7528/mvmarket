import { useEffect, useState, useCallback } from 'react'
import { Trash2, Star, RefreshCw } from 'lucide-react'
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { COLLECTIONS } from '../../utils/constants'
import { getProductsFromPendingStores } from '../../services/firestoreService'
import { LazyImage } from '../../components/ui/LazyImage'
import { formatPrice } from '../../utils/format'
import toast from 'react-hot-toast'

function ProductRow({ product, onDelete, onFeature }) {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-2xl border border-neutral-100">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
        <LazyImage src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate">{product.name}</h3>
        <p className="text-sm">{formatPrice(product.price)}</p>
        <p className="text-xs text-neutral-400">{product.storeName}</p>
        <p className="text-xs text-neutral-400 capitalize">Stock: {product.status?.replace('_', ' ')}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onFeature(product.id, product.featured)}
          className={`p-2 rounded-lg ${product.featured ? 'bg-amber-100 text-amber-700' : 'hover:bg-neutral-100'}`}
        >
          <Star className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function AdminProducts() {
  const [tab, setTab] = useState('all')
  const [products, setProducts] = useState([])
  const [pendingStoreProducts, setPendingStoreProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [snap, pending] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.PRODUCTS)),
        getProductsFromPendingStores(),
      ])
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setPendingStoreProducts(pending)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id))
    toast.success('Product removed')
    load()
  }

  const handleFeature = async (id, featured) => {
    await updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), { featured: !featured })
    toast.success(featured ? 'Unfeatured' : 'Featured!')
    load()
  }

  const list = tab === 'pending' ? pendingStoreProducts : products

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Manage Products</h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-neutral-200 rounded-full"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            tab === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100'
          }`}
        >
          All ({products.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            tab === 'pending' ? 'bg-neutral-900 text-white' : 'bg-neutral-100'
          }`}
        >
          Pending stores ({pendingStoreProducts.length})
        </button>
      </div>

      {tab === 'pending' && (
        <p className="text-xs text-neutral-500 mb-3">
          Products from shops waiting for approval. They are hidden from Home until the store is approved.
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onDelete={handleDelete}
              onFeature={handleFeature}
            />
          ))}
          {list.length === 0 && (
            <p className="text-center text-neutral-400 py-8 text-sm">
              {tab === 'pending' ? 'No products from pending stores' : 'No products yet'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
