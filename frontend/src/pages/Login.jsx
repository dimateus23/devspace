import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
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
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 py-16">
      {/* Logo mark */}
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#0070f3] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 0.5L12 3.5V9.5L6.5 12.5L1 9.5V3.5L6.5 0.5Z" fill="white"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">DevSpace</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-[#555] text-sm mt-2">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null) }}
              className="text-[#338ef7] hover:text-white transition-colors duration-150"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 space-y-4"
        >
          {message && (
            <div className={`text-sm rounded-lg px-4 py-3 ${
              message.type === 'error'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888] uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-[#1a1a1a] rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] transition-colors duration-150"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888] uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-[#1a1a1a] rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] transition-colors duration-150"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0070f3] hover:bg-[#338ef7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-150 text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign in' : 'Create account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#333] mt-6">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  )
}
