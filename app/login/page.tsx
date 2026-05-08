'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const LANG_STORAGE_KEY = 'herstories_ui_lang'

const strings = {
  en: {
    signIn: 'Sign In',
    signingIn: 'Signing In...',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    forgotPassword: 'Forgotten Password?',
    sending: 'Sending...',
    resetSent: 'Password reset email sent \u2014 check your inbox.',
    invalidLink: 'This password reset link is invalid or has expired. Please request a new one.',
    enterEmailFirst: 'Please enter your email address above first.',
  },
  cy: {
    signIn: 'Mewngofnodi',
    signingIn: 'Yn mewngofnodi...',
    emailPlaceholder: 'E-bost',
    passwordPlaceholder: 'Cyfrinair',
    forgotPassword: 'Wedi Anghofio Cyfrinair?',
    sending: 'Yn anfon...',
    resetSent: "E-bost ailosod cyfrinair wedi'i anfon \u2014 gwiriwch eich blwch derbyn.",
    invalidLink: "Mae'r ddolen ailosod cyfrinair hon yn annilys neu wedi dod i ben. Gofynnwch am un newydd.",
    enterEmailFirst: 'Rhowch eich cyfeiriad e-bost uchod yn gyntaf.',
  },
} as const

function LanguageToggle({ lang, setLang }: { lang: 'en' | 'cy'; setLang: (l: 'en' | 'cy') => void }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-[#b7b7b1] text-sm font-semibold">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-4 py-2 transition ${lang === 'en' ? 'bg-[#147a4c] text-white' : 'bg-white text-[#1f1f1f] hover:bg-neutral-50'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('cy')}
        className={`border-l border-[#b7b7b1] px-4 py-2 transition ${lang === 'cy' ? 'bg-[#147a4c] text-white' : 'bg-white text-[#1f1f1f] hover:bg-neutral-50'}`}
      >
        CY
      </button>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [lang, setLangState] = useState<'en' | 'cy'>('en')

  useEffect(() => {
    const urlLang = searchParams.get('lang')
    if (urlLang === 'cy' || urlLang === 'en') {
      setLangState(urlLang)
      localStorage.setItem(LANG_STORAGE_KEY, urlLang)
      return
    }
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === 'cy') setLangState('cy')
  }, [])

  function setLang(l: 'en' | 'cy') {
    setLangState(l)
    localStorage.setItem(LANG_STORAGE_KEY, l)
  }

  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEV_EMAIL || '')
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEV_PASSWORD || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    let supabase
    try {
      supabase = createClient()
    } catch (clientError) {
      setError(
        clientError instanceof Error
          ? clientError.message
          : 'Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      )
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('admin_users')
        .update({
          last_login_at: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', user.id)
    }

    router.replace(`/overview?lang=${lang}`)
    router.refresh()
  }

  async function handleForgotPassword() {
    const trimmed = email.trim()
    if (!trimmed) {
      setResetError(strings[lang].enterEmailFirst)
      return
    }
    setResetLoading(true)
    setResetError('')
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setResetLoading(false)
    if (resetError) {
      setResetError(resetError.message)
      return
    }
    setResetSent(true)
  }

  const t = strings[lang]

  return (
    <main className="min-h-screen bg-[#ffffff] px-6 py-8 text-[#1f1f1f]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col bg-[#ffffff]">
        <header className="flex justify-end px-8 pt-8 sm:px-10 sm:pt-10">
          <div className="flex flex-col items-end gap-3">
            <img
              src="/logos.png"
              alt="Welsh Government and Merthyr Tydfil County Borough Council Logos"
              className="h-24 w-auto object-contain sm:h-48"
            />
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <img src={lang === 'cy' ? '/mainLogo-cy.png' : '/mainLogo.svg'} alt="Her Stories Content Manager" className="mx-auto h-46 w-auto sm:h-24" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="mb-5 text-3xl font-semibold tracking-tight">{t.signIn}</h2>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                suppressHydrationWarning
                className="h-14 w-full rounded-xl border border-[#b7b7b1] bg-white px-5 text-lg shadow-sm outline-none transition focus:border-[#147a4c] focus:ring-2 focus:ring-[#147a4c]/20"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                autoComplete="current-password"
                suppressHydrationWarning
                className="h-14 w-full rounded-xl border border-[#b7b7b1] bg-white px-5 text-lg shadow-sm outline-none transition focus:border-[#147a4c] focus:ring-2 focus:ring-[#147a4c]/20"
                required
              />

              {searchParams.get('error') === 'invalid_link' && !error ? (
                <p className="text-sm text-red-700">{t.invalidLink}</p>
              ) : error ? (
                <p className="text-sm text-red-700">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex h-16 w-full items-center justify-between rounded-xl bg-[#1f1f1f] px-6 text-left text-2xl font-medium uppercase tracking-wide text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{loading ? t.signingIn : t.signIn}</span>
                <ArrowRight className="h-8 w-8" strokeWidth={1.75} />
              </button>

              <div className="pt-2 text-center">
                {resetSent ? (
                  <p className="text-sm text-emerald-700">{t.resetSent}</p>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={resetLoading}
                      onClick={handleForgotPassword}
                      className="text-sm text-neutral-500 underline underline-offset-2 transition hover:text-neutral-800 disabled:opacity-50"
                    >
                      {resetLoading ? t.sending : t.forgotPassword}
                    </button>
                    {resetError ? <p className="mt-2 text-sm text-red-700">{resetError}</p> : null}
                  </>
                )}
              </div>
            </form>
          </div>
        </section>
        <footer className="flex justify-end px-8 pb-8 sm:px-10 sm:pb-10">
          <LanguageToggle lang={lang} setLang={setLang} />
        </footer>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}