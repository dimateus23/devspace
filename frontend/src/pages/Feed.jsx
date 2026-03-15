import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'

export default function Feed() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (id, username),
        likes (id, user_id)
      `)
      .order('created_at', { ascending: false })

    if (!error) setPosts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-lg font-semibold text-white">Feed</h1>
      <CreatePost onPost={fetchPosts} />
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No posts yet. Be the first!</p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchPosts} />
        ))
      )}
    </div>
  )
}
