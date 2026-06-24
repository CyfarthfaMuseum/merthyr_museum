import Link from "next/link"
import { Menu } from "lucide-react"
import { publicHref, type PublicLanguage } from "@/lib/public/types"

export default function PublicHome({ lang }: { lang: PublicLanguage }) {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <header className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-[30px] leading-none">Her Stories</h1>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center bg-neutral-200"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <aside className="flex flex-col justify-between border-t border-neutral-200 pt-6 lg:border-t-0 lg:pt-0">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Merthyr Museum
            </p>
            <h2 className="mt-4 font-serif text-[48px] leading-[1.05] text-neutral-950 sm:text-[64px]">
              Hanes-Hi
            </h2>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={publicHref("/map", lang)}
              className="inline-flex h-12 items-center bg-neutral-950 px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
            >
              Open Map
            </Link>
            <Link
              href={publicHref("/books", lang)}
              className="inline-flex h-12 items-center border border-neutral-200 px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950"
            >
              Books
            </Link>
            <Link
              href={publicHref("/paintings", lang)}
              className="inline-flex h-12 items-center border border-neutral-200 px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950"
            >
              Paintings
            </Link>
          </div>
        </aside>
      </section>
    </main>
  )
}
