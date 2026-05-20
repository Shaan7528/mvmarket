import { useCallback, useEffect, useRef, useState } from 'react'

export function useInfiniteScroll(fetchFn, deps = []) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const lastDocRef = useRef(null)
  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  const load = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      lastDocRef.current = null
    } else {
      setLoadingMore(true)
    }
    try {
      const result = await fetchFn(reset ? null : lastDocRef.current)
      setItems((prev) => (reset ? result.items : [...prev, ...result.items]))
      lastDocRef.current = result.lastDoc
      setHasMore(result.hasMore)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, deps)

  useEffect(() => {
    load(true)
  }, [load])

  useEffect(() => {
    if (!hasMore || loading) return
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) load(false)
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loading, loadingMore, load])

  return { items, loading, loadingMore, hasMore, sentinelRef, refresh: () => load(true) }
}
