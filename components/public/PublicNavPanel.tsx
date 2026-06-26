"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { publicHref, type PublicLanguage } from "@/lib/public/types"
import { t } from "@/lib/public/i18n"

const NAV_ITEMS = [
  { key: "nav.map",        href: "/map",         iconOff: "/icons/map-off.svg",        iconOn: "/icons/map-on.svg"        },
  { key: "nav.creativity", href: "/paintings",   iconOff: "/icons/creativity-off.svg", iconOn: "/icons/creativity-on.svg" },
  { key: "nav.activism",   href: "/stories",     iconOff: "/icons/activism-off.svg",   iconOn: "/icons/activism-on.svg"   },
  { key: "nav.industry",   href: "/artefacts",   iconOff: "/icons/industry-off.svg",   iconOn: "/icons/industry-on.svg"   },
  { key: "nav.everyday",   href: "/biographies", iconOff: "/Figures_NotSelected.svg",  iconOn: "/Figures_Selected.svg"    },
  { key: "nav.books",      href: "/books",       iconOff: "/icons/books-off.svg",      iconOn: "/icons/books-on.svg"      },
] as const

type Props = {
  lang: PublicLanguage
  activePath?: string
  onLangChange: (lang: PublicLanguage) => void
}

export default function PublicNavPanel({ lang, activePath, onLangChange }: Props) {
  return (
    <div className="flex h-full w-full flex-col border-r border-neutral-200 bg-white shadow-2xl">
      <div className="flex flex-col items-center px-6 pb-10 pt-8">
        <Link href={publicHref("/", lang)} aria-label="Her Stories">
          <img
            src={lang === "cy" ? "/mainLogo-cy.png" : "/mainLogo.svg"}
            alt="Her Stories"
            className="h-16 w-auto object-contain"
          />
        </Link>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.href
          const label = t(item.key, lang)
          return (
            <Link
              key={item.key}
              href={publicHref(item.href, lang)}
              className={`ml-4 flex h-12 items-center justify-between px-4 font-serif text-[18px] font-semibold transition ${
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
                  className="h-7 w-7 object-contain"
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
