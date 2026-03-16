import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { timeAgo } from '../lib/utils'
import MarkdownViewer from './MarkdownViewer'

const AVATAR_PALETTE = [
  { bg: 'rgba(0,112,243,0.15)', border: 'rgba(0,112,243,0.3)', text: '#338ef7' },
  { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', text: '#a78bfa' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
]

function Avatar({ username, size = 8 }) {
  const initial = (username ?? '?')[0].toUpperCase()
  const palette = AVATAR_PALETTE[(username?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length]
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-semibold shrink-0`}
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.text }}
    >
      {initial}
    </div>
  )
}

function CommentItem({ comment }) {
  return (
    <div className="flex gap-2.5 group">
      <Avatar username={comment.profiles?.username} size={6} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <Link
            to={`/profile/${comment.profiles?.username}`}
            className="text-xs font-medium text-white hover:text-[#338ef7] transition-colors duration-150"
          >
            {comment.profiles?.username ?? 'Unknown'}
          </Link>
          <span className="text-xs text-[#333]">{timeAgo(comment.created_at)}</span>
        </div>
        <div className="mt-0.5"><MarkdownViewer content={comment.content} compact dimmed /></div>
      </div>
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

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(
    [...(post.comments ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  )
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (showComments) inputRef.current?.focus()
  }, [showComments])

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
      if (post.user_id !== currentUser.id) {
        supabase.from('notifications').upsert(
          { recipient_id: post.user_id, actor_id: currentUser.id, type: 'like', post_id: post.id, read: false },
          { onConflict: 'post_id,actor_id,type' }
        ).then()
      }
    }
    setLiking(false)
  }

  const submitComment = async (e) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text || !currentUser || submitting) return
    setSubmitting(true)

    // Optimistic insert
    const optimistic = {
      id: `temp-${Date.now()}`,
      post_id: post.id,
      user_id: currentUser.id,
      content: text,
      created_at: new Date().toISOString(),
      profiles: { username: currentUser.email?.split('@')[0] },
    }
    setComments((prev) => [...prev, optimistic])
    setCommentText('')

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: currentUser.id, content: text })
      .select('id, content, created_at, user_id, profiles!comments_user_id_fkey (username)')
      .single()

    if (error) {
      // Rollback
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      setCommentText(text)
    } else {
      // Replace optimistic entry with real one
      setComments((prev) => prev.map((c) => (c.id === optimistic.id ? data : c)))
      if (post.user_id !== currentUser.id) {
        supabase.from('notifications').insert(
          { recipient_id: post.user_id, actor_id: currentUser.id, type: 'comment', post_id: post.id }
        ).then()
      }
    }
    setSubmitting(false)
  }

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitComment(e)
    }
  }

  return (
    <article className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl card-hover group">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Link to={`/profile/${post.profiles?.username}`}>
              <Avatar username={post.profiles?.username} size={8} />
            </Link>
            <div>
              <Link
                to={`/profile/${post.profiles?.username}`}
                className="text-sm font-medium text-white hover:text-[#338ef7] transition-colors duration-150 leading-none"
              >
                {post.profiles?.username ?? 'Unknown'}
              </Link>
              <p className="text-xs text-[#444] mt-0.5">{timeAgo(post.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <MarkdownViewer content={post.content} />
        </div>

        {/* Image */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post attachment"
            className="w-full rounded-lg mb-3 max-h-96 object-cover border border-[#1a1a1a]"
          />
        )}

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
          {/* Like */}
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
              className={`w-3.5 h-3.5 ${popAnim ? 'animate-[like-pop_0.35s_ease]' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {optimisticCount > 0 && <span className="tabular-nums">{optimisticCount}</span>}
            <span>{optimisticLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all duration-150 ${
              showComments
                ? 'text-[#0070f3] bg-[#0070f3]/8'
                : 'text-[#444] hover:text-[#888] hover:bg-[#111]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {comments.length > 0 && <span className="tabular-nums">{comments.length}</span>}
            <span>Comment{comments.length !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-[#111] px-5 pt-4 pb-5 space-y-4">
          {/* Comment list */}
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#333] text-center py-2">No comments yet. Be the first.</p>
          )}

          {/* Comment input */}
          {currentUser ? (
            <form onSubmit={submitComment} className="flex gap-2.5 items-start pt-1">
              <Avatar username={currentUser.email?.split('@')[0]} size={6} />
              <div className="flex-1 flex items-center gap-2 bg-black border border-[#1a1a1a] rounded-lg px-3 py-2 focus-within:border-[#2a2a2a] transition-colors duration-150">
                <input
                  ref={inputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  placeholder="Add a comment… (Enter to post)"
                  className="flex-1 bg-transparent text-xs text-white placeholder-[#333] outline-none"
                />
                {commentText.trim() && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="text-[#0070f3] hover:text-[#338ef7] disabled:opacity-40 transition-colors duration-150 shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          ) : (
            <p className="text-xs text-[#333] text-center">
              <a href="/login" className="text-[#338ef7] hover:underline">Sign in</a> to comment.
            </p>
          )}
        </div>
      )}
    </article>
  )
}
