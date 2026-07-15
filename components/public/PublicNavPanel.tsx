"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { publicHref, type PublicContentType, type PublicLanguage } from "@/lib/public/types"
import { t } from "@/lib/public/i18n"

const NAV_ITEMS = [
  { key: "nav.map",        href: "/map",         type: null,         iconOff: "/icons/map-off.svg",        iconOn: "/icons/map-on.svg"        },
  { key: "nav.creativity", href: "/paintings",   type: "painting",   iconOff: "/icons/creativity-off.svg", iconOn: "/icons/creativity-on.svg" },
  { key: "nav.activism",   href: "/stories",     type: "story",      iconOff: "/icons/activism-off.svg",   iconOn: "/icons/activism-on.svg"   },
  { key: "nav.industry",   href: "/artefacts",   type: "artefact",   iconOff: "/icons/industry-off.svg",   iconOn: "/icons/industry-on.svg"   },
  { key: "nav.everyday",   href: "/biographies", type: "biography",  iconOff: "/Figures_NotSelected.svg",  iconOn: "/Figures_Selected.svg"    },
  { key: "nav.books",      href: "/books",       type: "book",       iconOff: "/icons/books-off.svg",      iconOn: "/icons/books-on.svg"      },
] as const satisfies readonly {
  key: string
  href: string
  type: PublicContentType | null
  iconOff: string
  iconOn: string
}[]

/** Colour icon for each content type, reused by catalogue page headers. */
export const CONTENT_TYPE_ICON: Record<PublicContentType, string> = Object.fromEntries(
  NAV_ITEMS.filter((item) => item.type).map((item) => [item.type as PublicContentType, item.iconOff])
) as Record<PublicContentType, string>

type Props = {
  lang: PublicLanguage
  activePath?: string
  onLangChange: (lang: PublicLanguage) => void
}

export default function PublicNavPanel({ lang, activePath, onLangChange }: Props) {
  const [availability, setAvailability] = useState<Record<PublicContentType, boolean> | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/public/availability")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setAvailability(data as Record<PublicContentType, boolean>)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.type || !availability || availability[item.type] !== false
  )

  return (
    <div className="flex h-full w-full flex-col border-r border-neutral-200 bg-white shadow-2xl">
      <div className="flex flex-col items-center px-6 pb-10 pt-8">
        <Link href={publicHref("/", lang)} aria-label="Her Stories">
          <span
            role="img"
            aria-label={lang === "cy" ? "Hanes Hi" : "Her Stories"}
            className="block h-16 w-[200px] bg-[#006132]"
            style={{
              WebkitMaskImage: `url(${lang === "cy" ? "/hanesHi.svg" : "/HerStoriesEng.png"})`,
              maskImage: `url(${lang === "cy" ? "/hanesHi.svg" : "/HerStoriesEng.png"})`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </Link>
      </div>

      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const isActive = activePath === item.href
          const label = t(item.key as Parameters<typeof t>[0], lang)
          return (
            <Link
              key={item.key}
              href={publicHref(item.href, lang)}
              className={`ml-4 flex h-14 items-center justify-between px-4 font-serif text-[20px] font-semibold transition ${
                isActive
                  ? "rounded-l-full bg-neutral-950 text-white"
                  : "rounded-l-full text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              <span className="flex items-center gap-3">
                <img
                  src={isActive ? item.iconOn : item.iconOff}
                  alt=""
                  aria-hidden="true"
                  className="h-9 w-9 object-contain"
                />
                {label}
              </span>
              {isActive ? null : <ChevronRight className="h-5 w-5 text-neutral-300" />}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center px-6 pb-6">
        <div className="mb-8">
          <img
            src="/MCBC.jpg"
            alt="Welsh Government and Merthyr Tydfil County Borough Council"
            className="h-20 w-auto object-contain"
          />
        </div>
        <div className="flex w-full overflow-hidden rounded-full border border-neutral-300">
          {(["en", "cy"] as const).map((l, i) => (
            <button
              key={l}
              type="button"
              onClick={() => onLangChange(l)}
              className={`flex-1 py-2.5 text-[14px] font-medium transition ${
                i > 0 ? "border-l border-neutral-300" : ""
              } ${
                lang === l
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {l === "en" ? "English" : "Cymraeg"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
