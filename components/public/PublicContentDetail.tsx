"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Headphones,
  ImageIcon,
  Link2,
  MapPin,
  ZoomIn,
} from "lucide-react"
import {
  contentTypeToRouteSegment,
  publicHref,
  type PublicContentItemViewModel,
  type PublicLanguage,
  type PublicMedia,
} from "@/lib/public/types"
import { t } from "@/lib/public/i18n"
import PublicNavMenu from "./PublicNavMenu"
import RelatedContentCards from "./RelatedContentCards"
import MarkdownContent from "./MarkdownContent"
import ImageLightbox from "./ImageLightbox"

type DetailRow = {
  label: string
  value: string | number | null | undefined
}

type Tab = {
  id: string
  label: string
  content: React.ReactNode
}

function detailRowsFor(content: PublicContentItemViewModel, lang: PublicLanguage): DetailRow[] {
  if (content.painting) {
    return [
      { label: t("field.artist", lang), value: content.painting.artistName },
      { label: t("field.year", lang), value: content.painting.yearCreated },
      { label: t("field.medium", lang), value: content.painting.medium },
      { label: t("field.dimensions", lang), value: content.painting.dimensions },
      { label: t("field.collection", lang), value: content.painting.currentCollection },
      { label: t("field.imageCredit", lang), value: content.painting.imageCredit },
    ]
  }

  if (content.book) {
    return [
      { label: t("field.author", lang), value: content.book.author },
      { label: t("field.publisher", lang), value: content.book.publisher },
      { label: t("field.publicationYear", lang), value: content.book.publicationYear },
      { label: t("field.isbn", lang), value: content.book.isbn },
    ]
  }

  if (content.artefact) {
    return [
      { label: t("field.maker", lang), value: content.artefact.maker },
      { label: t("field.origin", lang), value: content.artefact.originPlace },
      { label: t("field.date", lang), value: content.artefact.dateCreatedLabel ?? content.dateLabel },
      { label: t("field.material", lang), value: content.artefact.material },
      { label: t("field.dimensions", lang), value: content.artefact.dimensions },
      { label: t("field.collection", lang), value: content.artefact.collectionHolder },
      { label: t("field.reference", lang), value: content.artefact.catalogueReference },
    ]
  }

  if (content.biography) {
    const lifeDates = [content.biography.birthYear, content.biography.deathYear]
      .filter(Boolean)
      .join("-")

    return [
      { label: t("field.name", lang), value: content.biography.personName },
      { label: t("field.dates", lang), value: lifeDates || null },
      { label: t("field.birthPlace", lang), value: content.biography.birthPlace },
      { label: t("field.occupation", lang), value: content.biography.occupation },
    ]
  }

  if (content.story) {
    return [
      { label: t("field.person", lang), value: content.story.relatedPersonName },
      { label: t("field.date", lang), value: content.dateLabel },
    ]
  }

  return [{ label: t("field.date", lang), value: content.dateLabel }]
}

