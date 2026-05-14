import { createBrowserClient } from '@supabase/ssr'

const isDev = process.env.NEXT_PUBLIC_IS_DEV === 'true'

const supabaseUrl = isDev
  ? process.env.NEXT_PUBLIC_SUPABASE_DEV_URL!
  : process.env.NEXT_PUBLIC_SUPABASE_URL!

const supabaseAnonKey = isDev
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_DEV_KEY!
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}