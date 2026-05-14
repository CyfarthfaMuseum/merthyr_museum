'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '../../../utils/supabase/client'
import type { UiLang } from '../ui-strings'
import { uiStrings } from '../ui-strings'
import type { SidebarBookGroup, SidebarCounts, SidebarStoryGroup, SidebarPaintingGroup, SidebarArtifactGroup, SidebarBio, SidebarLocation } from '../types'
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
  sidebarLocations?: SidebarLocation[]
  onLocationDeleted?: (locationId: string) => void
  isOpen: boolean
  onToggle: () => void
  adminUserCount?: number
  adminUsersActive?: boolean
  locationsActive?: boolean
  selectedId?: string | null
  uiLang: UiLang
  onUiLangChange: (lang: UiLang) => void
}

export default function Sidebar({ userEmail, counts, bookGroups, storyGroups, paintingGroups, artifactGroups, bios, sidebarLocations = [], isOpen, onToggle, adminUserCount = 0, adminUsersActive = false, locationsActive = false, selectedId, uiLang, onUiLangChange }: Props) {
  const router = useRouter()
  const t = uiStrings[uiLang]
  const [booksExpanded, setBooksExpanded] = useState(false)
  const [storiesExpanded, setStoriesExpanded] = useState(false)
  const [paintingsExpanded, setPaintingsExpanded] = useState(false)
  const [artefactsExpanded, setArtefactsExpanded] = useState(false)
  const [biographiesExpanded, setBiographiesExpanded] = useState(false)

  async function handleLogOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <>
      <aside
        className={`${isOpen ? 'fixed' : 'hidden'} left-0 top-14 z-40 flex h-[calc(100vh-56px)] w-[420px] flex-col border-r border-neutral-300 bg-white lg:relative lg:top-0 lg:flex lg:h-full lg:z-auto`}
      >
        {/* Header (fixed height) */}
        <div className="border-b border-neutral-200 px-8 flex flex-col items-start justify-center h-[96px]">
          <Image src={uiLang === 'cy' ? '/menuLogo-cy.png' : '/menuLogo.png'} 
              alt="Her Stories Content Manager Logo"
              width={240}
            height={96}
            className="object-contain"
            priority/>
          {process.env.NEXT_PUBLIC_IS_DEV === 'true' && (
            <div className="mt-1 rounded bg-amber-400 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-amber-900">
              Development
            </div>
          )}
        </div>

        {/* Scrollable/fill content (middle row) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="border-b border-neutral-200 px-8 py-8">
            <div className="mb-6"><ContentHeader label={t.content} count={counts.totalContent} /></div>
            <Link href="/overview?new=1">
              <GreenButton className="w-full">{t.addNew}</GreenButton>
            </Link>
          </div>

          <div className="border-b border-neutral-200 px-8 py-6">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setBooksExpanded((current) => !current)}
            >
              <ContentHeader label={t.books} count={counts.books} expanded={booksExpanded} />
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
                              className={`block text-[14px] hover:text-neutral-900 ${selectedId === book.id ? '-mx-8 border-r-4 border-[#fbb042] bg-neutral-900 px-8 py-1 text-white hover:text-white' : 'text-neutral-600'}`}
                            >
                              {book.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="text-[14px] text-neutral-600">{t.noBooksAvailable}</div>
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
              <ContentHeader label={t.biographies} count={counts.biographies} expanded={biographiesExpanded} />
            </button>

            {biographiesExpanded ? (
              <div className="mt-4">
                {bios.length > 0 ? (
                  <ul className="space-y-1">
                    {bios.map((bio) => (
                      <li key={bio.id}>
                        <Link
                          href={`/overview?type=bio&id=${bio.id}`}
                          className={`block text-[14px] hover:text-neutral-900 ${selectedId === bio.id ? '-mx-8 border-r-4 border-[#fbb042] bg-neutral-900 px-8 py-1 text-white hover:text-white' : 'text-neutral-600'}`}
                        >
                          {formatBioName(bio.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-[14px] text-neutral-600">{t.noBiographiesAvailable}</div>
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
              <ContentHeader label={t.stories} count={counts.stories} expanded={storiesExpanded} />
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
                              className={`block text-[14px] hover:text-neutral-900 ${selectedId === story.id ? '-mx-8 border-r-4 border-[#fbb042] bg-neutral-900 px-8 py-1 text-white hover:text-white' : 'text-neutral-600'}`}
                            >
                              {story.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="text-[14px] text-neutral-600">{t.noStoriesAvailable}</div>
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
              <ContentHeader label={t.paintings} count={counts.paintings} expanded={paintingsExpanded} />
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
                              className={`block text-[14px] hover:text-neutral-900 ${selectedId === painting.id ? '-mx-8 border-r-4 border-[#fbb042] bg-neutral-900 px-8 py-1 text-white hover:text-white' : 'text-neutral-600'}`}
                            >
                              {painting.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="text-[14px] text-neutral-600">{t.noPaintingsAvailable}</div>
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
              <ContentHeader label={t.artefacts} count={counts.artifacts} expanded={artefactsExpanded} />
            </button>

            {artefactsExpanded ? (
              <div className="mt-4 space-y-4">
                {artifactGroups.length > 0 ? (
                  artifactGroups.map((group) => (
                    <div key={group.categoryCode}>
                      <div className="text-[15px] font-semibold text-neutral-700">
                        {group.categoryLabel} ({group.artifacts.length})
                      </div>
                      <ul className="mt-2 space-y-1 pl-4">
                        {group.artifacts.map((artifact) => (
                          <li key={artifact.id}>
                            <Link
                              href={`/overview?type=artifacts&id=${artifact.id}`}
                              className={`block text-[14px] hover:text-neutral-900 ${selectedId === artifact.id ? '-mx-8 border-r-4 border-[#fbb042] bg-neutral-900 px-8 py-1 text-white hover:text-white' : 'text-neutral-600'}`}
                            >
                              {artifact.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="text-[14px] text-neutral-600">{t.noArtefactsAvailable}</div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer (fixed height) */}
        <div className="shrink-0">
          <div className={`border-t border-neutral-200 bg-white ${locationsActive ? 'bg-neutral-900 border-r-4 border-r-[#fbb042]' : ''}`}>
            <Link
              href="/overview?view=locations"
              className={`flex items-center gap-3 px-8 py-3 transition ${locationsActive ? 'bg-neutral-900 text-white hover:text-white' : 'hover:bg-neutral-50 text-neutral-900'}`}
            >
              <img src="/location-icon.svg" alt="" aria-hidden width={32} height={32} className="opacity-70" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span className="text-[16px] font-semibold">{t.locations} ({sidebarLocations.length})</span>
            </Link>
          </div>
          <div className={`border-t border-neutral-200 bg-white ${adminUsersActive ? 'bg-neutral-900 border-r-4 border-r-[#fbb042]' : ''}`}>
            <Link
              href="/overview?view=admin-users"
              className={`flex items-center gap-3 px-8 py-3 transition ${adminUsersActive ? 'bg-neutral-900 text-white hover:text-white' : 'hover:bg-neutral-50 text-neutral-900'}`}
            >
              <img src="/user-icon.svg" alt="" aria-hidden width={32} height={32} className="opacity-70" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span className="text-[16px] font-semibold">{t.adminUsers} ({adminUserCount})</span>
            </Link>
          </div>
          <div className="border-t border-neutral-200" />
          <div className="flex items-center justify-between gap-3 px-8 py-3">
            <button
              type="button"
              onClick={handleLogOut}
              className="text-left transition hover:opacity-70"
            >
              <div className="text-[18px] font-semibold">{t.logOut}</div>
              <div className="text-[15px] text-neutral-600">{userEmail}</div>
            </button>
            <div className="inline-flex overflow-hidden rounded-lg border border-neutral-300 text-sm font-medium">
              <button
                type="button"
                onClick={() => onUiLangChange('cy')}
                className={`px-3 py-1.5 transition ${uiLang === 'cy' ? 'bg-[#147a4c] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
              >
                CY
              </button>
              <button
                type="button"
                onClick={() => onUiLangChange('en')}
                className={`border-l border-neutral-300 px-3 py-1.5 transition ${uiLang === 'en' ? 'bg-[#147a4c] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
              >
                EN
              </button>
            </div>
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
