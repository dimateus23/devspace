# DevSpace

A social platform built for developers. Share projects, connect with peers, and grow together.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Project Structure

```
devspace/
├── frontend/   # React + Vite app (port 5173)
└── backend/    # Express API (port 3001)
```

## Getting Started

### 1. Configure environment variables

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

Fill in your Supabase project URL and keys in both `.env` files.

### 2. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 3. Run development servers

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

The frontend will be available at http://localhost:5173 and the API at http://localhost:3001.

## API

| Method | Path         | Description        |
|--------|--------------|--------------------|
| GET    | /api/health  | Health check       |
