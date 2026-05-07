'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEV_EMAIL || '')
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEV_PASSWORD || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    searchParams.get('error') === 'invalid_link'
      ? 'This password reset link is invalid or has expired. Please request a new one.'
      : ''
  )
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

    router.replace('/overview')
    router.refresh()
  }

  async function handleForgotPassword() {
    const trimmed = email.trim()
    if (!trimmed) {
      setResetError('Please enter your email address above first.')
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
            <div className="mb-14 text-center">
              <img src="/mainLogo.svg" alt="Her Stories Content Manager" className="mx-auto h-46 w-auto sm:h-24" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="mb-5 text-3xl font-semibold tracking-tight">Sign In</h2>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                suppressHydrationWarning
                className="h-14 w-full rounded-xl border border-[#b7b7b1] bg-white px-5 text-lg shadow-sm outline-none transition focus:border-[#147a4c] focus:ring-2 focus:ring-[#147a4c]/20"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                suppressHydrationWarning
                className="h-14 w-full rounded-xl border border-[#b7b7b1] bg-white px-5 text-lg shadow-sm outline-none transition focus:border-[#147a4c] focus:ring-2 focus:ring-[#147a4c]/20"
                required
              />

              {error ? <p className="text-sm text-red-700">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex h-16 w-full items-center justify-between rounded-xl bg-[#1f1f1f] px-6 text-left text-2xl font-medium uppercase tracking-wide text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="h-8 w-8" strokeWidth={1.75} />
              </button>

              <div className="pt-2 text-center">
                {resetSent ? (
                  <p className="text-sm text-emerald-700">Password reset email sent — check your inbox.</p>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={resetLoading}
                      onClick={handleForgotPassword}
                      className="text-sm text-neutral-500 underline underline-offset-2 transition hover:text-neutral-800 disabled:opacity-50"
                    >
                      {resetLoading ? 'Sending...' : 'Forgotten Password?'}
                    </button>
                    {resetError ? <p className="mt-2 text-sm text-red-700">{resetError}</p> : null}
                  </>
                )}
              </div>
            </form>
          </div>
        </section>
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