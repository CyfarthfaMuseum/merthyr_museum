'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { SidebarBookGroup, SidebarCounts, SidebarStoryGroup, SidebarPaintingGroup, SidebarArtifactGroup, SidebarBio } from '../types'
import { GreenButton } from './ui/Buttons'

function formatBioName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name
  const surname = parts[parts.length - 1]
  const forenames = parts.slice(0, -1).join(' ')
  return `${surname}, ${forenames}`
}

type ContentHeaderProps = {
  label: string
  count: number
  expanded?: boolean
}

function ContentHeader({ label, count, expanded }: ContentHeaderProps) {
  return (
    <div className="flex items-center gap-3">      
      {expanded === undefined ? null : (
        <Image
          src={expanded ? '/arrowUp.png' : '/arrowRight.png'}
          alt=""
          aria-hidden
          width={expanded ? 12 : 8}
          height={expanded ? 8 : 12}
          className={expanded ? "h-[8px] w-[12px]" : "h-[12px] w-[8px]" }
        />
      )}
      <span className="text-[18px] font-semibold">
        {label} ({count})
      </span>
    </div>
  )
}

type Props = {
  userEmail: string
  counts: SidebarCounts
  bookGroups: SidebarBookGroup[]
  storyGroups: SidebarStoryGroup[]
  paintingGroups: SidebarPaintingGroup[]
  artifactGroups: SidebarArtifactGroup[]
  bios: SidebarBio[]
  isOpen: boolean
  onToggle: () => void
  adminUserCount?: number
}

