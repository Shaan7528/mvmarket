import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ui/Skeleton'

export function ProductGrid({ products, loading, onFavorite, favorites = new Set(), columns = 'responsive' }) {
  const cols =
    columns === 3
      ? 'grid-cols-3'
      : columns === 2
        ? 'grid-cols-2'
        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'

  if (loading) {
    return (
      <div className={`grid ${cols} gap-2 sm:gap-3`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products?.length) return null

  return (
    <div className={`grid ${cols} gap-2 sm:gap-3`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onFavorite={onFavorite}
          isFavorite={favorites.has(product.id)}
        />
      ))}
    </div>
  )
}
