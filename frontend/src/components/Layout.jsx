import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0070f3] flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 0.5L12 3.5V9.5L6.5 12.5L1 9.5V3.5L6.5 0.5Z" fill="white"/>
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">DevSpace</span>
            </Link>

            {user && (
              <nav className="flex items-center gap-1">
                <Link
                  to="/feed"
                  className={`text-sm px-3 py-1.5 rounded-md transition-colors duration-150 ${
                    isActive('/feed')
                      ? 'text-white bg-[#1a1a1a]'
                      : 'text-[#888] hover:text-white hover:bg-[#111]'
                  }`}
                >
                  Feed
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0070f3]/15 border border-[#0070f3]/25 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#338ef7]">
                      {user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-[#555]">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-[#555] hover:text-white transition-colors duration-150 px-3 py-1.5 rounded-md hover:bg-[#111]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-md hover:bg-white/90 transition-colors duration-150"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
