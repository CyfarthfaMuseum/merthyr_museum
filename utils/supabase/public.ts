import { createClient } from '@supabase/supabase-js'

// Cookie-free anon client for public server-side queries.
// Never uses session cookies, so Supabase always treats requests as the anon
// role regardless of whether an admin is logged in on the same origin.
export function createPublicClient() {
  const isDev = process.env.NEXT_PUBLIC_IS_DEV === 'true'
  const url = isDev
    ? process.env.NEXT_PUBLIC_SUPABASE_DEV_URL!
    : process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = isDev
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_DEV_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
