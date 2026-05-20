import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { LazyImage } from './ui/LazyImage'
import { formatPrice } from '../utils/format'

export function ProductCard({ product, onFavorite, isFavorite, compact = false }) {
  const price = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <Link to={`/product/${product.id}`} className="group block w-full">
      <div
        className={`relative overflow-hidden bg-neutral-100 ${
          compact ? 'aspect-[4/5] rounded-xl' : 'aspect-[4/5] sm:aspect-square rounded-xl sm:rounded-2xl'
        }`}
      >
        <LazyImage
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full">
            Sale
          </span>
        )}
        {onFavorite && (
          <button
            onClick={(e) => { e.preventDefault(); onFavorite(product.id) }}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-600'}`} />
          </button>
        )}
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="text-[10px] sm:text-xs text-neutral-500 truncate">{product.storeName}</p>
        <h3 className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-2 mt-0.5 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-neutral-900">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs text-neutral-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
