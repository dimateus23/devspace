import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { timeAgo } from '../lib/utils'
import { useNotifications } from '../hooks/useNotifications'

const AVATAR_PALETTE = [
  { bg: 'rgba(0,112,243,0.15)', border: 'rgba(0,112,243,0.3)', text: '#338ef7' },
  { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', text: '#a78bfa' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
]

function MiniAvatar({ username }) {
  const initial = (username ?? '?')[0].toUpperCase()
  const palette = AVATAR_PALETTE[(username?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length]
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.text }}
    >
      {initial}
    </div>
  )
}

function notificationText(n) {
  if (n.type === 'like') return <><span className="text-white font-medium">{n.actor?.username}</span> liked your post</>
  if (n.type === 'comment') return <><span className="text-white font-medium">{n.actor?.username}</span> commented on your post</>
  return null
}

export default function NotificationsBell({ user }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user)
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleNotificationClick = async (n) => {
    if (!n.read) await markAsRead(n.id)
    setOpen(false)
    navigate(`/profile/${n.recipient?.username}`)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150 ${
          open ? 'bg-[#1a1a1a] text-white' : 'text-[#555] hover:text-white hover:bg-[#111]'
        }`}
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#111]">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#555] hover:text-white transition-colors duration-150"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" className="mx-auto mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p className="text-xs text-[#333]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-[#111] ${
                    !n.read ? 'bg-[#0070f3]/[0.04]' : ''
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-2 shrink-0">
                    {!n.read
                      ? <span className="block w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
                      : <span className="block w-1.5 h-1.5" />
                    }
                  </div>

                  <MiniAvatar username={n.actor?.username} />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#888] leading-relaxed">
                      {notificationText(n)}
                    </p>
                    <p className="text-xs text-[#333] mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>

                  {/* Type icon */}
                  <div className="shrink-0 mt-0.5">
                    {n.type === 'like' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f87171" stroke="none">
                        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#338ef7" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
