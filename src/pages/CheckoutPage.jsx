import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../services/firestoreService'
import { uploadImage } from '../services/storageService'
import { formatPrice } from '../utils/format'
import { MALDIVES_ISLANDS, PAYMENT_METHODS } from '../utils/constants'
import toast from 'react-hot-toast'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { items, getSubtotal, getStoreGroups, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: profile?.displayName || '',
    phone: profile?.phone || '',
    island: profile?.island || 'Malé',
    address: '',
    notes: '',
    deliveryType: 'delivery',
    paymentMethod: PAYMENT_METHODS.COD,
  })
  const [screenshot, setScreenshot] = useState(null)

  const subtotal = getSubtotal()
  const groups = getStoreGroups()

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please sign in'); navigate('/login'); return }
    if (!form.name || !form.phone || !form.address) {
      toast.error('Fill in all required fields')
      return
    }

    setLoading(true)
    try {
      let paymentScreenshot = null
      if (form.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && screenshot) {
        paymentScreenshot = await uploadImage(
          screenshot,
          `payments/${user.uid}/${Date.now()}.jpg`
        )
      }

      for (const group of groups) {
        const groupItems = group.items
        const groupSubtotal = groupItems.reduce((s, i) => s + i.price * i.quantity, 0)
        await createOrder({
          userId: user.uid,
          storeId: group.storeId,
          storeName: group.storeName,
          items: groupItems.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
            variant: i.variant,
          })),
          subtotal: groupSubtotal,
          deliveryFee: 0,
          total: groupSubtotal,
          paymentMethod: form.paymentMethod,
          paymentScreenshot,
          deliveryAddress: {
            name: form.name,
            phone: form.phone,
            island: form.island,
            address: form.address,
            notes: form.notes,
          },
          deliveryType: form.deliveryType,
          orderNotes: form.notes,
        })
      }

      clearCart()
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      toast.error('Failed to place order')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="bg-white min-h-screen pb-8">
      <div className="px-4 py-4 border-b border-neutral-100">
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold mb-3">Delivery Details</h2>
          <div className="space-y-3">
            {['name', 'phone', 'address'].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                required={field !== 'notes'}
                className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            ))}
            <select
              name="island"
              value={form.island}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none"
            >
              {MALDIVES_ISLANDS.map((island) => (
                <option key={island} value={island}>{island}</option>
              ))}
            </select>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Order notes (optional)"
              rows={2}
              className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none resize-none"
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3">Delivery Type</h2>
          <div className="flex gap-2">
            {['delivery', 'pickup'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((f) => ({ ...f, deliveryType: type }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize ${
                  form.deliveryType === type
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3">Payment Method</h2>
          <div className="space-y-2">
            {[
              { id: PAYMENT_METHODS.COD, label: 'Cash on Delivery' },
              { id: PAYMENT_METHODS.BANK_TRANSFER, label: 'Bank Transfer' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, paymentMethod: id }))}
                className={`w-full py-3 px-4 rounded-xl text-sm font-medium text-left ${
                  form.paymentMethod === id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {form.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
            <div className="mt-3">
              <label className="text-xs text-neutral-500 mb-2 block">
                Upload payment screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                className="text-sm"
              />
            </div>
          )}
        </section>

        <section className="p-4 bg-neutral-50 rounded-2xl">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Delivery fees may be added by the seller. Payment confirmed manually.
          </p>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-neutral-900 text-white font-semibold rounded-full disabled:opacity-50"
        >
          {loading ? 'Placing order...' : `Place Order · ${formatPrice(subtotal)}`}
        </button>
      </form>
    </div>
  )
}
