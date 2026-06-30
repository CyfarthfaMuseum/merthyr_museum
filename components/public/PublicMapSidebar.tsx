"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import {
  publicHref,
  type PublicContentItemViewModel,
  type PublicLanguage,
  type PublicMapContentSummary,
  type PublicMapLocation,
  type PublicMedia,
} from "@/lib/public/types"
import { t } from "@/lib/public/i18n"

type SidebarTab = "about" | "audio" | "details"

type DetailField = { label: string; value: string | number | null | undefined }

function detailFields(detail: PublicContentItemViewModel, lang: PublicLanguage): DetailField[] {
  if (detail.book) {
    return [
      { label: t("field.author", lang),          value: detail.book.author },
      { label: t("field.publisher", lang),        value: detail.book.publisher },
      { label: t("field.isbn", lang),             value: detail.book.isbn },
      { label: t("field.publicationYear", lang),  value: detail.book.publicationYear },
    ]
  }
  if (detail.painting) {
    return [
      { label: t("field.artist", lang),      value: detail.painting.artistName },
      { label: t("field.year", lang),        value: detail.painting.yearCreated },
      { label: t("field.medium", lang),      value: detail.painting.medium },
      { label: t("field.dimensions", lang),  value: detail.painting.dimensions },
      { label: t("field.collection", lang),  value: detail.painting.currentCollection },
      { label: t("field.imageCredit", lang), value: detail.painting.imageCredit },
    ]
  }
  if (detail.artefact) {
    return [
      { label: t("field.maker", lang),      value: detail.artefact.maker },
      { label: t("field.date", lang),       value: detail.artefact.dateCreatedLabel ?? detail.dateLabel },
      { label: t("field.material", lang),   value: detail.artefact.material },
      { label: t("field.dimensions", lang), value: detail.artefact.dimensions },
      { label: t("field.collection", lang), value: detail.artefact.collectionHolder },
      { label: t("field.reference", lang),  value: detail.artefact.catalogueReference },
    ]
  }
  if (detail.biography) {
    const lifeDates = [detail.biography.birthYear, detail.biography.deathYear]
      .filter(Boolean)
      .join("–")
    return [
      { label: t("field.dates", lang),      value: lifeDates || null },
      { label: t("field.born", lang),       value: detail.biography.birthPlace },
      { label: t("field.occupation", lang), value: detail.biography.occupation },
    ]
  }
  if (detail.story) {
    return [
      { label: t("field.person", lang), value: detail.story.relatedPersonName },
      { label: t("field.date", lang),   value: detail.dateLabel },
    ]
  }
  return [{ label: t("field.date", lang), value: detail.dateLabel }]
}

function aboutText(detail: PublicContentItemViewModel): string | null {
  // For books: admin "exposition" (detailed content) is saved to content_item_translations.body,
  // while book_translations.excerpt holds the summary (already shown in the header).
  // All other types also use body as their detailed content fallback.
  return (
    detail.painting?.detailNotes ??
    detail.artefact?.notes ??
    detail.story?.eventDetails ??
    detail.biography?.biographyText ??
    detail.body ??
    null
  )
}

function creatorLabel(detail: PublicContentItemViewModel): string | null {
  return (
    detail.painting?.artistName ??
    detail.book?.author ??
    detail.artefact?.maker ??
    detail.story?.relatedPersonName ??
    detail.biography?.personName ??
    null
  )
}

type Props = {
  content: PublicMapContentSummary
  location: PublicMapLocation
  lang: PublicLanguage
  isOpen: boolean
  onClose: () => void
}

