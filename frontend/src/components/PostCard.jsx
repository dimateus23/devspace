import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { timeAgo } from '../lib/utils'

const AVATAR_COLORS = ['bg-sky-600', 'bg-violet-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600']

function Avatar({ username }) {
  const initials = (username ?? '?').slice(0, 2).toUpperCase()
  const color = AVATAR_COLORS[(username?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
      {initials}
    </div>
  )
}

export default function PostCard({ post, currentUser, onUpdate }) {
  const [optimisticLiked, setOptimisticLiked] = useState(
    post.likes?.some((l) => l.user_id === currentUser?.id) ?? false
  )
  const [optimisticCount, setOptimisticCount] = useState(post.likes?.length ?? 0)
  const [liking, setLiking] = useState(false)

  const toggleLike = async () => {
    if (!currentUser || liking) return
    setLiking(true)
    if (optimisticLiked) {
      setOptimisticLiked(false)
      setOptimisticCount((c) => c - 1)
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', currentUser.id)
    } else {
      setOptimisticLiked(true)
      setOptimisticCount((c) => c + 1)
      await supabase.from('likes').insert({ post_id: post.id, user_id: currentUser.id })
    }
    setLiking(false)
  }

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar username={post.profiles?.username} />
        <div>
          <p className="text-sm font-semibold text-white">{post.profiles?.username ?? 'Unknown'}</p>
          <p className="text-xs text-gray-500">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="pt-1 border-t border-gray-800">
        <button
          onClick={toggleLike}
          disabled={!currentUser}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
            optimisticLiked
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-gray-500 hover:text-rose-400 hover:bg-rose-500/10'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={optimisticLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {optimisticCount > 0 && <span>{optimisticCount}</span>}
          <span>{optimisticLiked ? 'Liked' : 'Like'}</span>
        </button>
      </div>
    </article>
  )
}