function DetailsList({ rows, lang }: { rows: DetailRow[]; lang: PublicLanguage }) {
  const visibleRows = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== "")

  if (visibleRows.length === 0) {
    return <p className="text-[15px] leading-7 text-neutral-600">{t("state.detailsToFollow", lang)}</p>
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {visibleRows.map((row) => (
        <div key={row.label} className="pt-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {row.label}
          </dt>
          <dd className="mt-1 text-[15px] leading-6 text-neutral-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ProseText({ children, lang }: { children: string | null | undefined; lang: PublicLanguage }) {
  if (!children) {
    return <p className="text-[15px] leading-7 text-neutral-600">{t("state.contentToFollow", lang)}</p>
  }

  return <MarkdownContent>{children}</MarkdownContent>
}

function mediaLabel(media: PublicMedia, lang: PublicLanguage) {
  return media.caption || media.fileName || t("media.galleryImage", lang)
}

function getCreatorLabel(content: PublicContentItemViewModel) {
  return (
    content.painting?.artistName ||
    content.book?.author ||
    content.artefact?.maker ||
    content.story?.relatedPersonName ||
    content.biography?.occupation ||
    null
  )
}

function buildTabs(content: PublicContentItemViewModel, lang: PublicLanguage): Tab[] {
  const captionText =
    content.painting?.detailNotes ??
    content.book?.excerpt ??
    content.artefact?.notes ??
    content.story?.eventDetails ??
    content.biography?.biographyText ??
    content.body ??
    content.summary

  const tabs: Tab[] = [
    {
      id: "caption",
      label: t("tab.caption", lang),
      content: <ProseText lang={lang}>{captionText}</ProseText>,
    },
    {
      id: "details",
      label: t("sidebar.details", lang),
      content: <DetailsList rows={detailRowsFor(content, lang)} lang={lang} />,
    },
  ]

  if (content.painting) {
    tabs.push({
      id: "origin",
      label: t("field.origin", lang),
      content: (
        <DetailsList
          rows={[
            { label: t("field.created", lang), value: content.painting.yearCreated },
            { label: t("field.collection", lang), value: content.painting.currentCollection },
            { label: t("field.date", lang), value: content.dateLabel },
          ]}
          lang={lang}
        />
      ),
    })
  }

  if (content.locations.length > 0) {
    tabs.push({
      id: "location",
      label: t("tab.location", lang),
      content: (
        <div className="space-y-5">
          {content.locations.map((location) => (
            <div key={location.id} className="border-t border-neutral-200 pt-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-neutral-500" />
                <div>
                  <p className="text-[16px] font-medium text-neutral-950">{location.title}</p>
                  {location.address ? (
                    <p className="mt-1 text-[14px] text-neutral-600">{location.address}</p>
                  ) : null}
                  {location.description ? (
                    <p className="mt-3 text-[15px] leading-7 text-neutral-700">
                      {location.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    })
  }

  return tabs
}

export default function PublicContentDetail({
  content,
  hideNav = false,
}: {
  content: PublicContentItemViewModel
  hideNav?: boolean
}) {
  const lang = content.language
  const [selectedMediaId, setSelectedMediaId] = useState(content.primaryImage?.id ?? "")
  const [zoomed, setZoomed] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const tabs = useMemo(() => buildTabs(content, lang), [content, lang])
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "caption")
  const selectedMedia =
    content.galleryMedia.find((media) => media.id === selectedMediaId) ??
    content.primaryImage ??
    content.galleryMedia[0] ??
    null
  const creator = getCreatorLabel(content)
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]
  const router = useRouter()

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-neutral-950">
      {hideNav ? null : (
        <>
          <PublicNavMenu
            lang={lang}
            langSwitchHref={`/${contentTypeToRouteSegment(content.contentType.code)}/${content.slug}`}
          />
          <button
            type="button"
            onClick={() => router.back()}
            className="fixed left-12 top-0 z-30 flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-950/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-neutral-950/60 lg:left-16 lg:h-14 lg:w-14"
            aria-label={t("action.goBack", lang)}
          >
            <ArrowLeft className="h-5 w-5 lg:h-7 lg:w-7" />
          </button>
        </>
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-4 sm:px-6 lg:h-screen lg:overflow-hidden lg:px-8">
        {hideNav ? null : <div className="h-[52px] lg:h-[68px]" aria-hidden="true" />}

        <section className="grid min-w-0 flex-1 grid-cols-1 items-start gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)] lg:grid-rows-[1fr] lg:flex-none lg:gap-12 lg:py-10 lg:h-[calc(100vh-140px)]">
          <div className="flex min-h-[440px] min-w-0 flex-col">
            <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-neutral-100 lg:h-[72vh]">
              {selectedMedia ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.altText}
                  className={`h-full max-h-[72vh] w-full object-contain transition duration-200 ${
                    zoomed ? "scale-110 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                  }`}
                  onClick={() => setZoomed((current) => !current)}
                />
              ) : (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 text-neutral-500">
                  <ImageIcon className="h-10 w-10" />
                  <span className="text-[14px]">{t("state.imagePending", lang)}</span>
                </div>
              )}
              {selectedMedia ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center bg-white/90 text-neutral-900 shadow-sm transition hover:bg-white"
                  aria-label={t("action.viewFullScreen", lang)}
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              ) : null}
            </div>

            {content.galleryMedia.length > 1 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {content.galleryMedia.map((media) => (
                  <button
                    type="button"
                    key={media.id}
                    onClick={() => {
                      setSelectedMediaId(media.id)
                      setZoomed(false)
                    }}
                    className={`h-20 w-20 shrink-0 overflow-hidden border ${
                      media.id === selectedMedia?.id
                        ? "border-neutral-950"
                        : "border-neutral-200"
                    }`}
                    aria-label={mediaLabel(media, lang)}
                  >
                    <img
                      src={media.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <article className="flex min-w-0 flex-col lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2">
            <div className="border-b border-neutral-200 pb-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {t(`type.${content.contentType.code}`, lang)}
              </p>
              <h1 className="mt-4 font-serif text-[42px] leading-[1.05] text-neutral-950 sm:text-[56px] lg:text-[64px]">
                {content.title}
              </h1>
              {creator ? (
                <p className="mt-4 text-[18px] leading-7 text-neutral-700">{creator}</p>
              ) : null}
              {content.summary ? (
                <p className="mt-6 max-w-[620px] text-[18px] leading-8 text-neutral-800">
                  {content.summary}
                </p>
              ) : null}
              {content.tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {content.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="border border-neutral-200 px-3 py-1 text-[12px] uppercase tracking-[0.12em] text-neutral-600"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {content.audioMedia ? (
              <section className="border-b border-neutral-200 py-5">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
                  <Headphones className="h-4 w-4" />
                  {t("sidebar.audio", lang)}
                </div>
                <audio controls src={content.audioMedia.url} className="w-full" />
              </section>
            ) : null}

            <section className="py-6">
              <div className="flex gap-7 overflow-x-auto border-b border-neutral-950">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`shrink-0 border-b-2 pb-3 text-[14px] font-semibold uppercase tracking-[0.14em] transition ${
                      tab.id === activeTab?.id
                        ? "border-[#FAB041] text-neutral-950"
                        : "border-transparent text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="pt-6">{activeTab?.content}</div>
            </section>

            {content.relatedContent.length > 0 ? (
              <section className="mt-auto border-t border-neutral-200 pt-6">
                <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
                  <Link2 className="h-4 w-4" />
                  {t("sidebar.related", lang)}
                </div>
                <RelatedContentCards items={content.relatedContent} lang={lang} />
              </section>
            ) : null}
          </article>
        </section>
      </div>

      {lightboxOpen && selectedMedia ? (
        <ImageLightbox
          src={selectedMedia.url}
          alt={selectedMedia.altText}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </main>
  )
}
