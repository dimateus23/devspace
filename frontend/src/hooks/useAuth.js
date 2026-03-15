import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

async function ensureProfile(authUser) {
  if (!authUser) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (data) return data

  // PGRST116 = row not found — create the profile
  if (error?.code === 'PGRST116') {
    const username = authUser.email
      .split('@')[0]
      .replace(/[^a-z0-9_]/gi, '')
      .toLowerCase()
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ id: authUser.id, username })
      .select()
      .single()
    return newProfile
  }

  return null
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      setLoading(false) // unblock the UI immediately
      if (authUser) ensureProfile(authUser).then(setProfile)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      if (authUser) ensureProfile(authUser).then(setProfile)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return { user, profile, loading, signOut }
}