export default function Sidebar({ userEmail, counts, bookGroups, storyGroups, paintingGroups, artifactGroups, bios, isOpen, onToggle, adminUserCount = 0 }: Props) {
  const [booksExpanded, setBooksExpanded] = useState(false)
  const [storiesExpanded, setStoriesExpanded] = useState(false)
  const [paintingsExpanded, setPaintingsExpanded] = useState(false)
  const [artefactsExpanded, setArtefactsExpanded] = useState(false)
  const [biographiesExpanded, setBiographiesExpanded] = useState(false)

  return (
    <>
      <aside
        className={`${isOpen ? 'fixed' : 'hidden'} left-0 top-14 z-40 flex h-[calc(100vh-56px)] w-[420px] flex-col border-r border-neutral-300 bg-white lg:relative lg:top-0 lg:flex lg:h-full lg:z-auto`}
      >
        {/* Header (fixed height) */}
        <div className="border-b border-neutral-200 px-8 flex items-center h-[96px]">
          <Image src="/menuLogo.png" 
              alt="Her Stories Content Manager Logo"
              width={240}
            height={96}
            className="object-contain"
            priority/>
        </div>

        {/* Scrollable/fill content (middle row) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="border-b border-neutral-200 px-8 py-8">
            <div className="mb-6"><ContentHeader label="Content" count={counts.totalContent} /></div>
            <Link href="/overview?new=1">
              <GreenButton className="w-full">ADD NEW</GreenButton>
            </Link>
          </div>

          <div className="border-b border-neutral-200 px-8 py-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setBooksExpanded((current) => !current)}
            >
              <ContentHeader label="Books" count={counts.books} expanded={booksExpanded} />
            </button>

            {booksExpanded ? (
              <div className="mt-4 space-y-4">
                {bookGroups.length > 0 ? (
                  bookGroups.map((group) => (
                    <div key={group.genre}>
                      <div className="text-[15px] font-semibold text-neutral-700">
                        {group.genre} ({group.books.length})
                      </div>
                      <ul className="mt-2 space-y-1 pl-4">
                        {group.books.map((book) => (
                          <li key={book.id}>
                            <Link
                              href={`/overview?type=book&id=${book.id}`}
                              className="text-[14px] text-neutral-600 hover:text-neutral-900"
                            >
                              {book.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="text-[14px] text-neutral-600">No books available.</div>
                )}
              </div>
            ) : null}
          </div>

          <div className="border-b border-neutral-200 px-8 py-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setBiographiesExpanded((current) => !current)}
            >
              <ContentHeader label="Biographies" count={counts.biographies} expanded={biographiesExpanded} />
            </button>

            {biographiesExpanded ? (
              <div className="mt-4">
                {bios.length > 0 ? (
                  <ul className="space-y-1">
                    {bios.map((bio) => (
                      <li key={bio.id}>
                        <Link
                          href={`/overview?type=bio&id=${bio.id}`}
                          className="text-[14px] text-neutral-600 hover:text-neutral-900"
                        >
                          {formatBioName(bio.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-[14px] text-neutral-600">No biographies available.</div>
                )}
              </div>
            ) : null}
          </div>

          <div className="border-b border-neutral-200 px-8 py-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setStoriesExpanded((current) => !current)}
            >
              <ContentHeader label="Stories" count={counts.stories} expanded={storiesExpanded} />
            </button>

            {storiesExpanded ? (
              <div className="mt-4 space-y-4">
                {storyGroups.length > 0 ? (
                  storyGroups.map((group) => (
                    <div key={group.storyTypeCode}>
                      <div className="text-[15px] font-semibold text-neutral-700">
                        {group.storyTypeLabel} ({group.stories.length})
                      </div>
                      <ul className="mt-2 space-y-1 pl-4">
                        {group.stories.map((story) => (
                          <li key={story.id}>
                            <Link
                              href={`/overview?type=stories&id=${story.id}`}
                              className="text-[14px] text-neutral-600 hover:text-neutral-900"
                            >
                              {story.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="text-[14px] text-neutral-600">No stories available.</div>
                )}
              </div>
            ) : null}
          </div>

          <div className="border-b border-neutral-200 px-8 py-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setPaintingsExpanded((current) => !current)}
            >
              <ContentHeader label="Paintings" count={counts.paintings} expanded={paintingsExpanded} />
            </button>

            {paintingsExpanded ? (
              <div className="mt-4 space-y-4">
                {paintingGroups.length > 0 ? (
                  paintingGroups.map((group) => (
                    <div key={group.medium}>
                      <div className="text-[15px] font-semibold text-neutral-700">
                        {group.medium} ({group.paintings.length})
                      </div>
                      <ul className="mt-2 space-y-1 pl-4">
                        {group.paintings.map((painting) => (
                          <li key={painting.id}>
                            <Link
                              href={`/overview?type=painting&id=${painting.id}`}
                              className="text-[14px] text-neutral-600 hover:text-neutral-900"
                            >
                              {painting.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="text-[14px] text-neutral-600">No paintings available.</div>
                )}
              </div>
            ) : null}
          </div>

          <div className="border-b border-neutral-200 px-8 py-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setArtefactsExpanded((current) => !current)}
            >
              <ContentHeader label="Artefacts" count={counts.artifacts} expanded={artefactsExpanded} />
            </button>

            {artefactsExpanded ? (
              <div className="mt-4 space-y-4">
                {artifactGroups.length > 0 ? (
                  artifactGroups.map((group) => (
                    <div key={group.material}>
                      <div className="text-[15px] font-semibold text-neutral-700">
                        {group.material} ({group.artifacts.length})
                      </div>
                      <ul className="mt-2 space-y-1 pl-4">
                        {group.artifacts.map((artifact) => (
                          <li key={artifact.id}>
                            <Link
                              href={`/overview?type=artifacts&id=${artifact.id}`}
                              className="text-[14px] text-neutral-600 hover:text-neutral-900"
                            >
                              {artifact.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="text-[14px] text-neutral-600">No artefacts available.</div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer (fixed height) */}
        <div className="shrink-0">
          <div className="border-t border-neutral-200 px-8 py-3 bg-white">
            <div className="text-[16px] font-semibold">Admin Users ({adminUserCount})</div>
          </div>
          <div className="border-t-0 border-neutral-300 bg-white px-8 py-3">
            <div className="text-[18px] font-semibold">LOG OUT</div>
            <div className="text-[15px] text-neutral-600">{userEmail}</div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          aria-label="Close sidebar"
        />
      )}
    </>
  )
}
