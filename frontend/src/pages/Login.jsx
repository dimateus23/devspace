import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else if (mode === 'signup') {
      setMessage({ type: 'success', text: 'Check your email to confirm your account.' })
    } else {
      navigate('/')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white">
          {mode === 'login' ? 'Sign in to DevSpace' : 'Create an account'}
        </h1>
        <p className="text-gray-400 text-sm">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null) }}
            className="text-sky-400 hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        {message && (
          <div className={`text-sm rounded-lg px-4 py-2.5 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
            {message.text}
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
