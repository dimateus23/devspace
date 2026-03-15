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
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What are you building? Share an update, question, or thought..."
        rows={3}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />

      {/* Tag input */}
      <div className="flex flex-wrap gap-1.5 items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 min-h-[38px] focus-within:ring-2 focus-within:ring-sky-500">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full"
          >
            #{tag}
            <button
              type="button"
              onClick={() => setTags((t) => t.filter((x) => x !== tag))}
              className="text-sky-400/60 hover:text-sky-300 leading-none"
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
          placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)' : ''}
          className="flex-1 min-w-[140px] bg-transparent text-white text-xs placeholder-gray-500 outline-none"
        />
      </div>
      <p className="text-xs text-gray-600">Up to 5 tags</p>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
