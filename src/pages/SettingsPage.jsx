import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../services/authService'
import { MALDIVES_ISLANDS } from '../utils/constants'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    island: profile?.island || 'Malé',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUserProfile(user.uid, form)
      await refreshProfile(user.uid)
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 py-4 border-b border-neutral-100">
        <h1 className="text-lg font-bold">Settings</h1>
      </div>
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3">
        <input
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          placeholder="Display name"
          className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none"
        />
        <input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="Phone number"
          className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none"
        />
        <select
          value={form.island}
          onChange={(e) => setForm((f) => ({ ...f, island: e.target.value }))}
          className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none"
        >
          {MALDIVES_ISLANDS.map((island) => (
            <option key={island} value={island}>{island}</option>
          ))}
        </select>
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
