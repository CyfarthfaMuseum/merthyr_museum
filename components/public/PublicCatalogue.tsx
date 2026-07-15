"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ImageIcon, MapPin, Search } from "lucide-react"
import type { PublicContentType, PublicLanguage } from "@/lib/public/types"
import type { PublicOverviewItem } from "@/lib/public/overview"
import { t } from "@/lib/public/i18n"
import PublicNavMenu from "./PublicNavMenu"
import { CONTENT_TYPE_ICON } from "./PublicNavPanel"

const ROUTE: Record<PublicContentType, string> = {
  painting:  "/paintings",
  book:      "/books",
  story:     "/stories",
  artefact:  "/artefacts",
  biography: "/biographies",
}

const TITLE_KEY: Record<PublicContentType, "filter.painting" | "filter.book" | "filter.story" | "filter.artefact" | "filter.biography"> = {
  painting:  "filter.painting",
  book:      "filter.book",
  story:     "filter.story",
  artefact:  "filter.artefact",
  biography: "filter.biography",
}

function matchesQuery(item: PublicOverviewItem, query: string): boolean {
  const q = query.toLowerCase()
  return (
    item.title.toLowerCase().includes(q) ||
    (item.creatorLabel?.toLowerCase().includes(q) ?? false) ||
    (item.category?.toLowerCase().includes(q) ?? false) ||
    (item.locationTitle?.toLowerCase().includes(q) ?? false)
  )
}

function groupByCategory(
  items: PublicOverviewItem[],
  otherLabel: string
): { label: string; items: PublicOverviewItem[] }[] {
  const groups = new Map<string, PublicOverviewItem[]>()
  for (const item of items) {
    const label = item.category ?? otherLabel
    groups.set(label, [...(groups.get(label) ?? []), item])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => {
      if (a === otherLabel) return 1
      if (b === otherLabel) return -1
      return a.localeCompare(b)
    })
    .map(([label, groupItems]) => ({ label, items: groupItems }))
}

function CatalogueCard({ item, lang }: { item: PublicOverviewItem; lang: PublicLanguage }) {
  const unavailable = t("sidebar.unavailable", lang)

  return (
    <Link href={item.href} className="group block w-40 shrink-0">
      <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100">
        {item.primaryImage ? (
          <img
            src={item.primaryImage.url}
            alt={item.primaryImage.altText ?? ""}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-2 text-[13px] font-semibold italic leading-[1.3] text-neutral-950 font-serif">
          {item.title}
        </p>

        {item.creatorLabel ? (
          <p className="line-clamp-1 text-[12px] leading-[1.4] text-neutral-600">{item.creatorLabel}</p>
        ) : (
          <p className="text-[12px] text-neutral-400">{unavailable}</p>
        )}

        {item.locationTitle ? (
          <span className="flex items-center gap-1 text-[11px] text-[#046335]">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
            <span className="truncate">{item.locationTitle}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
            <span>{unavailable}</span>
          </span>
        )}
      </div>
    </Link>
  )
}

export default function PublicCatalogue({
  type,
  lang,
  items,
}: {
  type: PublicContentType
  lang: PublicLanguage
  items: PublicOverviewItem[]
}) {
  const icon = CONTENT_TYPE_ICON[type]
  const title = t(TITLE_KEY[type], lang)
  const [query, setQuery] = useState("")
  const trimmed = query.trim()

  const visibleItems = useMemo(
    () => (trimmed ? items.filter((item) => matchesQuery(item, trimmed)) : items),
    [items, trimmed]
  )

  const groups = useMemo(
    () => groupByCategory(visibleItems, title),
    [visibleItems, title]
  )

  return (
    <>
      <PublicNavMenu lang={lang} activePath={ROUTE[type]} />

      <main className="min-h-screen bg-white text-neutral-950">
        <header className="flex flex-col gap-4 pb-4 pl-14 pr-4 pt-5 sm:flex-row sm:items-center sm:justify-between md:pl-32 md:pr-10 lg:pl-40 lg:pt-10">
          <div className="flex items-center gap-2">
            <img src={icon} alt="" aria-hidden="true" className="h-7 w-7 shrink-0" />
            <h1 className="font-serif text-[26px] leading-none text-neutral-950">{title}</h1>
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded-full border border-neutral-300 px-3 py-1.5 focus-within:border-neutral-500 sm:w-[300px]">
            <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("home.search", lang)}
              aria-label={t("home.search", lang)}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-neutral-800 placeholder:text-neutral-400 outline-none"
            />
          </div>
        </header>

        <section className="px-4 pb-16 pt-2 md:px-10 lg:pl-40 lg:pr-16 lg:pb-24">
          {groups.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center text-center">
              <p className="text-[15px] text-neutral-500">
                {lang === "cy" ? "Dim canlyniadau" : "No results"}
              </p>
            </div>
          ) : (
            <div className="space-y-8 py-4 lg:space-y-12 lg:py-8">
              {groups.map((group) => (
                <section key={group.label}>
                  <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-2">
                    <h2 className="text-[15px] font-semibold font-serif text-neutral-950">
                      {group.label}
                    </h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 lg:gap-5">
                    {group.items.map((item) => (
                      <CatalogueCard key={item.id} item={item} lang={lang} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
