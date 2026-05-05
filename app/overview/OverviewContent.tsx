'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { createBookGenreAction, createStoryTypeAction, saveContentAction } from './actions'
import { validateDraft } from './validation'
import type {
  ContentType,
  EditorMode,
  OverviewDraft,
  SidebarBookGroup,
  SidebarCounts,
  StoryTypeOption,
} from './types'
import Sidebar from './components/Sidebar'
import ContentTypeSelector from './components/ContentTypeSelector'
import StoryTypeSelector from './components/StoryTypeSelector'
import BookForm from './components/forms/BookForm'
import StoryForm from './components/forms/StoryForm'
import PaintingForm from './components/forms/PaintingForm'
import ArtifactForm from './components/forms/ArtifactForm'
import BioForm from './components/forms/BioForm'
import { BlackButton, GreenButton } from './components/ui/Buttons'
import Divider from './components/ui/Divider'
import Input from './components/ui/Input'
import Modal from './components/ui/Modal'
import SectionTitle from './components/ui/SectionTitle'
import Textarea from './components/ui/Textarea'
import Toast from './components/ui/Toast'
import ImageManager from './components/shared/ImageManager'

type Props = {
  userEmail: string
  sidebarCounts: SidebarCounts
  sidebarBookGroups: SidebarBookGroup[]
  initialDraft: OverviewDraft
  mode: EditorMode
  editId: string | null
  editType: ContentType | null
  availableBookGenres: string[]
  availableStoryTypes: StoryTypeOption[]
  showEditor: boolean
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function OverviewContent({
  userEmail,
  sidebarCounts,
  sidebarBookGroups,
  initialDraft,
  mode,
  editId,
  availableBookGenres,
  availableStoryTypes,
  showEditor,
}: Props) {
  const [draft, setDraft] = useState<OverviewDraft>(initialDraft)
  const [genres, setGenres] = useState<string[]>(availableBookGenres)
  const [selectedBookGenre, setSelectedBookGenre] = useState('')
  const [isPending, startTransition] = useTransition()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [publishingSettingsOpen, setPublishingSettingsOpen] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)

  const [slugEditedManually, setSlugEditedManually] = useState(mode === 'edit')
  const [seoTitleEditedManually, setSeoTitleEditedManually] = useState(mode === 'edit')
  const [seoDescriptionEditedManually, setSeoDescriptionEditedManually] = useState(mode === 'edit')

  const [genreModalOpen, setGenreModalOpen] = useState(false)
  const [newGenreTitle, setNewGenreTitle] = useState('')
  const [isCreatingGenre, startGenreTransition] = useTransition()
  const [storyTypes, setStoryTypes] = useState<StoryTypeOption[]>(availableStoryTypes)
  const [storyTypeModalOpen, setStoryTypeModalOpen] = useState(false)
  const [newStoryTypeLabel, setNewStoryTypeLabel] = useState('')
  const [isCreatingStoryType, startStoryTypeTransition] = useTransition()

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastTone, setToastTone] = useState<'success' | 'error'>('success')
  const [savedContentItemId, setSavedContentItemId] = useState<string | null>(editId)
  const [pendingMediaAssetIds, setPendingMediaAssetIds] = useState<string[]>([])

  useEffect(() => {
    setDraft(initialDraft)
    setGenres(availableBookGenres)
    setStoryTypes(availableStoryTypes)
    setSlugEditedManually(mode === 'edit')
    setSeoTitleEditedManually(mode === 'edit')
    setSeoDescriptionEditedManually(mode === 'edit')
    setSavedContentItemId(editId)
    setPendingMediaAssetIds([])
  }, [initialDraft, availableBookGenres, availableStoryTypes, mode, editId])

  useEffect(() => {
    if (!toastOpen) return
    const timer = setTimeout(() => setToastOpen(false), 3000)
    return () => clearTimeout(timer)
  }, [toastOpen])

  const generatedSlug = useMemo(() => {
    if (draft.contentType === 'book') {
      return slugify([draft.book.title, draft.book.author].filter(Boolean).join(' '))
    }

    if (draft.contentType === 'stories') {
      return slugify(draft.story.title)
    }

    if (draft.contentType === 'painting') {
      return slugify([draft.painting.title, draft.painting.artist].filter(Boolean).join(' '))
    }

    if (draft.contentType === 'artifacts') {
      return slugify(draft.artifact.title)
    }

    if (draft.contentType === 'bio') {
      return slugify([draft.bio.name, draft.bio.occupation].filter(Boolean).join(' '))
    }

    return ''
  }, [draft])

  const generatedSeoTitle = useMemo(() => {
    if (draft.contentType === 'book') return draft.book.title
    if (draft.contentType === 'stories') return draft.story.title
    if (draft.contentType === 'painting') return draft.painting.title
    if (draft.contentType === 'artifacts') return draft.artifact.title
    if (draft.contentType === 'bio') return draft.bio.name
    return ''
  }, [draft])

  const generatedSeoDescription = useMemo(() => {
    if (draft.contentType === 'book') return draft.book.summary
    if (draft.contentType === 'stories') return draft.story.summary
    if (draft.contentType === 'painting') return draft.painting.description
    if (draft.contentType === 'artifacts') return draft.artifact.description
    if (draft.contentType === 'bio') return draft.bio.summary
    return ''
  }, [draft])

  useEffect(() => {
    setDraft((current) => {
      const next = { ...current }

      if (!slugEditedManually) {
        next.slug = generatedSlug
      }

      if (!seoTitleEditedManually) {
        next.seoTitle = generatedSeoTitle
      }

      if (!seoDescriptionEditedManually) {
        next.seoDescription = generatedSeoDescription
      }

      if (!next.sortOrder) {
        next.sortOrder = '100'
      }

      if (next.featuredImageId == null) {
        next.featuredImageId = ''
      }

      return next
    })
  }, [
    generatedSlug,
    generatedSeoTitle,
    generatedSeoDescription,
    slugEditedManually,
    seoTitleEditedManually,
    seoDescriptionEditedManually,
  ])

  function showToast(message: string, tone: 'success' | 'error') {
    setToastMessage(message)
    setToastTone(tone)
    setToastOpen(true)
  }

  function updateContentType(value: ContentType) {
    if (mode === 'edit') return
    setDraft((current) => ({ ...current, contentType: value }))
  }

  function handleSelectedBookGenreChange(value: string) {
    setSelectedBookGenre(value)
    if (!value) return

    setDraft((current) => {
      if (current.book.genres.includes(value)) return current
      return {
        ...current,
        book: {
          ...current.book,
          genres: [...current.book.genres, value],
        },
      }
    })

    setSelectedBookGenre('')
  }

  function removeBookGenre(genreToRemove: string) {
    setDraft((current) => ({
      ...current,
      book: {
        ...current.book,
        genres: current.book.genres.filter((genre) => genre !== genreToRemove),
      },
    }))
  }

  function handleOpenNewGenre() {
    setNewGenreTitle('')
    setGenreModalOpen(true)
  }

  function handleCreateGenre() {
    const trimmed = newGenreTitle.trim()

    if (!trimmed) {
      showToast('Genre name is required.', 'error')
      return
    }

    startGenreTransition(async () => {
      const result = await createBookGenreAction({
        title: trimmed,
        languageCode: 'en',
      })

      if (!result.success) {
        showToast(result.error ?? '', 'error')
        return
      }

      setGenres((current) => {
        const next = current.includes(result.genreTitle)
          ? current
          : [...current, result.genreTitle]
        return [...next].sort((a, b) => a.localeCompare(b))
      })

      setGenreModalOpen(false)

      // Always apply the new genre to the book immediately
      setDraft((current) => {
        if (current.book.genres.includes(result.genreTitle)) return current
        return {
          ...current,
          book: {
            ...current.book,
            genres: [...current.book.genres, result.genreTitle],
          },
        }
      })

      setSelectedBookGenre('')

      showToast(
        result.alreadyExisted ? 'Genre already existed and has been applied.' : 'Genre created and applied.',
        'success'
      )
    })
  }

  function handleCreateStoryType() {
    const label = newStoryTypeLabel.trim()
    if (!label) return

    startStoryTypeTransition(async () => {
      const result = await createStoryTypeAction({ label })
      if (!result.success) {
        showToast(result.error ?? 'An error occurred.', 'error')
        return
      }

      if (result.storyType && result.storyType.code && result.storyType.label) {
        setStoryTypes((current) =>
          current.some((item) => item.code === result.storyType!.code)
            ? current
            : [...current, result.storyType!].sort((a, b) => a.label.localeCompare(b.label))
        )
        setDraft((current) => ({
          ...current,
          story: { ...current.story, storyType: result.storyType!.code },
        }))
      }
      setStoryTypeModalOpen(false)
      setNewStoryTypeLabel('')
      showToast(result.alreadyExisted ? 'Story type already existed.' : 'Story type created.', 'success')
    })
  }

  function handleSave() {
    const errors = validateDraft(draft)

    if (errors.length > 0) {
      showToast(errors[0], 'error')
      return
    }

    startTransition(async () => {
      const result = await saveContentAction({
        draft,
        mode,
        editId,
        languageCode: 'en',
        pendingMediaAssetIds,
      })

      if (!result.success) {
        showToast(result.error, 'error')
        return
      }

      setSavedContentItemId(result.id)
      setPendingMediaAssetIds([])
      showToast(mode === 'edit' ? 'Content updated.' : 'Content saved.', 'success')
    })
  }

  function handleSlugManualChange(nextSlug: string) {
    setSlugEditedManually(true)
    setDraft((current) => ({ ...current, slug: nextSlug }))
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-neutral-900">
      <button
        type="button"
        onClick={() => setSidebarOpen((current) => !current)}
        className="sticky top-0 z-40 flex h-14 items-center justify-start gap-3 border-b border-neutral-300 bg-white px-6 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <span className="text-xl">☰</span>
        <span className="text-sm font-semibold">Menu</span>
      </button>

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 border-x border-neutral-300 bg-white">
        <Sidebar
          userEmail={userEmail}
          counts={sidebarCounts}
          bookGroups={sidebarBookGroups}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((current) => !current)}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 md:px-12 xl:px-16">
            {showEditor ? (
              <>
                <div className="mb-10 flex items-center gap-3">
                  <img src="/content-icon.png" alt="" className="h-[24px] w-[24px]" />
                  <h1 className="text-[22px] font-semibold">
                    {mode === 'edit' ? 'Edit Content' : 'New Content'}
                  </h1>
                </div>

                <div className="mx-auto max-w-[920px] space-y-8 pb-32">
                  <div className="space-y-4">
                    <SectionTitle>Select Content Type</SectionTitle>
                    <ContentTypeSelector value={draft.contentType} onChange={updateContentType} />
                  </div>

                  <Divider />

                  {draft.contentType === 'book' && (
                    <BookForm
                      value={draft.book}
                      availableGenres={genres}
                      selectedGenre={selectedBookGenre}
                      onSelectedGenreChange={handleSelectedBookGenreChange}
                      onNewGenre={handleOpenNewGenre}
                      onRemoveGenre={removeBookGenre}
                      onChange={(patch) =>
                        setDraft((current) => ({
                          ...current,
                          book: { ...current.book, ...patch },
                        }))
                      }
                    />
                  )}

                  {draft.contentType === 'stories' && (
                    <>
                      <div className="space-y-4">
                        <SectionTitle>Select Story Type</SectionTitle>
                        <StoryTypeSelector
                          value={draft.story.storyType}
                          options={storyTypes}
                          onChange={(storyType) =>
                            setDraft((current) => ({
                              ...current,
                              story: { ...current.story, storyType },
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setStoryTypeModalOpen(true)}
                          className="text-sm font-medium text-emerald-700 underline underline-offset-2"
                        >
                          + Add story type
                        </button>
                      </div>

                      <Divider />

                      <StoryForm
                        value={draft.story}
                        onChange={(patch) =>
                          setDraft((current) => ({
                            ...current,
                            story: { ...current.story, ...patch },
                          }))
                        }
                      />
                    </>
                  )}

                  {draft.contentType === 'painting' && (
                    <PaintingForm
                      value={draft.painting}
                      onChange={(patch) =>
                        setDraft((current) => ({
                          ...current,
                          painting: { ...current.painting, ...patch },
                        }))
                      }
                    />
                  )}

                  {draft.contentType === 'artifacts' && (
                    <ArtifactForm
                      value={draft.artifact}
                      onChange={(patch) =>
                        setDraft((current) => ({
                          ...current,
                          artifact: { ...current.artifact, ...patch },
                        }))
                      }
                    />
                  )}

                  {draft.contentType === 'bio' && (
                    <BioForm
                      value={draft.bio}
                      onChange={(patch) =>
                        setDraft((current) => ({
                          ...current,
                          bio: { ...current.bio, ...patch },
                        }))
                      }
                    />
                  )}

                  <Divider />

                  <ImageManager
                    contentItemId={savedContentItemId}
                    contentType={draft.contentType}
                    slugValue={draft.slug}
                    onSlugChange={handleSlugManualChange}
                    onUploaded={(mediaAssetId) => {
                      setPendingMediaAssetIds((current) =>
                        current.includes(mediaAssetId) ? current : [...current, mediaAssetId]
                      )
                      setDraft((current) => ({
                        ...current,
                        featuredImageId: mediaAssetId,
                      }))
                    }}
                  />

                  <Divider />

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setSeoOpen((current) => !current)}
                      className="flex items-center gap-3 text-left"
                    >
                      <span className="text-[20px] font-semibold text-neutral-900">SEO</span>
                      <span className="text-[18px] text-neutral-500">
                        {seoOpen ? '−' : '+'}
                      </span>
                    </button>

                    {!seoOpen ? (
                      <p className="text-sm text-neutral-600">
                        Hidden by default. SEO title and description are auto-filled unless you edit them.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <Input
                          value={draft.seoTitle}
                          onChange={(e) => {
                            setSeoTitleEditedManually(true)
                            setDraft((current) => ({ ...current, seoTitle: e.target.value }))
                          }}
                          placeholder="Meta Title"
                        />
                        <Textarea
                          rows={4}
                          value={draft.seoDescription}
                          onChange={(e) => {
                            setSeoDescriptionEditedManually(true)
                            setDraft((current) => ({
                              ...current,
                              seoDescription: e.target.value,
                            }))
                          }}
                          placeholder="Meta Description"
                        />
                      </div>
                    )}
                  </div>

                  <Divider />

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setPublishingSettingsOpen((current) => !current)}
                      className="flex items-center gap-3 text-left"
                    >
                      <span className="text-[20px] font-semibold text-neutral-900">
                        Publishing Settings
                      </span>
                      <span className="text-[18px] text-neutral-500">
                        {publishingSettingsOpen ? '−' : '+'}
                      </span>
                    </button>

                    {!publishingSettingsOpen ? (
                      <p className="text-sm text-neutral-600">
                        Hidden by default. Slug is auto-generated, sort order defaults to 100, featured image is blank unless set.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <Input
                          value={draft.slug}
                          onChange={(e) => handleSlugManualChange(e.target.value)}
                          placeholder="Slug"
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            value={draft.sortOrder}
                            onChange={(e) =>
                              setDraft((current) => ({ ...current, sortOrder: e.target.value }))
                            }
                            placeholder="Sort Order"
                          />
                          <Input
                            value={draft.featuredImageId}
                            onChange={(e) =>
                              setDraft((current) => ({
                                ...current,
                                featuredImageId: e.target.value,
                              }))
                            }
                            placeholder="Featured Image ID"
                          />
                        </div>

                        <div className="flex flex-wrap gap-8">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={draft.isFeatured}
                              onChange={(e) =>
                                setDraft((current) => ({
                                  ...current,
                                  isFeatured: e.target.checked,
                                }))
                              }
                            />
                            <span>Featured</span>
                          </label>

                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={draft.isPublished}
                              onChange={(e) =>
                                setDraft((current) => ({
                                  ...current,
                                  isPublished: e.target.checked,
                                }))
                              }
                            />
                            <span>Published</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="mx-auto flex min-h-[60vh] max-w-[920px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/70 p-10 text-center">
                <p className="text-lg text-neutral-600">
                  Select <span className="font-semibold text-neutral-900">ADD NEW</span> to begin creating content.
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-neutral-300 bg-white px-6 py-6 md:px-12 xl:px-16">
            <div className="mx-auto flex max-w-[920px] items-center justify-between gap-4">
              <button
                type="button"
                disabled={!showEditor}
                className="text-[18px] font-medium text-neutral-800 transition hover:text-neutral-600"
              >
                ARCHIVE
              </button>

              <div className="flex flex-wrap justify-end gap-4">
                <BlackButton
                  className="min-w-[140px]"
                  onClick={handleSave}
                  disabled={isPending || !showEditor}
                >
                  {isPending ? (mode === 'edit' ? 'UPDATING...' : 'SAVING...') : 'SAVE'}
                </BlackButton>
                <BlackButton className="min-w-[140px]" disabled={!showEditor}>
                  PREVIEW
                </BlackButton>
                <GreenButton className="min-w-[160px]" disabled={!showEditor}>
                  PUBLISH
                </GreenButton>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Toast open={toastOpen} message={toastMessage} tone={toastTone} />

      <Modal
        open={genreModalOpen}
        title="New Genre"
        onClose={() => setGenreModalOpen(false)}
      >
        <div className="space-y-4">
          <Input
            value={newGenreTitle}
            onChange={(e) => setNewGenreTitle(e.target.value)}
            placeholder="Genre name"
          />

          <div className="flex justify-end gap-3">
            <BlackButton onClick={() => setGenreModalOpen(false)}>
              CANCEL
            </BlackButton>
            <GreenButton onClick={handleCreateGenre} disabled={isCreatingGenre}>
              {isCreatingGenre ? 'CREATING...' : 'CONFIRM'}
            </GreenButton>
          </div>
        </div>
      </Modal>
      <Modal
        open={storyTypeModalOpen}
        title="New Story Type"
        onClose={() => setStoryTypeModalOpen(false)}
      >
        <div className="space-y-4">
          <Input
            value={newStoryTypeLabel}
            onChange={(e) => setNewStoryTypeLabel(e.target.value)}
            placeholder="Story type name"
          />

          <div className="flex justify-end gap-3">
            <BlackButton onClick={() => setStoryTypeModalOpen(false)}>CANCEL</BlackButton>
            <GreenButton onClick={handleCreateStoryType} disabled={isCreatingStoryType}>
              {isCreatingStoryType ? 'CREATING...' : 'CONFIRM'}
            </GreenButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
