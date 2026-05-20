import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getStore, updateStore } from '../../services/firestoreService'
import { uploadImage } from '../../services/storageService'
import { MALDIVES_ISLANDS, STORE_STATUS } from '../../utils/constants'
import { ImageUploader } from '../../components/ImageUploader'
import { LazyImage } from '../../components/ui/LazyImage'
import toast from 'react-hot-toast'

export function SellerSettings() {
  const { user, profile } = useAuth()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStore, setLoadingStore] = useState(true)
  const [logoImages, setLogoImages] = useState([])
  const [bannerImages, setBannerImages] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    island: 'Malé',
    whatsapp: '',
    telegram: '',
    deliveryInfo: '',
    deliveryFee: 0,
    pickupAvailable: true,
  })

  useEffect(() => {
    if (!profile?.storeId) {
      setLoadingStore(false)
      return
    }
    getStore(profile.storeId).then((s) => {
      if (s) {
        setStore(s)
        setForm({
          name: s.name || '',
          description: s.description || '',
          island: s.island || 'Malé',
          whatsapp: s.whatsapp || '',
          telegram: s.telegram || '',
          deliveryInfo: s.deliveryInfo || '',
          deliveryFee: s.deliveryFee ?? 0,
          pickupAvailable: s.pickupAvailable ?? true,
        })
        setLogoImages(s.logo ? [s.logo] : [])
        setBannerImages(s.banner ? [s.banner] : [])
      }
      setLoadingStore(false)
    })
  }, [profile?.storeId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resolveImageUrl = async (images, storagePath, existingUrl) => {
    const item = images?.[0]
    if (!item) return existingUrl || null
    if (item.isNew && item.file) {
      return uploadImage(item.file, `${storagePath}/${Date.now()}.jpg`)
    }
    return item.url || existingUrl || null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile?.storeId || !user) return

    setLoading(true)
    try {
      const logo = await resolveImageUrl(
        logoImages,
        `stores/${user.uid}/logo`,
        store?.logo
      )
      const banner = await resolveImageUrl(
        bannerImages,
        `stores/${user.uid}/banner`,
        store?.banner
      )

      await updateStore(profile.storeId, {
        name: form.name.trim(),
        description: form.description.trim(),
        island: form.island,
        whatsapp: form.whatsapp.trim(),
        telegram: form.telegram.trim() || null,
        deliveryInfo: form.deliveryInfo.trim(),
        deliveryFee: Number(form.deliveryFee) || 0,
        pickupAvailable: form.pickupAvailable,
        logo,
        banner,
      })

      const updated = await getStore(profile.storeId)
      setStore(updated)
      if (updated?.logo) setLogoImages([updated.logo])
      if (updated?.banner) setBannerImages([updated.banner])

      toast.success('Store updated!')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to update store')
    } finally {
      setLoading(false)
    }
  }

  if (loadingStore) {
    return <div className="text-center py-12 text-neutral-400 text-sm">Loading store...</div>
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">You have not created a store yet.</p>
        <Link
          to="/seller/setup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium"
        >
          <Store className="w-4 h-4" />
          Open your store
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Store Settings</h1>
        {store.status === STORE_STATUS.APPROVED && store.username && (
          <Link
            to={`/store/${store.username}`}
            className="flex items-center gap-1 text-sm text-sky-600 font-medium"
          >
            View shop <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {store.status === STORE_STATUS.PENDING && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
          Your store is pending approval. You can still edit details here.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-800">Shop images</h2>
          <ImageUploader
            label="Store logo"
            maxImages={1}
            images={logoImages}
            onChange={setLogoImages}
          />
          <ImageUploader
            label="Store banner"
            maxImages={1}
            images={bannerImages}
            onChange={setBannerImages}
          />
          {(store.logo || store.banner) && (
            <div className="rounded-xl overflow-hidden border border-neutral-100">
              {store.banner && (
                <div className="h-24 bg-neutral-100">
                  <LazyImage src={store.banner} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-xs text-neutral-400 px-3 py-2">Preview updates after you save</p>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-800">Shop details</h2>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Store username</label>
            <input
              value={store.username}
              disabled
              className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-500"
            />
            <p className="text-xs text-neutral-400 mt-1">Username cannot be changed after setup.</p>
          </div>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Store name"
            required
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={3}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm resize-none"
          />
          <select
            name="island"
            value={form.island}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm"
          >
            {MALDIVES_ISLANDS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-800">Contact</h2>
          <input
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="WhatsApp number"
            required
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm"
          />
          <input
            name="telegram"
            value={form.telegram}
            onChange={handleChange}
            placeholder="Telegram username (optional, contact only)"
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-800">Delivery</h2>
          <textarea
            name="deliveryInfo"
            value={form.deliveryInfo}
            onChange={handleChange}
            placeholder="Delivery info (islands, timing, etc.)"
            rows={2}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm resize-none"
          />
          <input
            name="deliveryFee"
            type="number"
            min="0"
            value={form.deliveryFee}
            onChange={handleChange}
            placeholder="Delivery fee (MVR)"
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="pickupAvailable"
              checked={form.pickupAvailable}
              onChange={handleChange}
            />
            Pickup available
          </label>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
