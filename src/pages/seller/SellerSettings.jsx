import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStore, updateStore } from '../../services/firestoreService'
import { uploadImage } from '../../services/storageService'
import { MALDIVES_ISLANDS } from '../../utils/constants'
import toast from 'react-hot-toast'

export function SellerSettings() {
  const { profile } = useAuth()
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile?.storeId) return
    getStore(profile.storeId).then((s) => {
      if (s) setForm({
        name: s.name, description: s.description, island: s.island,
        whatsapp: s.whatsapp, telegram: s.telegram || '',
        deliveryInfo: s.deliveryInfo, deliveryFee: s.deliveryFee,
        pickupAvailable: s.pickupAvailable,
      })
    })
  }, [profile?.storeId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateStore(profile.storeId, form)
      toast.success('Store updated!')
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Store Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
        {['name', 'description', 'whatsapp', 'telegram', 'deliveryInfo'].map((field) => (
          field === 'description' || field === 'deliveryInfo' ? (
            <textarea key={field} name={field} value={form[field] || ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              placeholder={field} rows={2}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm resize-none" />
          ) : (
            <input key={field} name={field} value={form[field] || ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              placeholder={field} className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm" />
          )
        ))}
        <select value={form.island || 'Malé'} onChange={(e) => setForm((f) => ({ ...f, island: e.target.value }))}
          className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm">
          {MALDIVES_ISLANDS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
