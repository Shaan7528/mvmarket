import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Users, MessageCircle, Share2, MapPin, CheckCircle2,
} from 'lucide-react'
import {
  getStoreByUsername, getProducts, toggleFollow,
} from '../services/firestoreService'
import { LazyImage } from '../components/ui/LazyImage'
import { ProductGrid } from '../components/ProductGrid'
import { useAuth } from '../context/AuthContext'
import { STORE_STATUS } from '../utils/constants'
import toast from 'react-hot-toast'

export function StorePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [tab, setTab] = useState('products')

  useEffect(() => {
    async function load() {
      const s = await getStoreByUsername(username)
      setStore(s)
      if (s) {
        const res = await getProducts({ storeId: s.id, pageSize: 30, publicOnly: false })
        setProducts(res.items)
      }
      setLoading(false)
    }
    load()
  }, [username])

  if (loading) return <div className="p-8 text-center text-neutral-400">Loading...</div>
  if (!store) return <div className="p-8 text-center">Store not found</div>

  const handleFollow = async () => {
    if (!user) { toast.error('Sign in to follow'); return }
    const added = await toggleFollow(user.uid, store.id)
    setFollowing(added)
    setStore((s) => ({
      ...s,
      followersCount: (s.followersCount || 0) + (added ? 1 : -1),
    }))
    toast.success(added ? 'Following!' : 'Unfollowed')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) await navigator.share({ title: store.name, url })
    else { await navigator.clipboard.writeText(url); toast.success('Link copied!') }
  }

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}`
    : null

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="relative h-40 md:h-52 bg-neutral-200">
        {store.banner && (
          <LazyImage src={store.banner} alt="" className="w-full h-full object-cover" />
        )}
        <button
          onClick={() => history.back()}
          className="absolute top-3 left-3 p-2 bg-white/90 rounded-full shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 -mt-10 relative">
        <div className="flex items-end justify-between">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white ring-4 ring-white shadow-md">
            <LazyImage src={store.logo} alt={store.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 mb-1">
            <button onClick={handleShare} className="p-2 rounded-full border border-neutral-200">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                following ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-900 text-white'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold mt-3">{store.name}</h1>
        <p className="text-sm text-neutral-500">@{store.username}</p>
        {store.status === STORE_STATUS.PENDING && (
          <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            This store is awaiting admin approval — it won&apos;t appear on Home until approved.
          </p>
        )}
        {store.status === STORE_STATUS.REJECTED && (
          <p className="mt-2 text-xs font-medium text-red-700 bg-red-50 px-3 py-2 rounded-lg">
            This store is not active on MarketMV.
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" /> {store.followersCount || 0} followers
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {store.island}
          </span>
        </div>

        {(whatsappUrl || store.telegram) && (
          <div className="flex gap-2 mt-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {store.telegram && (
              <a
                href={`https://t.me/${store.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-full text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" /> Message on Telegram
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex border-b border-neutral-100 mt-4 px-4">
        {['products', 'about'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'products' ? (
        <div className="px-4 py-4">
          <ProductGrid products={products} loading={false} />
          {products.length === 0 && (
            <p className="text-center text-neutral-400 py-8 text-sm">No products yet</p>
          )}
        </div>
      ) : (
        <div className="px-4 py-4 text-sm text-neutral-600 space-y-3">
          <p>{store.description || 'No description yet.'}</p>
          {store.deliveryInfo && (
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">Delivery Info</h3>
              <p>{store.deliveryInfo}</p>
            </div>
          )}
          {store.pickupAvailable && (
            <p className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2} />
              Pickup available
            </p>
          )}
        </div>
      )}
    </div>
  )
}
