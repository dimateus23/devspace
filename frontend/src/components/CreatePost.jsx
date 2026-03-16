import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import MarkdownViewer from './MarkdownViewer'

export default function CreatePost({ onPost }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [previewing, setPreviewing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)

    const finalTags = tagInput.trim()
      ? [...tags, tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')]
      : tags

    let image_url = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('post_images')
        .upload(fileName, imageFile)
      if (uploadError) {
        setError(uploadError.message)
        setLoading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('post_images')
        .getPublicUrl(fileName)
      image_url = publicUrl
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim(),
      tags: finalTags.filter(Boolean),
      image_url,
    })

    if (error) {
      setError(error.message)
    } else {
      setContent('')
      setTags([])
      setTagInput('')
      setPreviewing(false)
      removeImage()
      onPost?.()
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 space-y-3 focus-within:border-[#2a2a2a] transition-colors duration-200"
    >
      {/* Write / Preview tabs */}
      <div className="flex items-center gap-1 -mb-1">
        <button
          type="button"
          onClick={() => setPreviewing(false)}
          className={`text-xs px-2.5 py-1 rounded-md transition-colors duration-150 ${
            !previewing ? 'text-white bg-[#1a1a1a]' : 'text-[#444] hover:text-[#888]'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className={`text-xs px-2.5 py-1 rounded-md transition-colors duration-150 ${
            previewing ? 'text-white bg-[#1a1a1a]' : 'text-[#444] hover:text-[#888]'
          }`}
        >
          Preview
        </button>
      </div>

      {previewing ? (
        <div className="min-h-[72px] py-1">
          {content.trim() ? (
            <MarkdownViewer content={content} />
          ) : (
            <p className="text-[#333] text-sm">Nothing to preview.</p>
          )}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are you building? Share an update, question, or thought..."
          rows={3}
          className="w-full bg-transparent text-white text-sm placeholder-[#333] resize-none focus:outline-none leading-relaxed"
        />
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="relative inline-block">
          <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg border border-[#1a1a1a] object-cover" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/70 text-[#888] hover:text-white rounded-full flex items-center justify-center transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

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
        <div className="flex items-center gap-3">
          {/* Image upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[#444] hover:text-[#888] transition-colors duration-150"
            title="Attach image"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <span className="text-xs text-[#333]">Markdown supported</span>
        </div>
        <div className="flex items-center gap-3">
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
      </div>
    </form>
  )
}
