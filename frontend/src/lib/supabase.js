import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set. Create frontend/.env from frontend/.env.example')
}

export const supabase = createClient(
  supabaseUrl ?? 'http://localhost',
  supabaseAnonKey ?? 'placeholder'
)
