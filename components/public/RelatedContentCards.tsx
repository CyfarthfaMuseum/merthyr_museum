"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  type PublicContentType,
  type PublicLanguage,
  type PublicRelatedContent,
} from "@/lib/public/types"
import { t } from "@/lib/public/i18n"

const PLACEHOLDER_IMAGE: Record<PublicContentType, string> = {
  painting:   "/creations placeholder.svg",
  artefact:   "/discoveries placeholder.svg",
  biography:  "/figures placeholder.svg",
  story:      "/stories placeholder.svg",
  book:       "/Book Placeholder.svg",
}

export default function RelatedContentCards({
  items,
  lang,
  onSelect,
}: {
  items: PublicRelatedContent[]
  lang: PublicLanguage
  // Optional hook for map contexts: return true if the item was handled (e.g.
  // selected on the map) to skip the normal detail-page navigation.
  onSelect?: (item: PublicRelatedContent) => boolean
}) {
  const router = useRouter()

  if (items.length === 0) return null

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {items.map((item) => {
        const cardBody = (
          <>
            <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100">
              <img
                src={item.primaryImage?.url ?? PLACEHOLDER_IMAGE[item.contentType]}
                alt={item.primaryImage?.altText || item.title}
                className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="line-clamp-2 text-[13px] font-semibold italic leading-[1.3] text-neutral-950 [font-family:var(--font-fraunces)]">
                {item.title}
              </p>
              {item.creatorLabel ? (
                <p className="line-clamp-1 text-[12px] text-neutral-600">{item.creatorLabel}</p>
              ) : null}
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {t(`type.${item.contentType}`, lang)}
              </p>
            </div>
          </>
        )

        if (onSelect) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const handled = onSelect(item)
                if (!handled) router.push(item.href)
              }}
              className="group block w-36 shrink-0 text-left sm:w-40"
            >
              {cardBody}
            </button>
          )
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className="group block w-36 shrink-0 sm:w-40"
          >
            {cardBody}
          </Link>
        )
      })}
    </div>
  )
}
