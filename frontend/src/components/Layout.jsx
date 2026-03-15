import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-sky-400 tracking-tight">
              DevSpace
            </Link>
            {user && (
              <Link to="/feed" className="text-sm text-gray-400 hover:text-white transition-colors">
                Feed
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm bg-sky-500 hover:bg-sky-600 text-white px-4 py-1.5 rounded-md transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
