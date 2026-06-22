import Link from "next/link"
import { BookOpen, ImageIcon, Menu, Search } from "lucide-react"
import {
  publicHref,
  type PublicCatalogueItem,
  type PublicLanguage,
} from "@/lib/public/types"

const copy = {
  book: {
    eyebrow: "Catalogue",
    title: "Books",
    description: "Browse the public book catalogue and open individual entries.",
    empty: "No public books are available yet.",
  },
  painting: {
    eyebrow: "Catalogue",
    title: "Paintings",
    description: "Browse the public painting catalogue and open individual entries.",
    empty: "No public paintings are available yet.",
  },
} as const

export default function PublicCatalogue({
  type,
  lang,
  items,
}: {
  type: "book" | "painting"
  lang: PublicLanguage
  items: PublicCatalogueItem[]
}) {
  const t = copy[type]
  const alternateHref = type === "book" ? publicHref("/paintings", lang) : publicHref("/books", lang)
  const alternateLabel = type === "book" ? "Paintings" : "Books"

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={publicHref("/", lang)} className="font-serif text-[30px] leading-none">
            Her Stories
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center bg-neutral-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 border-b border-neutral-200 pb-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.28fr)]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-[54px] leading-[1.02] text-neutral-950 sm:text-[72px]">
              {t.title}
            </h1>
            <p className="mt-5 max-w-[680px] text-[18px] leading-8 text-neutral-700">
              {t.description}
            </p>
          </div>
          <div className="flex items-end gap-3 lg:justify-end">
            <Link
              href={publicHref("/map", lang)}
              className="inline-flex h-11 items-center border border-neutral-200 px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950"
            >
              Map
            </Link>
            <Link
              href={alternateHref}
              className="inline-flex h-11 items-center border border-neutral-200 px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950"
            >
              {alternateLabel}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-neutral-200 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
            {type === "book" ? <BookOpen className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            {items.length} item{items.length === 1 ? "" : "s"}
          </div>
          <div className="flex h-11 min-w-0 items-center gap-3 border border-neutral-200 px-4 text-neutral-500 sm:w-[340px]">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate text-[13px] uppercase tracking-[0.12em]">
              Search placeholder
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center border-b border-neutral-200 text-center">
            <p className="text-[17px] text-neutral-600">{t.empty}</p>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-8 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <Link key={item.id} href={item.href} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                  {item.primaryImage ? (
                    <img
                      src={item.primaryImage.url}
                      alt={item.primaryImage.altText}
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                      {type === "book" ? (
                        <BookOpen className="h-10 w-10" />
                      ) : (
                        <ImageIcon className="h-10 w-10" />
                      )}
                    </div>
                  )}
                </div>
                <div className="border-t border-neutral-200 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    {[item.creatorLabel, item.dateLabel].filter(Boolean).join(" / ") || item.contentType}
                  </p>
                  <h2 className="mt-2 font-serif text-[27px] leading-[1.08] text-neutral-950">
                    {item.title}
                  </h2>
                  {item.summary ? (
                    <p className="mt-3 line-clamp-3 text-[14px] leading-6 text-neutral-600">
                      {item.summary}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
