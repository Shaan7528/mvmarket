import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Heart, Share2, ShoppingBag, MessageCircle } from 'lucide-react'
import { getProduct, getProducts, toggleFavorite, isFavorited } from '../services/firestoreService'
import { LazyImage } from '../components/ui/LazyImage'
import { ProductGrid } from '../components/ProductGrid'
import { formatPrice } from '../utils/format'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export function ProductPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const addItem = useCartStore((s) => s.addItem)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [imageIndex, setImageIndex] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    async function load() {
      const p = await getProduct(id)
      setProduct(p)
      if (p) {
        const rel = await getProducts({ category: p.category, pageSize: 6 })
        setRelated(rel.items.filter((r) => r.id !== p.id))
        if (user) setFavorited(await isFavorited(user.uid, p.id))
      }
      setLoading(false)
    }
    load()
  }, [id, user])

  if (loading) return <div className="p-8 text-center text-neutral-400">Loading...</div>
  if (!product) return <div className="p-8 text-center">Product not found</div>

  const price = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const sizes = product.variants?.sizes || []
  const colors = product.variants?.colors || []

  const handleAddToCart = () => {
    if (sizes.length && !size) { toast.error('Select a size'); return }
    if (colors.length && !color) { toast.error('Select a color'); return }
    addItem(product, { size, color })
    toast.success('Added to cart!')
  }

  const handleFavorite = async () => {
    if (!user) { toast.error('Sign in to save'); return }
    const added = await toggleFavorite(user.uid, product.id)
    setFavorited(added)
    toast.success(added ? 'Saved!' : 'Removed')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: product.name, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md">
        <button onClick={() => history.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button onClick={handleFavorite} className="p-2 rounded-full hover:bg-neutral-100">
            <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-neutral-100">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative aspect-square bg-neutral-100">
        <LazyImage src={product.images?.[imageIndex]} alt={product.name} className="w-full h-full object-cover" />
        {product.images?.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImageIndex(i)}
                className={`w-2 h-2 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        <Link to={`/store/${product.storeUsername}`} className="text-sm text-sky-600 font-medium">
          {product.storeName}
        </Link>
        <h1 className="text-xl font-bold mt-1">{product.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-bold">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-sm text-neutral-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>

        {sizes.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 py-2 rounded-xl text-sm border ${
                    size === s ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-4 py-2 rounded-xl text-sm border ${
                    color === c ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-neutral-600 mt-4 leading-relaxed">{product.description}</p>
      </div>

      {related.length > 0 && (
        <div className="px-4 py-4 border-t border-neutral-100">
          <h2 className="font-bold mb-3">Related Products</h2>
          <ProductGrid products={related} columns={2} />
        </div>
      )}

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-neutral-100 flex gap-3 safe-bottom">
        <Link
          to={`/store/${product.storeUsername}`}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200 rounded-full text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" /> Contact
        </Link>
        <button
          onClick={handleAddToCart}
          disabled={product.status === 'out_of_stock'}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-full font-semibold disabled:opacity-50"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </div>
  )
}
