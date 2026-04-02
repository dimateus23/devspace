const AVATAR_PALETTE = [
  { bg: 'rgba(0,112,243,0.15)', border: 'rgba(0,112,243,0.3)', text: '#338ef7' },
  { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', text: '#a78bfa' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
]

export default function Avatar({ username, size = 8, large = false }) {
  const initial = (username ?? '?')[0].toUpperCase()
  const palette = AVATAR_PALETTE[(username?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length]

  if (large) {
    return (
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0"
        style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.text }}
      >
        {initial}
      </div>
    )
  }

  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-semibold shrink-0`}
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.text }}
    >
      {initial}
    </div>
  )
}
