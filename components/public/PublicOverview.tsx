"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, MapPin, Search } from "lucide-react"
import { publicHref, type PublicContentType, type PublicLanguage } from "@/lib/public/types"
import { t } from "@/lib/public/i18n"
import type { PublicOverviewItem } from "@/lib/public/overview"
import PublicOverviewMap from "./PublicOverviewMap"
import PublicNavMenu from "./PublicNavMenu"

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS: {
  key: PublicContentType
  labelKey: "nav.creativity" | "nav.activism" | "nav.industry" | "nav.everyday" | "nav.books"
  icon: string
  href: string
}[] = [
  { key: "painting",   labelKey: "nav.creativity", icon: "/Creations_Selected.svg",   href: "/paintings"   },
  { key: "artefact",   labelKey: "nav.industry",   icon: "/Discoveries_Selected.svg", href: "/artefacts"   },
  { key: "story",      labelKey: "nav.activism",   icon: "/Stories_Selected.svg",     href: "/stories"     },
  { key: "biography",  labelKey: "nav.everyday",   icon: "/Figures_Selected.svg",     href: "/biographies" },
  { key: "book",       labelKey: "nav.books",      icon: "/Books_Selected.svg",       href: "/books"       },
]

// ─── Filtering ────────────────────────────────────────────────────────────────

function matchesQuery(item: PublicOverviewItem, query: string): boolean {
  const q = query.toLowerCase()
  return (
    item.title.toLowerCase().includes(q) ||
    (item.creatorLabel?.toLowerCase().includes(q) ?? false) ||
    (item.summary?.toLowerCase().includes(q) ?? false) ||
    (item.locationTitle?.toLowerCase().includes(q) ?? false)
  )
}

// ─── Subtitle logic ───────────────────────────────────────────────────────────

function subtitleFor(item: PublicOverviewItem, lang: PublicLanguage): string | null {
  switch (item.contentType) {
    case "painting":
    case "book":
      return item.creatorLabel
    case "story":
    case "artefact":
      return item.summary
    case "biography":
      return item.creatorLabel
    default:
      return null
  }
}

// ─── Card ─────────────────────────────────────────────────────────────────────

const PLACEHOLDER_IMAGE: Record<PublicContentType, string> = {
  painting:   "/creations placeholder.svg",
  artefact:   "/discoveries placeholder.svg",
  biography:  "/figures placeholder.svg",
  story:      "/stories placeholder.svg",
  book:       "/Book Placeholder.svg",
}

function OverviewCard({ item, lang }: { item: PublicOverviewItem; lang: PublicLanguage }) {
  const subtitle = subtitleFor(item, lang)
  const unavailable = t("sidebar.unavailable", lang)
  const imageSrc = item.primaryImage?.url ?? PLACEHOLDER_IMAGE[item.contentType]

  return (
    <Link href={item.href} className="group block w-36 shrink-0">
      <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100">
        <img
          src={imageSrc}
          alt={item.primaryImage?.altText || item.title}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-2 text-[13px] font-semibold italic leading-[1.3] text-neutral-950 [font-family:var(--font-fraunces)]">
          {item.title}
        </p>

        {subtitle ? (
          <p className="line-clamp-2 text-[12px] leading-[1.4] text-neutral-600">{subtitle}</p>
        ) : (
          <p className="text-[12px] text-neutral-400">{unavailable}</p>
        )}

        {(item.contentType === "artefact" || item.contentType === "biography") && item.dateLabel ? (
          <p className="text-[12px] text-neutral-600">{item.dateLabel}</p>
        ) : null}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicOverview({
  lang,
  sections,
}: {
  lang: PublicLanguage
  sections: Record<string, PublicOverviewItem[]>
}) {
  const [query, setQuery] = useState("")
  const trimmed = query.trim()

  return (
    <>
      <PublicNavMenu lang={lang} langSwitchHref="/home" />

      <main className="min-h-screen bg-white text-neutral-950">
        <header className="flex h-[60px] items-center gap-3 pl-14 pr-4 md:pl-32 md:pr-10">
          <Link href={publicHref("/home", lang)} className="shrink-0">
            <img
              src={lang === "cy" ? "/menuLogo-cy.png" : "/menuLogo.png"}
              alt={lang === "cy" ? "Hanes Hi" : "Her Stories"}
              className="h-7 w-auto object-contain"
            />
          </Link>

          {/* Search */}
          <div className="ml-auto flex min-w-0 w-full max-w-xs items-center gap-2 rounded-full border border-neutral-300 px-3 py-1.5 focus-within:border-neutral-500">
            <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("home.search", lang)}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-neutral-800 placeholder:text-neutral-400 outline-none"
            />
          </div>
        </header>

        <div className="px-4 pb-16 pt-4 md:pl-32 md:pr-10">
          <div className="relative mb-5 h-[160px] overflow-hidden rounded-sm">
            <PublicOverviewMap />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Link
                href={publicHref("/map", lang)}
                className="pointer-events-auto flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-[13px] font-semibold text-white shadow-md"
              >
                <MapPin className="h-4 w-4" strokeWidth={2} />
                {t("home.browseMerthyr", lang)}
              </Link>
            </div>
          </div>

          <p className="mb-5 text-[13px] leading-relaxed text-neutral-600">
            {lang === "cy"
              ? "Croeso i Hanes Hi — straeon menywod a merched Merthyr Tudful drwy'r oesoedd."
              : "Welcome to Her Stories — discover the stories of women and girls from Merthyr Tydfil through the ages."}
          </p>

          <hr className="mb-6 border-neutral-200" />

          {/* Content carousels */}
          <div className="space-y-8">
            {SECTIONS.map(({ key, labelKey, icon, href }) => {
              const allItems = sections[key] ?? []
              const items = trimmed ? allItems.filter((item) => matchesQuery(item, trimmed)) : allItems
              if (!items.length) return null
              return (
                <section key={key}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <img src={icon} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
                      <span className="text-[15px] font-semibold [font-family:var(--font-fraunces)]">{t(labelKey, lang)}</span>
                    </span>
                    <Link
                      href={publicHref(href, lang)}
                      aria-label={`${t("home.seeAll", lang)} ${t(labelKey, lang)}`}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      <ChevronRight className="h-5 w-5" strokeWidth={2} />
                    </Link>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {items.map((item) => (
                      <OverviewCard key={item.id} item={item} lang={lang} />
                    ))}
                  </div>
                </section>
              )
            })}

            {trimmed && SECTIONS.every(({ key }) => {
              const items = sections[key] ?? []
              return items.filter((item) => matchesQuery(item, trimmed)).length === 0
            }) ? (
              <p className="pt-4 text-center text-[14px] text-neutral-400">
                {lang === "cy" ? "Dim canlyniadau" : "No results"}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </>
  )
}
