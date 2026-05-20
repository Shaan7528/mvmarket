import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Flame, Sparkles, Clock, Bell } from 'lucide-react'
import { SearchBar } from '../components/SearchBar'
import { CategoryIcon } from '../components/CategoryIcon'
import { ProductGrid } from '../components/ProductGrid'
import { StoreCard } from '../components/StoreCard'
import { StoreCardSkeleton } from '../components/ui/Skeleton'
import { getProducts, getStores } from '../services/firestoreService'
import { DEFAULT_CATEGORIES } from '../utils/constants'
import { useAuth } from '../context/AuthContext'
import { toggleFavorite, getUserFavorites } from '../services/firestoreService'
import toast from 'react-hot-toast'

export function HomePage() {
  const { user } = useAuth()
  const [stores, setStores] = useState([])
  const [trending, setTrending] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    async function load() {
      try {
        const [storeList, trendingRes, newRes, recentRes] = await Promise.all([
          getStores({ pageSize: 10 }),
          getProducts({ featured: true, pageSize: 8 }),
          getProducts({ pageSize: 8 }),
          getProducts({ pageSize: 12 }),
        ])
        setStores(storeList)
        setTrending(
          trendingRes.items.length > 0 ? trendingRes.items : newRes.items
        )
        setNewArrivals(newRes.items)
        setRecent(recentRes.items)
      } catch (err) {
        console.error(err)
        toast.error('Could not load feed. Check Firebase connection.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!user) return
    getUserFavorites(user.uid).then((prods) => {
      setFavorites(new Set(prods.map((p) => p.id)))
    })
  }, [user])

  const handleFavorite = async (productId) => {
    if (!user) { toast.error('Sign in to save favorites'); return }
    const added = await toggleFavorite(user.uid, productId)
    setFavorites((prev) => {
      const next = new Set(prev)
      added ? next.add(productId) : next.delete(productId)
      return next
    })
    toast.success(added ? 'Saved!' : 'Removed from favorites')
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 pt-3 pb-2 md:pt-4">
        <div className="flex items-center justify-between mb-3 md:hidden">
          <h1 className="text-lg font-bold">MarketMV</h1>
          <Link to="/notifications" className="p-2 rounded-full hover:bg-neutral-100" aria-label="Notifications">
            <Bell className="w-5 h-5 text-neutral-700" strokeWidth={1.75} />
          </Link>
        </div>
        <SearchBar sticky />
      </div>

      {/* Categories */}
      <section className="px-4 py-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {DEFAULT_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.id}`}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <CategoryIcon name={cat.icon} className="w-6 h-6 text-neutral-800" />
              </div>
              <span className="text-[11px] font-medium text-neutral-600">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Stores */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">Popular Stores</h2>
          <Link to="/stores" className="text-xs text-neutral-500 flex items-center gap-0.5">
            See all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <StoreCardSkeleton key={i} />)
            : stores.map((store) => <StoreCard key={store.id} store={store} />)}
        </div>
      </section>

      {/* Trending */}
      <section className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-base">Trending Now</h2>
        </div>
        <ProductGrid products={trending} loading={loading} onFavorite={handleFavorite} favorites={favorites} columns="responsive" />
      </section>

      {/* New Arrivals */}
      <section className="px-4 py-4 bg-neutral-50 rounded-t-3xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <h2 className="font-bold text-base">New Arrivals</h2>
        </div>
        <ProductGrid products={newArrivals} loading={loading} onFavorite={handleFavorite} favorites={favorites} />
      </section>

      {/* Recently Added */}
      <section className="px-4 py-4 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-neutral-500" />
          <h2 className="font-bold text-base">Recently Added</h2>
        </div>
        <ProductGrid products={recent} loading={loading} onFavorite={handleFavorite} favorites={favorites} />
        <div ref={null} className="h-4" />
      </section>
    </div>
  )
}
