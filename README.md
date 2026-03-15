<div align="center">

<h1>DevSpace</h1>

<p><strong>The developer community for people who ship.</strong></p>

<p>
  <a href="https://devspace-zeta.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-devspace--zeta.vercel.app-0070f3?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

</div>

---

## What is DevSpace?

DevSpace is a focused social platform built for developers who build in public. Share what you're working on, get feedback from peers, like and comment on posts, follow other builders through their profiles, and get notified when people engage with your work — all in a clean, fast, dark UI inspired by Linear and Vercel.

No algorithmic noise. No engagement bait. Just developers shipping things.

---

## Screenshot

```
┌─────────────────────────────────────────────────────┐
│  [ Screenshot placeholder — add yours here ]        │
│                                                     │
│  Recommended: a full-page screenshot of the Feed   │
│  or Home page at 1440×900, saved as               │
│  docs/screenshot.png and linked below.             │
└─────────────────────────────────────────────────────┘
```

---

## Features

- 🔐 **Auth** — Email/password sign-up and sign-in via Supabase Auth; profiles auto-created on first login
- 📝 **Posts** — Create posts with content and up to 5 topic tags; rendered in a real-time feed
- ❤️ **Likes** — One-click optimistic like/unlike with animated heart and live count
- 💬 **Comments** — Expandable per-post comment threads with optimistic insert and rollback
- 🔔 **Notifications** — Real-time bell icon with unread badge; notified when someone likes or comments on your post; mark individual or all as read
- 👤 **Profiles** — Public profile pages at `/profile/:username` showing avatar, bio, GitHub, website, and all posts; owners can edit inline
- 🎨 **Design** — Dark minimalist UI (pure black, `#0070f3` accent, Inter font) with blur navbar, gradient hero, card hover effects, and micro-animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | [React 18](https://react.dev) + [Vite 5](https://vitejs.dev) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com) + Inter (Google Fonts) |
| **Routing** | [React Router 6](https://reactrouter.com) |
| **Backend** | [Node.js](https://nodejs.org) + [Express 4](https://expressjs.com) |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL + Row Level Security) |
| **Auth** | Supabase Auth (email/password) |
| **Realtime** | Supabase Realtime (notifications channel) |
| **Deployment** | [Vercel](https://vercel.com) (frontend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Clone the repo

```bash
git clone https://github.com/dimateus23/devspace.git
cd devspace
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**
3. Paste and run the full contents of [`supabase/schema.sql`](supabase/schema.sql)
4. In **Project Settings → API**, copy your **Project URL** and **anon key**

### 3. Configure environment variables

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

Then fill in both files (see [Environment Variables](#environment-variables) below).

### 4. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 5. Run the development servers

```bash
# Terminal 1 — backend (http://localhost:3001)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — sign up, run the schema, and you're good to go.

---

## Environment Variables

### `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key (safe to expose in browser) | `eyJhbGci...` |

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `3001` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **keep this secret, never expose to the browser** | `eyJhbGci...` |

---

## Project Structure

```
devspace/
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx      # Navbar (blur, notifications bell, nav links)
│   │   │   ├── PostCard.jsx    # Post with like, comment thread, tag chips
│   │   │   ├── CreatePost.jsx  # Compose form with tag input
│   │   │   └── NotificationsBell.jsx  # Dropdown bell with realtime updates
│   │   ├── hooks/
│   │   │   ├── useAuth.js      # Session, profile auto-create, sign out
│   │   │   └── useNotifications.js    # Fetch + realtime + mark-read
│   │   ├── lib/
│   │   │   ├── supabase.js     # Supabase client
│   │   │   └── utils.js        # timeAgo helper
│   │   └── pages/
│   │       ├── Home.jsx        # Hero, feature cards, CTA
│   │       ├── Feed.jsx        # Post list + CreatePost
│   │       ├── Login.jsx       # Sign in / Sign up
│   │       └── Profile.jsx     # Public profile + edit mode
│   ├── tailwind.config.js      # Design tokens, keyframes (like-pop, fade-up)
│   └── index.html
│
├── backend/                    # Express API
│   └── src/
│       ├── index.js            # Server entry, CORS, route mount
│       ├── middleware/
│       │   └── auth.js         # Supabase JWT verification
│       └── routes/
│           └── index.js        # API routes
│
└── supabase/
    └── schema.sql              # Full DB schema: tables, RLS policies, triggers
```

---

## Database Schema

```
profiles      — id, username, bio, github_url, website_url, avatar_url
posts         — id, user_id, content, tags[], created_at
likes         — id, post_id, user_id  [unique per post+user]
comments      — id, post_id, user_id, content, created_at
notifications — id, recipient_id, actor_id, type, post_id, read  [unique like per post+actor]
```

All tables have Row Level Security enabled. Users can only insert/delete their own rows; reads are public.

---

## Contributing

Contributions are welcome. Here's the flow:

1. **Fork** the repository
2. **Create a branch** — `git checkout -b feat/your-feature`
3. **Make your changes** and test locally
4. **Commit** with a descriptive message
5. **Open a pull request** — describe what you changed and why

For larger changes, open an issue first to discuss the approach.

---

## License

[MIT](LICENSE) — do whatever you want with it. A star ⭐ is appreciated if you find it useful.

---

<div align="center">
  <sub>Built with React, Supabase, and too much coffee.</sub>
</div>
