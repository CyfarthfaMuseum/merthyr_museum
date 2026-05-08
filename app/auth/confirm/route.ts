import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/overview'
  const lang = searchParams.get('lang')

  if (token_hash && type) {
    // For invite tokens, pass the token to the accept-invite page for
    // client-side verification — avoids server-side session cookie transfer issues.
    if (type === 'invite') {
      const destUrl = new URL('/accept-invite', origin)
      destUrl.searchParams.set('token_hash', token_hash)
      destUrl.searchParams.set('type', type)
      if (lang === 'cy' || lang === 'en') destUrl.searchParams.set('lang', lang)
      return NextResponse.redirect(destUrl)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      const destUrl = new URL(next, origin)
      if (lang === 'cy' || lang === 'en') destUrl.searchParams.set('lang', lang)
      return NextResponse.redirect(destUrl)
    }
  }

  return NextResponse.redirect(new URL('/login?error=invalid_link', origin))
}
