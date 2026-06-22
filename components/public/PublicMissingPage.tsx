"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Home, Map } from "lucide-react"
import { isPublicLanguage, publicHref, type PublicLanguage } from "@/lib/public/types"

const copy = {
  books: {
    title: "No such book exists",
    body: "This book may have moved, changed address, or is not currently public.",
    primaryLabel: "Back to Books",
    primaryHref: "/books",
  },
  paintings: {
    title: "No such painting exists",
    body: "This painting may have moved, changed address, or is not currently public.",
    primaryLabel: "Back to Paintings",
    primaryHref: "/paintings",
  },
  default: {
    title: "No such page exists",
    body: "This page may have moved, changed address, or is not currently public.",
    primaryLabel: "Back to Her Stories",
    primaryHref: "/",
  },
} as const

export default function PublicMissingPage({
  section = "default",
}: {
  section?: keyof typeof copy
}) {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang")
  const lang: PublicLanguage = langParam && isPublicLanguage(langParam) ? langParam : "en"
  const t = copy[section]

  return (
    <main className="flex min-h-screen items-center bg-white px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-[760px] border-t border-neutral-200 pt-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Page not found
        </p>
        <h1 className="mt-4 font-serif text-[48px] leading-[1.04] text-neutral-950 sm:text-[68px]">
          {t.title}
        </h1>
        <p className="mt-6 max-w-[560px] text-[18px] leading-8 text-neutral-700">
          {t.body}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href={publicHref(t.primaryHref, lang)}
            className="inline-flex h-12 items-center gap-2 bg-neutral-950 px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.primaryLabel}
          </Link>
          <Link
            href={publicHref("/", lang)}
            className="inline-flex h-12 items-center gap-2 border border-neutral-200 px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href={publicHref("/map", lang)}
            className="inline-flex h-12 items-center gap-2 border border-neutral-200 px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950"
          >
            <Map className="h-4 w-4" />
            Map
          </Link>
        </div>
      </section>
    </main>
  )
}
