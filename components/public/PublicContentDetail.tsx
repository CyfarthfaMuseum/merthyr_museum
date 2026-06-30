"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  ImageIcon,
  MapPin,
  ZoomIn,
} from "lucide-react"
import {
  publicHref,
  type PublicContentItemViewModel,
  type PublicMedia,
} from "@/lib/public/types"
import PublicNavMenu from "./PublicNavMenu"
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

function detailRowsFor(content: PublicContentItemViewModel): DetailRow[] {
  if (content.painting) {
    return [
      { label: "Artist", value: content.painting.artistName },
      { label: "Year", value: content.painting.yearCreated },
      { label: "Medium", value: content.painting.medium },
      { label: "Dimensions", value: content.painting.dimensions },
      { label: "Collection", value: content.painting.currentCollection },
      { label: "Image credit", value: content.painting.imageCredit },
    ]
  }

  if (content.book) {
    return [
      { label: "Author", value: content.book.author },
      { label: "Publisher", value: content.book.publisher },
      { label: "Publication year", value: content.book.publicationYear },
      { label: "ISBN", value: content.book.isbn },
    ]
  }

  if (content.artefact) {
    return [
      { label: "Maker", value: content.artefact.maker },
      { label: "Origin", value: content.artefact.originPlace },
      { label: "Date", value: content.artefact.dateCreatedLabel ?? content.dateLabel },
      { label: "Material", value: content.artefact.material },
      { label: "Dimensions", value: content.artefact.dimensions },
      { label: "Collection", value: content.artefact.collectionHolder },
      { label: "Reference", value: content.artefact.catalogueReference },
    ]
  }

  if (content.biography) {
    const lifeDates = [content.biography.birthYear, content.biography.deathYear]
      .filter(Boolean)
      .join("-")

    return [
      { label: "Name", value: content.biography.personName },
      { label: "Dates", value: lifeDates || null },
      { label: "Birth place", value: content.biography.birthPlace },
      { label: "Occupation", value: content.biography.occupation },
    ]
  }

  if (content.story) {
    return [
      { label: "Person", value: content.story.relatedPersonName },
      { label: "Date", value: content.dateLabel },
    ]
  }

  return [{ label: "Date", value: content.dateLabel }]
}

function DetailsList({ rows }: { rows: DetailRow[] }) {
  const visibleRows = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== "")

  if (visibleRows.length === 0) {
    return <p className="text-[15px] leading-7 text-neutral-600">Details to follow.</p>
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {visibleRows.map((row) => (
        <div key={row.label} className="border-t border-neutral-200 pt-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {row.label}
          </dt>
          <dd className="mt-1 text-[15px] leading-6 text-neutral-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ProseText({ children }: { children: string | null | undefined }) {
  if (!children) {
    return <p className="text-[15px] leading-7 text-neutral-600">Content to follow.</p>
  }

  return (
    <div className="space-y-4 break-words text-[16px] leading-8 text-neutral-800">
      {children.split(/\n{2,}/).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function mediaLabel(media: PublicMedia) {
  return media.caption || media.fileName || "Gallery image"
}

function getCreatorLabel(content: PublicContentItemViewModel) {
  return (
    content.painting?.artistName ||
    content.book?.author ||
    content.artefact?.maker ||
    content.story?.relatedPersonName ||
    content.biography?.personName ||
    null
  )
}

function buildTabs(content: PublicContentItemViewModel): Tab[] {
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
      label: "Caption",
      content: <ProseText>{captionText}</ProseText>,
    },
    {
      id: "details",
      label: "Details",
      content: <DetailsList rows={detailRowsFor(content)} />,
    },
  ]

  if (content.painting) {
    tabs.push({
      id: "origin",
      label: "Origin",
      content: (
        <DetailsList
          rows={[
            { label: "Created", value: content.painting.yearCreated },
            { label: "Collection", value: content.painting.currentCollection },
            { label: "Date", value: content.dateLabel },
          ]}
        />
      ),
    })
  }

  if (content.locations.length > 0) {
    tabs.push({
      id: "location",
      label: "Location",
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
  const [selectedMediaId, setSelectedMediaId] = useState(content.primaryImage?.id ?? "")
  const [zoomed, setZoomed] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const tabs = useMemo(() => buildTabs(content), [content])
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
          <PublicNavMenu lang={content.language} />
          <button
            type="button"
            onClick={() => router.back()}
            className="fixed left-12 top-0 z-30 flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-950/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-neutral-950/60 lg:left-16 lg:h-14 lg:w-14"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 lg:h-7 lg:w-7" />
          </button>
        </>
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        {hideNav ? null : <div className="h-[52px] lg:h-[68px]" aria-hidden="true" />}

        <section className="grid min-w-0 flex-1 grid-cols-1 gap-8 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-12 lg:py-10">
          <div className="flex min-h-[440px] min-w-0 flex-col">
            <div className="relative flex min-h-[360px] flex-1 items-center justify-center overflow-hidden bg-neutral-100">
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
                  <span className="text-[14px]">Image pending</span>
                </div>
              )}
              {selectedMedia ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center bg-white/90 text-neutral-900 shadow-sm transition hover:bg-white"
                  aria-label="View image full screen"
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
                    aria-label={mediaLabel(media)}
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

          <article className="flex min-w-0 flex-col">
            <div className="border-b border-neutral-200 pb-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {content.contentType.code}
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
                  Audio
                </div>
                <audio controls src={content.audioMedia.url} className="w-full" />
              </section>
            ) : null}

            <section className="py-6">
              <div className="flex gap-7 overflow-x-auto border-b border-neutral-200">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`shrink-0 border-b-2 pb-3 text-[14px] font-semibold uppercase tracking-[0.14em] transition ${
                      tab.id === activeTab?.id
                        ? "border-neutral-950 text-neutral-950"
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
                  <BookOpen className="h-4 w-4" />
                  Related
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {content.relatedContent.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="border border-neutral-200 p-4 transition hover:border-neutral-950"
                    >
                      <p className="text-[12px] uppercase tracking-[0.14em] text-neutral-500">
                        {item.contentType}
                      </p>
                      <p className="mt-2 text-[16px] font-medium text-neutral-950">
                        {item.title}
                      </p>
                    </Link>
                  ))}
                </div>
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
