import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useDebounce } from '../hooks/useDebounce'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'

const PAGE_SIZE = 10

export default function Feed() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const { ref, inView } = useInView()

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['posts', debouncedSearch],
    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      let q = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (id, username),
          likes (id, user_id),
          comments (id, content, created_at, user_id, profiles!comments_user_id_fkey (username))
        `)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (debouncedSearch.trim()) {
        q = q.contains('tags', [debouncedSearch.trim().toLowerCase()])
      }
      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flatMap((page) => page) ?? []

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#0070f3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Feed</h1>
            <p className="text-sm text-[#555] mt-0.5">What the community is building</p>
          </div>
          {posts.length > 0 && (
            <span className="text-xs text-[#555] bg-[#111] border border-[#1a1a1a] px-2.5 py-1 rounded-full">
              {posts.length}{hasNextPage ? '+' : ''} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-2.5 focus-within:border-[#2a2a2a] transition-colors duration-200">
          <svg className="w-4 h-4 text-[#555] mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tag (e.g. react)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#555] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#555] hover:text-[#fff] transition-colors ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <CreatePost />

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#333" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-3.633a1.125 1.125 0 01.865-.501 48.18 48.18 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
              </svg>
            </div>
            <p className="text-[#555] text-sm">
              {searchQuery.trim() ? 'No posts match your search.' : 'No posts yet. Be the first to share something.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={ref} className="h-1" />

        {/* Loading next page */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-[#0070f3] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* End of feed */}
        {!hasNextPage && posts.length >= PAGE_SIZE && (
          <p className="text-center text-xs text-[#333] py-4">You've reached the end</p>
        )}
      </div>
    </div>
  )
}
