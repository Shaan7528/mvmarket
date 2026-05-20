import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle } from '../../services/authService'
import toast from 'react-hot-toast'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      toast.success('Welcome back!')
      navigate('/home')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
      toast.success('Welcome!')
      navigate('/home')
    } catch (err) {
      toast.error(err.message || 'Google login failed')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Welcome back</h1>
      <p className="text-sm text-neutral-500 mb-6">Sign in to your MarketMV account</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400">or</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full py-3 border border-neutral-200 font-medium rounded-full text-sm hover:bg-neutral-50 flex items-center justify-center gap-2"
      >
        <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
        Continue with Google
      </button>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-neutral-900">Sign up</Link>
      </p>
    </div>
  )
}
