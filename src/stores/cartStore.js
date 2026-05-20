import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant = {}, quantity = 1) => {
        const items = get().items
        const key = `${product.id}-${variant.size || ''}-${variant.color || ''}`
        const existing = items.find((i) => i.key === key)
        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          })
        } else {
          const price = product.discountPrice ?? product.price
          set({
            items: [
              ...items,
              {
                key,
                productId: product.id,
                storeId: product.storeId,
                storeName: product.storeName,
                name: product.name,
                image: product.images?.[0] || null,
                price,
                quantity,
                variant,
              },
            ],
          })
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) })
      },

      updateQuantity: (key, quantity) => {
        if (quantity < 1) {
          get().removeItem(key)
          return
        }
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getStoreGroups: () => {
        const groups = {}
        get().items.forEach((item) => {
          if (!groups[item.storeId]) {
            groups[item.storeId] = { storeId: item.storeId, storeName: item.storeName, items: [] }
          }
          groups[item.storeId].items.push(item)
        })
        return Object.values(groups)
      },
    }),
    { name: 'marketmv-cart' }
  )
)
