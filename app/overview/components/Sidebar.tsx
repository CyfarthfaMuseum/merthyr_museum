'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { SidebarBookGroup, SidebarCounts } from '../types'
import { GreenButton } from './ui/Buttons'

type Props = {
  userEmail: string
  counts: SidebarCounts
  bookGroups: SidebarBookGroup[]
  isOpen: boolean
  onToggle: () => void
  adminUserCount?: number // optional for now
}

export default function Sidebar({ userEmail, counts, bookGroups, isOpen, onToggle, adminUserCount = 0 }: Props) {
  const [booksExpanded, setBooksExpanded] = useState(false)

  return (
    <>
      <aside
        className={`${isOpen ? 'fixed' : 'hidden'} left-0 top-14 z-40 flex h-[calc(100vh-56px)] w-[420px] flex-col border-r border-neutral-300 bg-neutral-50 lg:relative lg:top-0 lg:flex lg:h-full lg:z-auto`}
      >
        {/* Header (fixed height) */}
        <div className="border-b border-neutral-200 px-8 flex items-center h-[96px]">
          <div>
            <div className="text-[34px] font-semibold tracking-tight text-emerald-700">
              HER·STORIES
            </div>
            <div className="mt-1 text-[14px] font-semibold uppercase leading-tight tracking-wide text-emerald-700">
              Content
              <br />
              Manager
            </div>
          </div>
        </div>

        {/* Scrollable/fill content (middle row) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="border-b border-neutral-200 px-8 py-8">
            <div className="mb-6 text-[20px] font-semibold">
              Content ({counts.totalContent})
            </div>
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
              <span className="text-[18px] font-semibold">Books ({counts.books})</span>
              <span className="text-[18px] text-neutral-500">{booksExpanded ? '▾' : '▸'}</span>
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

          {counts.biographies > 0 ? (
            <div className="border-b border-neutral-200 px-8 py-6">
              <div className="text-[18px] font-semibold">
                Biographies ({counts.biographies})
              </div>
            </div>
          ) : null}

          <div className="border-b border-neutral-200 px-8 py-6">
            <div className="text-[18px] font-semibold">Stories ({counts.stories})</div>
          </div>

          <div className="border-b border-neutral-200 px-8 py-6">
            <div className="text-[18px] font-semibold">
              Paintings ({counts.paintings})
            </div>
          </div>

          <div className="border-b border-neutral-200 px-8 py-6">
            <div className="text-[18px] font-semibold">
              Artefacts ({counts.artifacts})
            </div>
          </div>
        </div>

        {/* Footer (fixed height) */}
        <div className="shrink-0">
          <div className="border-t border-neutral-200 px-8 py-4 bg-neutral-50">
            <div className="text-[16px] font-semibold">Admin Users ({adminUserCount})</div>
          </div>
          <div className="border-t border-neutral-300 bg-neutral-50 px-8 py-3">
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
