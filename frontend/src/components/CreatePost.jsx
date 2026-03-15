import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function CreatePost({ onPost }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags((t) => [...t, tag])
    }
    setTagInput('')
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput) {
      setTags((t) => t.slice(0, -1))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)

    const finalTags = tagInput.trim()
      ? [...tags, tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')]
      : tags

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim(),
      tags: finalTags.filter(Boolean),
    })

    if (error) {
      setError(error.message)
    } else {
      setContent('')
      setTags([])
      setTagInput('')
      onPost?.()
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 space-y-3 focus-within:border-[#2a2a2a] transition-colors duration-200"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What are you building? Share an update, question, or thought..."
        rows={3}
        className="w-full bg-transparent text-white text-sm placeholder-[#333] resize-none focus:outline-none leading-relaxed"
      />

      <div className="h-px bg-[#111]" />

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 items-center min-h-[28px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs bg-[#0070f3]/10 text-[#338ef7] border border-[#0070f3]/20 px-2 py-0.5 rounded-md font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={() => setTags((t) => t.filter((x) => x !== tag))}
              className="text-[#338ef7]/50 hover:text-[#338ef7] transition-colors leading-none ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={() => tagInput && addTag(tagInput)}
          placeholder={tags.length === 0 ? 'Add tags...' : tags.length < 5 ? 'Add more...' : ''}
          className="flex-1 min-w-[100px] bg-transparent text-white text-xs placeholder-[#333] outline-none"
        />
        {tags.length > 0 && (
          <span className="text-xs text-[#333] ml-auto">{tags.length}/5</span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-[#333]">
          {content.length > 0 && `${content.length} chars`}
        </p>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-[#0070f3] hover:bg-[#338ef7] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Posting...
            </span>
          ) : 'Post'}
        </button>
      </div>
    </form>
  )
}
