import { Link } from 'react-router-dom'
import { LazyImage } from './ui/LazyImage'
import { Users } from 'lucide-react'

export function StoreCard({ store, variant = 'grid' }) {
  if (variant === 'horizontal') {
    return (
      <Link
        to={`/store/${store.username}`}
        className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-neutral-100 hover:shadow-md transition-shadow"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-100 shrink-0">
          <LazyImage src={store.logo} alt={store.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{store.name}</h3>
          <p className="text-xs text-neutral-500">{store.island}</p>
          <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3" /> {store.followersCount || 0} followers
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/store/${store.username}`} className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 ring-2 ring-neutral-100">
        <LazyImage src={store.logo} alt={store.name} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs font-medium text-neutral-800 truncate max-w-[72px] text-center">
        {store.name}
      </span>
    </Link>
  )
}
