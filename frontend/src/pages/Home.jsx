import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-16 space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Welcome to <span className="text-sky-400">DevSpace</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          A social platform built for developers. Share projects, connect with peers, and grow together.
        </p>
        {!user && (
          <div className="pt-4">
            <a
              href="/login"
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Get started
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Share Projects', desc: 'Showcase what you\'re building with the dev community.' },
          { title: 'Find Collaborators', desc: 'Connect with developers who share your interests.' },
          { title: 'Grow Together', desc: 'Learn, contribute, and level up your skills.' },
        ].map((card) => (
          <div key={card.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-2">
            <h3 className="font-semibold text-white">{card.title}</h3>
            <p className="text-gray-400 text-sm">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
