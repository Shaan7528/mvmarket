import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { setUsername } from '../services/authService'
import toast from 'react-hot-toast'

export function ProfileSetupPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [username, setUsernameInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      toast.error('Username: 3-20 chars, lowercase letters, numbers, underscore')
      return
    }
    setLoading(true)
    try {
      await setUsername(user.uid, username)
      await refreshProfile(user.uid)
      toast.success('Username set!')
      navigate('/home')
    } catch (err) {
      toast.error(err.message || 'Failed to set username')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h1 className="text-xl font-bold mb-1">Choose a username</h1>
        <p className="text-sm text-neutral-500 mb-6">This will be your unique identity on MarketMV</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">@</span>
            <input
              value={username}
              onChange={(e) => setUsernameInput(e.target.value.toLowerCase())}
              placeholder="yourname"
              required
              className="w-full pl-8 pr-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
