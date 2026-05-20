import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmail, loginWithGoogle } from '../../services/authService'
import toast from 'react-hot-toast'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await registerWithEmail(form.email, form.password, form.name)
      toast.success('Account created!')
      navigate('/profile/setup')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Create account</h1>
      <p className="text-sm text-neutral-500 mb-6">Join MarketMV — shop or sell in the Maldives</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {['name', 'email', 'password'].map((field) => (
          <input
            key={field}
            type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
            value={form[field]}
            onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            required
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400">or</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <button
        onClick={async () => {
          try {
            await loginWithGoogle()
            navigate('/profile/setup')
          } catch (err) {
            toast.error(err.message)
          }
        }}
        className="w-full py-3 border border-neutral-200 font-medium rounded-full text-sm hover:bg-neutral-50"
      >
        Continue with Google
      </button>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-neutral-900">Sign in</Link>
      </p>
    </div>
  )
}
