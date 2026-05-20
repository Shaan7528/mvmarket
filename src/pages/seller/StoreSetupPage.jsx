import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createStore } from '../../services/firestoreService'
import { uploadImage } from '../../services/storageService'
import { MALDIVES_ISLANDS } from '../../utils/constants'
import { ImageUploader } from '../../components/ImageUploader'
import toast from 'react-hot-toast'

export function StoreSetupPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [form, setForm] = useState({
    name: '', username: '', description: '', island: 'Malé',
    whatsapp: '', telegram: '', deliveryInfo: '', deliveryFee: 0,
    pickupAvailable: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let logo = null, banner = null
      if (logoFile?.[0]?.file) {
        logo = await uploadImage(logoFile[0].file, `stores/${user.uid}/logo.jpg`)
      }
      if (bannerFile?.[0]?.file) {
        banner = await uploadImage(bannerFile[0].file, `stores/${user.uid}/banner.jpg`)
      }
      await createStore(user.uid, { ...form, logo, banner })
      await refreshProfile(user.uid)
      toast.success('Store created! Awaiting admin approval.')
      navigate('/seller')
    } catch (err) {
      toast.error(err.message || 'Failed to create store')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">Open your store</h1>
      <p className="text-sm text-neutral-500 mb-6">Set up your shop on MarketMV</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Store name" required
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm" />
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username (e.g. myshop)" required
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3}
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm resize-none" />
        <select name="island" value={form.island} onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm">
          {MALDIVES_ISLANDS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp number" required
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm" />
        <input name="telegram" value={form.telegram} onChange={handleChange} placeholder="Telegram username (optional — contact only)"
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm" />
        <p className="text-xs text-neutral-500 -mt-2">
          Orders are not sent to Telegram. You will receive them in Seller Dashboard → Orders.
        </p>
        <textarea name="deliveryInfo" value={form.deliveryInfo} onChange={handleChange} placeholder="Delivery info" rows={2}
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm resize-none" />
        <input name="deliveryFee" type="number" value={form.deliveryFee} onChange={handleChange} placeholder="Delivery fee (MVR)"
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="pickupAvailable" checked={form.pickupAvailable} onChange={handleChange} />
          Pickup available
        </label>
        <ImageUploader label="Store logo" maxImages={1} onChange={setLogoFile} />
        <ImageUploader label="Store banner" maxImages={1} onChange={setBannerFile} />
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Store'}
        </button>
      </form>
    </div>
  )
}
