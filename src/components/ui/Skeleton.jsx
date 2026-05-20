export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-neutral-50 w-full">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="p-2 space-y-1.5">
        <Skeleton className="h-2.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function StoreCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="h-3 w-14" />
    </div>
  )
}
