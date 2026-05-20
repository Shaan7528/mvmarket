import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import { searchProducts, searchStores } from '../services/firestoreService'
import { TRENDING_SEARCHES } from '../utils/constants'

export function SearchBar({ sticky = false, autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState({ products: [], stores: [] })
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(query, 300)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    if (!debounced.trim()) {
      setResults({ products: [], stores: [] })
      return
    }
    setLoading(true)
    Promise.all([
      searchProducts(debounced, 6),
      searchStores(debounced),
    ]).then(([products, stores]) => {
      setResults({ products, stores: stores.slice(0, 4) })
      setLoading(false)
    })
  }, [debounced])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className={`relative ${sticky ? 'sticky top-0 z-30 bg-white/95 backdrop-blur-md pt-safe' : ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          placeholder="Search products, stores..."
          className="w-full pl-10 pr-10 py-2.5 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-shadow"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-40 max-h-[70vh] overflow-y-auto">
          {!query.trim() ? (
            <div className="p-3">
              <p className="text-xs font-medium text-neutral-400 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Trending
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); navigate(`/explore?q=${encodeURIComponent(term)}`) }}
                    className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs text-neutral-700 hover:bg-neutral-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="p-4 text-sm text-neutral-400 text-center">Searching...</div>
          ) : (
            <>
              {results.stores.length > 0 && (
                <div className="p-2 border-b border-neutral-50">
                  <p className="text-xs font-medium text-neutral-400 px-2 py-1">Stores</p>
                  {results.stores.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { navigate(`/store/${s.username}`); setOpen(false) }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg text-sm"
                    >
                      {s.name} <span className="text-neutral-400">@{s.username}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.products.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-medium text-neutral-400 px-2 py-1">Products</p>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { navigate(`/product/${p.id}`); setOpen(false) }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg text-sm truncate"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
              {results.products.length === 0 && results.stores.length === 0 && (
                <div className="p-4 text-sm text-neutral-400 text-center">No results found</div>
              )}
              <button
                onClick={handleSubmit}
                className="w-full p-3 text-sm text-center text-sky-600 font-medium border-t border-neutral-50"
              >
                See all results for "{query}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
