import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase env vars not set. Copy backend/.env.example to backend/.env')
}

export const supabase = createClient(
  supabaseUrl ?? 'http://localhost',
  supabaseServiceKey ?? 'placeholder'
)
