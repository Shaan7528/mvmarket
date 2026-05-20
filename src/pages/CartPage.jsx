import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { formatPrice } from '../utils/format'
import { EmptyState } from '../components/ui/EmptyState'
import { LazyImage } from '../components/ui/LazyImage'

export function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, getStoreGroups } = useCartStore()
  const subtotal = getSubtotal()
  const groups = getStoreGroups()

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse products and add items to your cart"
        actionLabel="Start shopping"
        actionTo="/home"
      />
    )
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="px-4 py-4 border-b border-neutral-100">
        <h1 className="text-lg font-bold">Cart ({items.length})</h1>
      </div>

      {groups.map((group) => (
        <div key={group.storeId} className="px-4 py-4 border-b border-neutral-50">
          <p className="text-sm font-semibold mb-3">{group.storeName}</p>
          {group.items.map((item) => (
            <div key={item.key} className="flex gap-3 mb-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                <LazyImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                {(item.variant?.size || item.variant?.color) && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p className="text-sm font-bold mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 border border-neutral-200 rounded-full">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-1.5">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="p-1.5">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.key)} className="p-1.5 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100 safe-bottom">
        <div className="flex justify-between mb-3">
          <span className="text-sm text-neutral-500">Subtotal</span>
          <span className="font-bold">{formatPrice(subtotal)}</span>
        </div>
        <Link
          to="/checkout"
          className="block w-full py-3.5 bg-neutral-900 text-white text-center font-semibold rounded-full"
        >
          Checkout
        </Link>
      </div>
    </div>
  )
}
