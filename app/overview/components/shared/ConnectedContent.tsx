'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import SectionTitle from '../ui/SectionTitle'
import {
  searchContentAction,
  saveRelatedContentAction,
  removeRelatedContentAction,
} from '../../image-actions'
import type { ConnectedItem } from '../../types'

type Props = {
  contentItemId?: string | null
  contentType: string
  initialConnected?: ConnectedItem[]
  onError?: (message: string) => void
}

export default function ConnectedContent({
  contentItemId,
  contentType,
  initialConnected,
  onError,
}: Props) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ConnectedItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [connected, setConnected] = useState<ConnectedItem[]>(initialConnected ?? [])
  const [activeTab, setActiveTab] = useState('All')
  const [, startLinkTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      const result = await searchContentAction({ query, excludeId: contentItemId })
      if (result.success) {
        const connectedIds = new Set(connected.map((c) => c.id))
        setSearchResults(result.results.filter((r) => !connectedIds.has(r.id)))
      }
      setIsSearching(false)
    }, 300)
  }, [query, contentItemId, connected])

  const typeTabs = [...new Set(searchResults.map((r) => r.contentTypeLabel).filter(Boolean))]
  const tabs = ['All', ...typeTabs]
  const filteredResults =
    activeTab === 'All'
      ? searchResults
      : searchResults.filter((r) => r.contentTypeLabel === activeTab)

  function handleAddItem(item: ConnectedItem) {
    if (!contentItemId) {
      onError?.('Save the content item before adding connections.')
      return
    }
    startLinkTransition(async () => {
      const result = await saveRelatedContentAction({
        parentId: contentItemId,
        childId: item.id,
      })
      if (!result.success) {
        onError?.(result.error)
        return
      }
      setConnected((current) => [...current, item])
      setSearchResults((current) => current.filter((r) => r.id !== item.id))
      setQuery('')
    })
  }

  function handleRemoveItem(itemId: string) {
    if (!contentItemId) return
    startLinkTransition(async () => {
      const result = await removeRelatedContentAction({
        parentId: contentItemId,
        childId: itemId,
      })
      if (!result.success) {
        onError?.(result.error)
        return
      }
      setConnected((current) => current.filter((c) => c.id !== itemId))
    })
  }

  const contentTypeLabel =
    contentType === 'book'
      ? 'book'
      : contentType === 'stories'
        ? 'story'
        : contentType === 'painting'
          ? 'painting'
          : contentType === 'artifacts'
            ? 'artefact'
            : contentType === 'bio'
              ? 'biography'
              : 'item'

  return (
    <div className="space-y-4">
      <SectionTitle>Connected Content</SectionTitle>
      <p className="text-sm text-neutral-600">
        Search existing content to connect this {contentTypeLabel} with.
      </p>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveTab('All')
          }}
          placeholder="Search content..."
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-10 text-[14px] outline-none focus:border-neutral-600"
        />
        <Search
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
      </div>

      {isSearching && <p className="text-sm text-neutral-500">Searching…</p>}

      {!isSearching && searchResults.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <div className="flex overflow-x-auto border-b border-neutral-200 bg-white">
            {tabs.map((tab) => {
              const count =
                tab === 'All'
                  ? searchResults.length
                  : searchResults.filter((r) => r.contentTypeLabel === tab).length
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-[13px] font-medium ${
                    activeTab === tab
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {tab} ({count})
                </button>
              )
            })}
          </div>

          <ul className="max-h-64 divide-y divide-neutral-100 overflow-y-auto">
            {filteredResults.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleAddItem(item)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50"
                >
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-neutral-200">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-neutral-800">{item.title}</div>
                    <div className="text-[12px] text-neutral-500">{item.contentTypeLabel}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {connected.length > 0 && (
        <ul className="space-y-2">
          {connected.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2"
            >
              <div>
                <div className="text-[14px] font-medium text-neutral-800">{item.title}</div>
                <div className="text-[12px] text-neutral-500">{item.contentTypeLabel}</div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="ml-4 shrink-0 text-neutral-400 hover:text-neutral-700"
                aria-label="Remove connection"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
