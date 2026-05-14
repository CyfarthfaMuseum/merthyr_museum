import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const isDev = process.env.NEXT_PUBLIC_IS_DEV === 'true'
  const url = isDev ? process.env.NEXT_PUBLIC_SUPABASE_DEV_URL! : process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = isDev ? process.env.NEXT_PUBLIC_SUPABASE_ANON_DEV_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignored in Server Components
          }
        },
      },
    }
  )
}