export default function PublicMapSidebar({ content, location, lang, isOpen, onClose }: Props) {
  const [detail, setDetail] = useState<PublicContentItemViewModel | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SidebarTab>("about")

  // Mobile bottom-sheet drag state. On desktop (md+) the panel is a fixed-width
  // right-hand sidebar instead, so none of this applies.
  const [isDesktop, setIsDesktop] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartYRef = useRef<number | null>(null)
  const sheetHeightPxRef = useRef(0)
  const rawDeltaRef = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    setDetail(null)
    setSelectedImageId(null)
    setActiveTab("about")
    if (!content.slug) return
    fetch(`/api/public/content/${content.slug}?lang=${lang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setDetail(data as PublicContentItemViewModel) })
      .catch(() => {})
  }, [content.id, content.slug, lang])

  useEffect(() => {
    setExpanded(false)
    setDragY(0)
  }, [content.id, isOpen])

  function handleDragStart(e: React.PointerEvent<HTMLDivElement>) {
    dragStartYRef.current = e.clientY
    sheetHeightPxRef.current = e.currentTarget.parentElement?.getBoundingClientRect().height ?? 0
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleDragMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartYRef.current === null) return
    const delta = e.clientY - dragStartYRef.current
    rawDeltaRef.current = delta
    setDragY(Math.max(0, delta))
  }

  function handleDragEnd() {
    if (dragStartYRef.current === null) return
    const threshold = 60
    const delta = rawDeltaRef.current
    setIsDragging(false)
    setDragY(0)
    dragStartYRef.current = null
    rawDeltaRef.current = 0

    if (delta < -threshold || delta < -(sheetHeightPxRef.current * 0.15)) {
      setExpanded(true)
    } else if (delta > threshold) {
      if (expanded) setExpanded(false)
      else onClose()
    }
  }

  const images: PublicMedia[] = detail?.galleryMedia ?? content.galleryMedia
  const primaryImage = detail?.primaryImage ?? content.primaryImage
  const displayImage =
    (selectedImageId ? images.find((m) => m.id === selectedImageId) : null) ??
    primaryImage ??
    images[0] ??
    null

  const creator = detail ? creatorLabel(detail) : null
  const body = detail ? aboutText(detail) : null
  const fields = detail ? detailFields(detail, lang) : []
  const contentHref = publicHref(content.href, lang)

  const tabs: { id: SidebarTab; label: string }[] = [
    { id: "about",   label: t("sidebar.about",   lang) },
    { id: "audio",   label: t("sidebar.audio",   lang) },
    { id: "details", label: t("sidebar.details", lang) },
  ]

  return (
    <aside
      style={
        isDesktop
          ? undefined
          : {
              height: expanded ? "100dvh" : "75dvh",
              transform: isOpen ? `translateY(${dragY}px)` : "translateY(100%)",
              transition: isDragging
                ? "none"
                : "transform 300ms ease-out, height 300ms ease-out",
            }
      }
      className={`fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-2xl border-t border-neutral-200 bg-white shadow-2xl md:absolute md:inset-x-auto md:inset-y-0 md:right-0 md:bottom-auto md:h-full md:w-[min(90vw,390px)] md:rounded-none md:border-l md:border-t-0 md:transition-transform md:duration-300 md:ease-out ${
        isOpen ? "md:translate-x-0" : "md:translate-x-full"
      }`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {/* Drag handle – mobile bottom-sheet only */}
      <div
        className="flex shrink-0 touch-none items-center justify-center py-2 active:cursor-grabbing md:hidden"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <span className="h-1.5 w-10 rounded-full bg-neutral-300" />
      </div>

      {/* External arrows – desktop only, visible when open */}
      {isOpen ? (
        <div className="absolute left-0 top-8 z-10 -translate-x-full hidden md:flex flex-col gap-1 pr-2">
          <Link
            href={contentHref}
            className="flex h-11 w-11 items-center justify-center bg-white shadow-md text-neutral-900 transition hover:bg-neutral-50"
            aria-label={t("sidebar.viewFullDetails", lang)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center bg-white shadow-md text-neutral-900 transition hover:bg-neutral-50"
            aria-label={t("sidebar.closePanel", lang)}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      ) : null}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">

        {/* Primary image */}
        {displayImage ? (
          <div className="w-full bg-neutral-100">
            <img
              key={displayImage.id}
              src={displayImage.url}
              alt={displayImage.altText ?? ""}
              className="w-full max-h-[45vh] object-contain"
            />
          </div>
        ) : null}

        {/* Thumbnail gallery */}
        {images.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto border-b border-neutral-100 bg-neutral-50 px-3 py-2">
            {images.map((media) => (
              <button
                key={media.id}
                type="button"
                onClick={() => setSelectedImageId(media.id)}
                className={`h-14 w-14 shrink-0 overflow-hidden border-2 transition ${
                  media.id === displayImage?.id
                    ? "border-neutral-950"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={media.caption ?? media.fileName ?? "Select image"}
              >
                <img src={media.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        {/* Content header */}
        <div className="px-5 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00744b]">
            {t(`type.${content.contentType}`, lang)}
          </p>
          <h2 className="mt-1 font-serif text-[28px] leading-tight text-neutral-950">
            {content.title}
          </h2>
          {detail?.dateLabel ? (
            <p className="mt-1 text-[14px] text-neutral-500">{detail.dateLabel}</p>
          ) : null}
          {creator ? (
            <p className="mt-1 text-[15px] font-medium text-neutral-700">{creator}</p>
          ) : null}
          {detail?.summary ? (
            <p className="mt-4 text-[15px] leading-7 text-neutral-700">{detail.summary}</p>
          ) : null}
        </div>

        {/* Tabs */}
        {detail ? (
          <div className="mt-5">
            <div className="flex border-b border-neutral-200 px-5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`mr-6 shrink-0 border-b-2 pb-2 text-[13px] font-semibold uppercase tracking-[0.12em] transition ${
                    activeTab === tab.id
                      ? "border-neutral-950 text-neutral-950"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-5 py-4">
              {/* About tab */}
              {activeTab === "about" ? (
                body ? (
                  <div className="space-y-3 text-[15px] leading-7 text-neutral-700">
                    {body.split(/\n{2,}/).map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] text-neutral-400">{t("sidebar.noContent", lang)}</p>
                )
              ) : null}

              {/* Audio tab */}
              {activeTab === "audio" ? (
                detail.audioMedia ? (
                  <audio controls src={detail.audioMedia.url} className="w-full" />
                ) : (
                  <p className="text-[14px] text-neutral-400">{t("sidebar.noAudio", lang)}</p>
                )
              ) : null}

              {/* Details tab */}
              {activeTab === "details" ? (
                <dl className="space-y-3">
                  {fields.map(({ label, value }) => (
                    <div key={label} className="border-t border-neutral-100 pt-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {label}
                      </dt>
                      <dd
                        className={`mt-0.5 text-[14px] leading-5 ${
                          value ? "text-neutral-800" : "italic text-neutral-400"
                        }`}
                      >
                        {value ?? t("sidebar.unavailable", lang)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="px-5 py-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
          </div>
        )}

        {/* Location */}
        {location.address ? (
          <div className="border-t border-neutral-100 px-5 py-4">
            <div className="flex items-start gap-2 text-[14px] text-neutral-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300" />
              <span>{location.address}</span>
            </div>
          </div>
        ) : null}

        {/* Related content */}
        {detail && detail.relatedContent.length > 0 ? (
          <div className="border-t border-neutral-200 px-5 pt-5 pb-24">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t("sidebar.related", lang)}
            </p>
            <div className="space-y-2">
              {detail.relatedContent.map((item) => (
                <Link
                  key={item.id}
                  href={publicHref(item.href, lang)}
                  className="flex items-center gap-3 border border-neutral-100 p-3 transition hover:border-neutral-950"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#00744b]">
                      {t(`type.${item.contentType}`, lang)}
                    </p>
                    <p className="mt-0.5 truncate text-[14px] font-medium text-neutral-950">
                      {item.title}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="pb-24" />
        )}
      </div>

      {/* Sticky CTA */}
      <div className="border-t border-neutral-200 bg-white px-5 py-3">
        <Link
          href={contentHref}
          className="flex h-11 w-full items-center justify-center bg-neutral-950 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
        >
          {t("sidebar.viewFullDetails", lang)}
        </Link>
      </div>
    </aside>
  )
}
