'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const LANG_STORAGE_KEY = 'herstories_ui_lang'

const strings = {
  en: {
    title: 'Reset Password',
    subtitle: 'Choose a new password for your account.',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    setPassword: 'Set Password',
    saving: 'Saving...',
    verifying: 'Verifying link\u2026',
    invalidLink: 'This link is invalid or has expired. Please request a new one.',
    passwordTooShort: 'Password must be at least 8 characters.',
    passwordMismatch: 'Passwords do not match.',
  },
  cy: {
    title: 'Ailosod Cyfrinair',
    subtitle: 'Dewiswch gyfrinair newydd ar gyfer eich cyfrif.',
    newPassword: 'Cyfrinair Newydd',
    confirmPassword: 'Cadarnhau Cyfrinair',
    setPassword: 'Gosod Cyfrinair',
    saving: 'Yn cadw...',
    verifying: 'Gwirio\u2019r ddolen\u2026',
    invalidLink: "Mae'r ddolen hon yn annilys neu wedi dod i ben. Gofynnwch am un newydd.",
    passwordTooShort: "Rhaid i'r cyfrinair fod o leiaf 8 nod.",
    passwordMismatch: "Nid yw'r cyfrineiriau'n cyfateb.",
  },
} as const

function LanguageToggle({ lang, setLang }: { lang: 'en' | 'cy'; setLang: (l: 'en' | 'cy') => void }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-[#b7b7b1] text-sm font-semibold">
      <button
        type="button"
        onClick={() => setLang('cy')}
        className={`px-4 py-2 transition ${lang === 'cy' ? 'bg-[#147a4c] text-white' : 'bg-white text-[#1f1f1f] hover:bg-neutral-50'}`}
      >
        CY
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`border-l border-[#b7b7b1] px-4 py-2 transition ${lang === 'en' ? 'bg-[#147a4c] text-white' : 'bg-white text-[#1f1f1f] hover:bg-neutral-50'}`}
      >
        EN
      </button>
    </div>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lang, setLangState] = useState<'en' | 'cy'>('en')
  const [ready, setReady] = useState(false)
  const [sessionInvalid, setSessionInvalid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  // Supabase puts the recovery token in the URL hash; calling getSession() exchanges it.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        setSessionInvalid(true)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(strings[lang].passwordTooShort)
      return
    }

    if (password !== confirm) {
      setError(strings[lang].passwordMismatch)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.replace(`/overview?lang=${lang}`)
    router.refresh()
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

            {!ready ? (
              <p className="text-center text-sm text-red-700">{sessionInvalid ? t.invalidLink : t.verifying}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="mb-2 text-3xl font-semibold tracking-tight">{t.title}</h2>
                <p className="text-sm text-neutral-500">{t.subtitle}</p>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.newPassword}
                  autoComplete="new-password"
                  className="h-14 w-full rounded-xl border border-[#b7b7b1] bg-white px-5 text-lg shadow-sm outline-none transition focus:border-[#147a4c] focus:ring-2 focus:ring-[#147a4c]/20"
                  required
                />

                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t.confirmPassword}
                  autoComplete="new-password"
                  className="h-14 w-full rounded-xl border border-[#b7b7b1] bg-white px-5 text-lg shadow-sm outline-none transition focus:border-[#147a4c] focus:ring-2 focus:ring-[#147a4c]/20"
                  required
                />

                {error ? <p className="text-sm text-red-700">{error}</p> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 flex h-16 w-full items-center justify-between rounded-xl bg-[#1f1f1f] px-6 text-left text-2xl font-medium uppercase tracking-wide text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{loading ? t.saving : t.setPassword}</span>
                  <ArrowRight className="h-8 w-8" strokeWidth={1.75} />
                </button>
              </form>
            )}
          </div>
        </section>
        <footer className="flex justify-end px-8 pb-8 sm:px-10 sm:pb-10">
          <LanguageToggle lang={lang} setLang={setLang} />
        </footer>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
