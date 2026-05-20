import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { ProductGrid } from '../components/ProductGrid'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { getProducts, searchProducts } from '../services/firestoreService'
import { DEFAULT_CATEGORIES } from '../utils/constants'
import { EmptyState } from '../components/ui/EmptyState'
import { Search } from 'lucide-react'

export function ExplorePage() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const category = params.get('category') || ''
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const { items, loading, loadingMore, hasMore, sentinelRef } = useInfiniteScroll(
    (lastDoc) => getProducts({ category: category || undefined, lastDoc }),
    [category]
  )

  useEffect(() => {
    if (!query) { setSearchResults(null); return }
    setSearchLoading(true)
    searchProducts(query).then((results) => {
      setSearchResults(results)
      setSearchLoading(false)
    })
  }, [query])

  const displayProducts = query ? searchResults : items
  const isLoading = query ? searchLoading : loading

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 pt-3 pb-2">
        <SearchBar sticky autoFocus={!!query} />
      </div>

      {!query && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <a
            href="/explore"
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              !category ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            All
          </a>
          {DEFAULT_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`/explore?category=${cat.id}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                category === cat.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>
      )}

      <div className="px-4 py-4">
        {query && (
          <p className="text-sm text-neutral-500 mb-3">
            Results for "<span className="font-medium text-neutral-900">{query}</span>"
          </p>
        )}
        {category && !query && (
          <p className="text-sm text-neutral-500 mb-3 capitalize">
            Category: {DEFAULT_CATEGORIES.find((c) => c.id === category)?.name || category}
          </p>
        )}

        {displayProducts?.length > 0 ? (
          <>
            <ProductGrid products={displayProducts} loading={isLoading} />
            {!query && <div ref={sentinelRef} className="h-8 flex items-center justify-center">
              {loadingMore && <span className="text-xs text-neutral-400">Loading more...</span>}
            </div>}
          </>
        ) : !isLoading ? (
          <EmptyState
            icon={Search}
            title="No products found"
            description="Try a different search or category"
            actionLabel="Browse all"
            actionTo="/explore"
          />
        ) : (
          <ProductGrid products={[]} loading />
        )}
      </div>
    </div>
  )
}
