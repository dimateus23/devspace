import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import PostCard from '../components/PostCard'

const AVATAR_PALETTE = [
  { bg: 'rgba(0,112,243,0.15)', border: 'rgba(0,112,243,0.3)', text: '#338ef7' },
  { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', text: '#a78bfa' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
]

function LargeAvatar({ username }) {
  const initial = (username ?? '?')[0].toUpperCase()
  const palette = AVATAR_PALETTE[(username?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length]
  return (
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0"
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.text }}
    >
      {initial}
    </div>
  )
}

function ExternalLink({ href, children }) {
  if (!href) return null
  const display = href.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return (
    <a
      href={href.startsWith('http') ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-sm text-[#555] hover:text-white transition-colors duration-150"
    >
      {children}
      <span>{display}</span>
    </a>
  )
}

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ bio: '', github_url: '', website_url: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const isOwner = user && profile && user.id === profile.id

  const fetchProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(data)
    setForm({ bio: data.bio ?? '', github_url: data.github_url ?? '', website_url: data.website_url ?? '' })

    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (id, username),
        likes (id, user_id),
        comments (id, content, created_at, user_id, profiles!comments_user_id_fkey (username))
      `)
      .eq('user_id', data.id)
      .order('created_at', { ascending: false })

    setPosts(postsData ?? [])
    setLoading(false)
  }, [username])

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    fetchProfile()
  }, [fetchProfile])

  const startEdit = () => {
    setForm({ bio: profile.bio ?? '', github_url: profile.github_url ?? '', website_url: profile.website_url ?? '' })
    setSaveError(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setSaveError(null)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)

    const { data, error } = await supabase
      .from('profiles')
      .update({
        bio: form.bio.trim() || null,
        github_url: form.github_url.trim() || null,
        website_url: form.website_url.trim() || null,
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (error) {
      setSaveError(error.message)
    } else {
      setProfile(data)
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#0070f3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-4xl mb-3">404</p>
        <p className="text-[#555] text-sm">No user found with username <span className="text-white">@{username}</span>.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Profile card */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <div className="flex items-start gap-5">
            <LargeAvatar username={profile.username} />

            <div className="flex-1 min-w-0">
              {/* Name + edit button */}
              <div className="flex items-center justify-between gap-3 mb-1">
                <h1 className="text-xl font-bold text-white tracking-tight">@{profile.username}</h1>
                {isOwner && !editing && (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 text-xs text-[#555] hover:text-white border border-[#1a1a1a] hover:border-[#333] px-3 py-1.5 rounded-md transition-colors duration-150 shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                    Edit profile
                  </button>
                )}
              </div>

              {/* Member since */}
              <p className="text-xs text-[#333] mb-3">
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>

              {/* View mode */}
              {!editing && (
                <div className="space-y-2">
                  {profile.bio && (
                    <p className="text-sm text-[#888] leading-relaxed">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
                    <ExternalLink href={profile.github_url}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                    </ExternalLink>
                    <ExternalLink href={profile.website_url}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
                      </svg>
                    </ExternalLink>
                  </div>
                </div>
              )}

              {/* Edit mode */}
              {editing && (
                <form onSubmit={saveEdit} className="space-y-3 mt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      placeholder="Tell the community what you're building..."
                      rows={2}
                      maxLength={200}
                      className="w-full bg-black border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm placeholder-[#333] resize-none focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] transition-colors duration-150"
                    />
                    <p className="text-xs text-[#333] text-right">{form.bio.length}/200</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#555] uppercase tracking-wider">GitHub URL</label>
                    <input
                      type="url"
                      value={form.github_url}
                      onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                      placeholder="https://github.com/username"
                      className="w-full bg-black border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] transition-colors duration-150"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#555] uppercase tracking-wider">Website URL</label>
                    <input
                      type="url"
                      value={form.website_url}
                      onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                      placeholder="https://yoursite.com"
                      className="w-full bg-black border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] transition-colors duration-150"
                    />
                  </div>

                  {saveError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {saveError}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 bg-[#0070f3] hover:bg-[#338ef7] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
                    >
                      {saving ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-xs text-[#555] hover:text-white border border-[#1a1a1a] hover:border-[#333] px-4 py-2 rounded-lg transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-sm font-medium text-[#555] uppercase tracking-wider mb-4">
            Posts · {posts.length}
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
              <p className="text-[#333] text-sm">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchProfile} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
