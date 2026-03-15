import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { timeAgo } from '../lib/utils'

const AVATAR_PALETTE = [
  { bg: 'rgba(0,112,243,0.15)', border: 'rgba(0,112,243,0.3)', text: '#338ef7' },
  { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', text: '#a78bfa' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
]

function Avatar({ username }) {
  const initial = (username ?? '?')[0].toUpperCase()
  const palette = AVATAR_PALETTE[(username?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length]
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.text }}
    >
      {initial}
    </div>
  )
}

export default function PostCard({ post, currentUser, onUpdate }) {
  const [optimisticLiked, setOptimisticLiked] = useState(
    post.likes?.some((l) => l.user_id === currentUser?.id) ?? false
  )
  const [optimisticCount, setOptimisticCount] = useState(post.likes?.length ?? 0)
  const [liking, setLiking] = useState(false)
  const [popAnim, setPopAnim] = useState(false)

  const toggleLike = async () => {
    if (!currentUser || liking) return
    setLiking(true)

    if (!optimisticLiked) {
      setPopAnim(true)
      setTimeout(() => setPopAnim(false), 350)
    }

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
    <article className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 card-hover group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar username={post.profiles?.username} />
          <div>
            <p className="text-sm font-medium text-white leading-none">
              {post.profiles?.username ?? 'Unknown'}
            </p>
            <p className="text-xs text-[#444] mt-0.5">{timeAgo(post.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap mb-3">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#0070f3]/8 text-[#338ef7] border border-[#0070f3]/15 px-2 py-0.5 rounded-md font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-[#111]">
        <button
          onClick={toggleLike}
          disabled={!currentUser}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all duration-150 ${
            optimisticLiked
              ? 'text-rose-400 bg-rose-500/8'
              : 'text-[#444] hover:text-rose-400 hover:bg-rose-500/8 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={optimisticLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className={`w-3.5 h-3.5 transition-transform duration-150 ${popAnim ? 'animate-[like-pop_0.35s_ease]' : ''}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span className="tabular-nums">{optimisticCount > 0 ? optimisticCount : ''}</span>
          <span>{optimisticLiked ? 'Liked' : 'Like'}</span>
        </button>
      </div>
    </article>
  )
}
