import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L12 12l-2.25-2.25M3 10a7 7 0 1014 0A7 7 0 003 10z"/>
      </svg>
    ),
    title: 'Ship in public',
    desc: 'Share what you\'re building, get feedback early, and build in the open with a community that gets it.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
      </svg>
    ),
    title: 'Find your people',
    desc: 'Connect with developers who share your stack, interests, and ambitions. Real conversations, no noise.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
      </svg>
    ),
    title: 'Move faster',
    desc: 'Get unstuck quickly. Ask questions, share wins, and learn from builders who\'ve been there.',
  },
]

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#0070f3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Subtle radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,112,243,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 border border-[#1a1a1a] bg-[#0a0a0a] rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] animate-pulse" />
          <span className="text-xs text-[#888] font-medium tracking-wide">Built for developers</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          <span className="gradient-text">Build in public.</span>
          <br />
          <span className="gradient-text-blue">Ship together.</span>
        </h1>

        <p className="text-[#888] text-lg sm:text-xl max-w-lg mx-auto mb-10 leading-relaxed font-light">
          The developer community for sharing what you're building, finding collaborators, and growing your craft.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {user ? (
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 bg-[#0070f3] hover:bg-[#338ef7] text-white font-medium px-6 py-2.5 rounded-lg transition-colors duration-150 text-sm"
            >
              Go to Feed
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.75 7h8.5M7 2.75L11.25 7 7 11.25"/>
              </svg>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-black font-medium px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors duration-150 text-sm"
              >
                Get started free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.75 7h8.5M7 2.75L11.25 7 7 11.25"/>
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center text-[#888] hover:text-white font-medium px-6 py-2.5 rounded-lg border border-[#1a1a1a] hover:border-[#333] transition-colors duration-150 text-sm"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent" />
      </div>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 card-hover"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Top gradient line on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0070f3] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

              <div className="text-[#555] group-hover:text-[#0070f3] transition-colors duration-200 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[#555] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      {!user && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 60% 80% at 50% 120%, rgba(0,112,243,0.08) 0%, transparent 70%)',
              }}
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 relative">
              Ready to build in public?
            </h2>
            <p className="text-[#555] text-sm mb-8 relative">Join developers sharing their journey every day.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#0070f3] hover:bg-[#338ef7] text-white font-medium px-8 py-3 rounded-lg transition-colors duration-150 text-sm relative"
            >
              Start for free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.75 7h8.5M7 2.75L11.25 7 7 11.25"/>
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
