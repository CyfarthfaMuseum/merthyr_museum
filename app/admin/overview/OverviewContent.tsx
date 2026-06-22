'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { createBookGenreAction, createStoryTypeAction, createArtifactCategoryAction, createPaintingMediumAction, createHistoricalPeriodAction, createHistoricalEraAction, saveContentAction, archiveContentAction } from './actions'
import { validateDraft } from './validation'
import { uiStrings, type UiLang } from './ui-strings'
import type {
  AudioItem,
  BookGenreOption,
  ConnectedItem,
  ContentType,
  EditorMode,
  OverviewDraft,
  SidebarBookGroup,
  SidebarCounts,
  SidebarStoryGroup,
  SidebarPaintingGroup,
  SidebarArtifactGroup,
  SidebarBio,
  SidebarLocation,
  StoryTypeOption,
  ArtifactCategoryOption,
  PaintingMediumOption,
  HistoricalPeriodOption,
  HistoricalEraOption,
  BookCyDraft,
  StoryCyDraft,
  PaintingCyDraft,
  ArtifactCyDraft,
  BioCyDraft,
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
import AudioGuide from './components/shared/AudioGuide'
import ConnectedContent from './components/shared/ConnectedContent'
import AdminUsersPanel from './components/AdminUsersPanel'
import LocationsPanel from './components/LocationsPanel'
import type { AdminUser } from './admin-users-actions'

type Props = {
  userEmail: string
  userId: string
  sidebarCounts: SidebarCounts
  sidebarBookGroups: SidebarBookGroup[]
  sidebarStoryGroups: SidebarStoryGroup[]
  sidebarPaintingGroups: SidebarPaintingGroup[]
  sidebarArtifactGroups: SidebarArtifactGroup[]
  sidebarBios: SidebarBio[]
  sidebarLocations: SidebarLocation[]
  initialDraft: OverviewDraft
  mode: EditorMode
  editId: string | null
  editType: ContentType | null
  availableBookGenres: BookGenreOption[]
  availableStoryTypes: StoryTypeOption[]
  availablePaintingMediums: PaintingMediumOption[]
  availableArtifactCategories: ArtifactCategoryOption[]
  availableHistoricalPeriods: HistoricalPeriodOption[]
  availableHistoricalEras: HistoricalEraOption[]
  showEditor: boolean
  adminUsers: AdminUser[]
  viewAdminUsers: boolean
  viewLocations: boolean
  initialUiLang?: UiLang
  initialImages: {
    id: string
    previewUrl: string
    fileName: string
    altText: string
    caption: string
    credit: string
    isPrimary: boolean
  }[]
  initialLocation: { address: string; lat: number; lng: number } | null
  initialAudio: AudioItem | null
  initialRelatedContent: ConnectedItem[]
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
  userId,
  sidebarCounts,
  sidebarBookGroups,
  sidebarStoryGroups,
  sidebarPaintingGroups,
  sidebarArtifactGroups,
  sidebarBios,
  sidebarLocations,
  initialDraft,
  mode,
  editId,
  availableBookGenres,
  availableStoryTypes,
  availablePaintingMediums,
  availableArtifactCategories,
  availableHistoricalPeriods,
  availableHistoricalEras,
  showEditor,
  initialImages,
  initialLocation,
  initialAudio,
  initialRelatedContent,
  adminUsers,
  viewAdminUsers,
  viewLocations,
  initialUiLang,
}: Props) {
  const [draft, setDraft] = useState<OverviewDraft>(initialDraft)
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'cy'>('en')
  const [uiLang, setUiLang] = useState<UiLang>(initialUiLang ?? 'en')
  const [genres, setGenres] = useState<BookGenreOption[]>(availableBookGenres)
  const [selectedBookGenre, setSelectedBookGenre] = useState('')
  const [isPending, startTransition] = useTransition()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [locations, setLocations] = useState(sidebarLocations)

  const [publishingSettingsOpen, setPublishingSettingsOpen] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)

  const [slugEditedManually, setSlugEditedManually] = useState(mode === 'edit')
  const [seoTitleEditedManually, setSeoTitleEditedManually] = useState(mode === 'edit')
  const [seoDescriptionEditedManually, setSeoDescriptionEditedManually] = useState(mode === 'edit')

  const [genreModalOpen, setGenreModalOpen] = useState(false)
  const [newGenreTitle, setNewGenreTitle] = useState('')
  const [newGenreTitleCy, setNewGenreTitleCy] = useState('')
  const [isCreatingGenre, startGenreTransition] = useTransition()
  const [storyTypes, setStoryTypes] = useState<StoryTypeOption[]>(availableStoryTypes)
  const [storyTypeModalOpen, setStoryTypeModalOpen] = useState(false)
  const [newStoryTypeLabel, setNewStoryTypeLabel] = useState('')
  const [newStoryTypeLabelCy, setNewStoryTypeLabelCy] = useState('')
  const [isCreatingStoryType, startStoryTypeTransition] = useTransition()

  const [paintingMediums, setPaintingMediums] = useState<PaintingMediumOption[]>(availablePaintingMediums)
  const [mediumModalOpen, setMediumModalOpen] = useState(false)
  const [newMediumLabel, setNewMediumLabel] = useState('')
  const [newMediumLabelCy, setNewMediumLabelCy] = useState('')
  const [isCreatingMedium, startMediumTransition] = useTransition()

  const [artifactCategories, setArtifactCategories] = useState<ArtifactCategoryOption[]>(availableArtifactCategories)
  const [artifactCategoryModalOpen, setArtifactCategoryModalOpen] = useState(false)
  const [newArtifactCategoryLabel, setNewArtifactCategoryLabel] = useState('')
  const [newArtifactCategoryLabelCy, setNewArtifactCategoryLabelCy] = useState('')
  const [isCreatingArtifactCategory, startArtifactCategoryTransition] = useTransition()

  const [historicalPeriods, setHistoricalPeriods] = useState<HistoricalPeriodOption[]>(availableHistoricalPeriods)
  const [historicalEras, setHistoricalEras] = useState<HistoricalEraOption[]>(availableHistoricalEras)
  const [periodModalOpen, setPeriodModalOpen] = useState(false)
  const [newPeriodName, setNewPeriodName] = useState('')
  const [newPeriodNameCy, setNewPeriodNameCy] = useState('')
  const [isCreatingPeriod, startPeriodTransition] = useTransition()
  const [eraModalOpen, setEraModalOpen] = useState(false)
  const [newEraName, setNewEraName] = useState('')
  const [newEraNameCy, setNewEraNameCy] = useState('')
  const [isCreatingEra, startEraTransition] = useTransition()

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastTone, setToastTone] = useState<'success' | 'error'>('success')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [savedContentItemId, setSavedContentItemId] = useState<string | null>(editId)
  const [pendingMediaAssetIds, setPendingMediaAssetIds] = useState<string[]>([])
  const [pendingAudioAssetId, setPendingAudioAssetId] = useState<string | null>(null)

  const t = uiStrings[uiLang]

  const editorIdentityRef = useRef<string | null>(null)

  useEffect(() => {
    const identity = `${mode}:${editId ?? 'new'}`
    if (editorIdentityRef.current === identity) return

    editorIdentityRef.current = identity
    setDraft(initialDraft)
    setActiveLanguage('en')
    setGenres(availableBookGenres)
    setStoryTypes(availableStoryTypes)
    setPaintingMediums(availablePaintingMediums)
    setArtifactCategories(availableArtifactCategories)
    setHistoricalPeriods(availableHistoricalPeriods)
    setHistoricalEras(availableHistoricalEras)
    setSlugEditedManually(mode === 'edit')
    setSeoTitleEditedManually(mode === 'edit')
    setSeoDescriptionEditedManually(mode === 'edit')
    setSavedContentItemId(editId)
    setPendingMediaAssetIds([])
    setPendingAudioAssetId(null)
  }, [initialDraft, availableBookGenres, availableStoryTypes, availablePaintingMediums, availableArtifactCategories, availableHistoricalPeriods, availableHistoricalEras, mode, editId])

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keeps existing generated draft metadata in sync with form fields.
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
    setNewGenreTitleCy('')
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
        titleCy: newGenreTitleCy.trim() || undefined,
        languageCode: 'en',
      })

      if (!result.success) {
        showToast(result.error ?? '', 'error')
        return
      }

      setGenres((current) => {
        if (current.some((g) => g.title === result.genreTitle)) return current
        const toAdd: BookGenreOption = { title: result.genreTitle, titleCy: result.genreTitleCy ?? undefined }
        return [...current, toAdd].sort((a, b) => a.title.localeCompare(b.title))
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
      const result = await createStoryTypeAction({ label, labelCy: newStoryTypeLabelCy.trim() || undefined })
      if (!result.success) {
        showToast(result.error ?? 'An error occurred.', 'error')
        return
      }

      if (result.storyType && result.storyType.code && result.storyType.label) {
        setStoryTypes((current) =>
          current.some((item) => item.code === result.storyType!.code)
            ? current
            : [...current, { code: result.storyType!.code, label: result.storyType!.label, labelCy: result.storyType!.labelCy }].sort((a, b) => a.label.localeCompare(b.label))
        )
        setDraft((current) => ({
          ...current,
          story: { ...current.story, storyType: result.storyType!.code },
        }))
      }
      setStoryTypeModalOpen(false)
      setNewStoryTypeLabel('')
      setNewStoryTypeLabelCy('')
      showToast(result.alreadyExisted ? 'Story type already existed.' : 'Story type created.', 'success')
    })
  }

  function handleCreateMedium() {
    const label = newMediumLabel.trim()
    if (!label) return

    startMediumTransition(async () => {
      const result = await createPaintingMediumAction({ label, labelCy: newMediumLabelCy.trim() || undefined })
      if (!result.success) {
        showToast(result.error ?? 'An error occurred.', 'error')
        return
      }

      if (result.medium && result.medium.code && result.medium.label) {
        setPaintingMediums((current) =>
          current.some((item) => item.code === result.medium!.code)
            ? current
            : [...current, { code: result.medium!.code, label: result.medium!.label, labelCy: result.medium!.labelCy }].sort((a, b) => a.label.localeCompare(b.label))
        )
        setDraft((current) => ({
          ...current,
          painting: { ...current.painting, medium: result.medium!.code },
        }))
      }
      setMediumModalOpen(false)
      setNewMediumLabel('')
      setNewMediumLabelCy('')
      showToast(result.alreadyExisted ? 'Medium already existed.' : 'Medium created.', 'success')
    })
  }

  function handleCreateArtifactCategory() {
    const label = newArtifactCategoryLabel.trim()
    if (!label) return

    startArtifactCategoryTransition(async () => {
      const result = await createArtifactCategoryAction({ label, labelCy: newArtifactCategoryLabelCy.trim() || undefined })
      if (!result.success) {
        showToast(result.error ?? 'An error occurred.', 'error')
        return
      }

      if (result.category && result.category.code && result.category.label) {
        setArtifactCategories((current) =>
          current.some((item) => item.code === result.category!.code)
            ? current
            : [...current, { code: result.category!.code, label: result.category!.label, labelCy: result.category!.labelCy }].sort((a, b) => a.label.localeCompare(b.label))
        )
        setDraft((current) => ({
          ...current,
          artifact: { ...current.artifact, categoryCode: result.category!.code },
        }))
      }
      setArtifactCategoryModalOpen(false)
      setNewArtifactCategoryLabel('')
      setNewArtifactCategoryLabelCy('')
      showToast(result.alreadyExisted ? 'Category already existed.' : 'Category created.', 'success')
    })
  }

  function handleCreatePeriod() {
    const name = newPeriodName.trim()
    if (!name) return

    startPeriodTransition(async () => {
      const result = await createHistoricalPeriodAction({ name, nameCy: newPeriodNameCy.trim() || undefined })
      if (!result.success) {
        showToast(result.error ?? 'An error occurred.', 'error')
        return
      }

      if (result.period) {
        setHistoricalPeriods((current) =>
          current.some((p) => p.id === result.period!.id)
            ? current
            : [...current, result.period!].sort((a, b) => a.name.localeCompare(b.name))
        )
        setDraft((current) => ({
          ...current,
          artifact: { ...current.artifact, periodId: result.period!.id },
        }))
      }
      setPeriodModalOpen(false)
      setNewPeriodName('')
      setNewPeriodNameCy('')
      showToast(result.alreadyExisted ? 'Period already existed.' : 'Period created.', 'success')
    })
  }

  function handleCreateEra() {
    const name = newEraName.trim()
    if (!name) return

    startEraTransition(async () => {
      const result = await createHistoricalEraAction({ name, nameCy: newEraNameCy.trim() || undefined })
      if (!result.success) {
        showToast(result.error ?? 'An error occurred.', 'error')
        return
      }

      if (result.era) {
        setHistoricalEras((current) =>
          current.some((e) => e.id === result.era!.id)
            ? current
            : [...current, result.era!].sort((a, b) => a.name.localeCompare(b.name))
        )
        setDraft((current) => ({
          ...current,
          artifact: { ...current.artifact, eraId: result.era!.id },
        }))
      }
      setEraModalOpen(false)
      setNewEraName('')
      setNewEraNameCy('')
      showToast(result.alreadyExisted ? 'Era already existed.' : 'Era created.', 'success')
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
        pendingMediaAssetIds,
        pendingAudioAssetId,
      })

      if (!result.success) {
        showToast(result.error, 'error')
        return
      }

      setSavedContentItemId(result.id)
      setPendingMediaAssetIds([])
      setPendingAudioAssetId(null)
      showToast(mode === 'edit' ? t.contentUpdated : t.contentSaved, 'success')
    })
  }

  function handleArchiveClick() {
    if (!savedContentItemId) {
      // Unsaved draft — just reset the form
      window.location.href = '/admin/overview'
      return
    }
    setArchiveModalOpen(true)
  }

  function handleConfirmArchive() {
    if (!savedContentItemId) return
    setArchiveModalOpen(false)
    startTransition(async () => {
      const result = await archiveContentAction(savedContentItemId)
      if (!result.success) {
        showToast(result.error, 'error')
        return
      }
      window.location.href = '/admin/overview'
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
        <span className="text-sm font-semibold">{t.menu}</span>
      </button>

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 border-x border-neutral-300 bg-white">
        <Sidebar
          userEmail={userEmail}
          counts={sidebarCounts}
          bookGroups={sidebarBookGroups}
          storyGroups={sidebarStoryGroups}
          paintingGroups={sidebarPaintingGroups}
          artifactGroups={sidebarArtifactGroups}
          bios={sidebarBios}
          sidebarLocations={locations}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((current) => !current)}
          selectedId={editId}
          adminUserCount={adminUsers.length}
          adminUsersActive={viewAdminUsers}
          locationsActive={viewLocations}
          uiLang={uiLang}
          onUiLangChange={setUiLang}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 md:px-12 xl:px-16">
            {viewLocations ? (
              <LocationsPanel
                initialLocations={locations}
                onLocationDeleted={(id) => setLocations((current) => current.filter((l) => l.id !== id))}
              />
            ) : viewAdminUsers ? (
              <AdminUsersPanel
                initialUsers={adminUsers}
                currentUserId={userId}
              />
            ) : showEditor ? (
              <>
                <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <img src="/content-icon.png" alt="" className="h-[24px] w-[24px]" />
                    <h1 className="text-[22px] font-semibold">
                      {mode === 'edit'
                        ? (
                            draft.contentType === 'book' ? draft.book.title
                            : draft.contentType === 'stories' ? draft.story.title
                            : draft.contentType === 'painting' ? draft.painting.title
                            : draft.contentType === 'artifacts' ? draft.artifact.title
                            : draft.contentType === 'bio' ? draft.bio.name
                            : t.editContent
                          ) || t.editContent
                        : t.newContent}
                    </h1>
                  </div>

                  <div className="inline-flex overflow-hidden rounded-lg border border-neutral-300 text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveLanguage('cy')}
                      className={`px-4 py-2 transition ${activeLanguage === 'cy' ? 'bg-[#147a4c] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      CY
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLanguage('en')}
                      className={`border-l border-neutral-300 px-4 py-2 transition ${activeLanguage === 'en' ? 'bg-[#147a4c] text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <div className="mx-auto max-w-[920px] space-y-8 pb-32">
                  <div className="space-y-4">
                    <SectionTitle>{t.selectContentType}</SectionTitle>
                    <ContentTypeSelector value={draft.contentType} onChange={updateContentType} uiLang={uiLang} />
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
                      language={activeLanguage}
                      cyValue={draft.bookCy}
                      onCyChange={(patch) =>
                        setDraft((current) => ({
                          ...current,
                          bookCy: { ...current.bookCy, ...patch },
                        }))
                      }
                      uiLang={uiLang}
                    />
                  )}

                  {draft.contentType === 'stories' && (
                    <>
                      <div className="space-y-4">
                        <SectionTitle>{t.selectStoryType}</SectionTitle>
                        <StoryTypeSelector
                          value={draft.story.storyType}
                          options={storyTypes.map((st) => ({
                            code: st.code,
                            label: uiLang === 'cy' ? (st.labelCy ?? st.label) : st.label,
                          }))}
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
                          {t.addStoryType}
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
                        language={activeLanguage}
                        cyValue={draft.storyCy}
                        onCyChange={(patch) =>
                          setDraft((current) => ({
                            ...current,
                            storyCy: { ...current.storyCy, ...patch },
                          }))
                        }
                        uiLang={uiLang}
                      />
                    </>
                  )}

                  {draft.contentType === 'painting' && (
                    <>
                      <div className="space-y-4">
                        <SectionTitle>{t.selectMedium}</SectionTitle>
                        <StoryTypeSelector
                          value={draft.painting.medium}
                          options={paintingMediums.map((m) => ({ code: m.code, label: uiLang === 'cy' ? (m.labelCy ?? m.label) : m.label }))}
                          onChange={(medium) =>
                            setDraft((current) => ({
                              ...current,
                              painting: { ...current.painting, medium },
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setMediumModalOpen(true)}
                          className="text-sm font-medium text-emerald-700 underline underline-offset-2"
                        >
                          {t.addMedium}
                        </button>
                      </div>

                      <Divider />

                      <PaintingForm
                        value={draft.painting}
                        onChange={(patch) =>
                          setDraft((current) => ({
                            ...current,
                            painting: { ...current.painting, ...patch },
                          }))
                        }
                        language={activeLanguage}
                        cyValue={draft.paintingCy}
                        onCyChange={(patch) =>
                          setDraft((current) => ({
                            ...current,
                            paintingCy: { ...current.paintingCy, ...patch },
                          }))
                        }
                        uiLang={uiLang}
                      />
                    </>
                  )}

                  {draft.contentType === 'artifacts' && (
                    <>
                      <div className="space-y-4">
                        <SectionTitle>{t.selectCategory}</SectionTitle>
                        <StoryTypeSelector
                          value={draft.artifact.categoryCode}
                          options={artifactCategories.map((cat) => ({
                            code: cat.code,
                            label: uiLang === 'cy' ? (cat.labelCy ?? cat.label) : cat.label,
                          }))}
                          onChange={(categoryCode) =>
                            setDraft((current) => ({
                              ...current,
                              artifact: { ...current.artifact, categoryCode },
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setArtifactCategoryModalOpen(true)}
                          className="text-sm font-medium text-emerald-700 underline underline-offset-2"
                        >
                          {t.addCategory}
                        </button>
                      </div>

                      <Divider />

                      <ArtifactForm
                        value={draft.artifact}
                        onChange={(patch) =>
                          setDraft((current) => ({
                            ...current,
                            artifact: { ...current.artifact, ...patch },
                          }))
                        }
                        language={activeLanguage}
                        cyValue={draft.artifactCy}
                        onCyChange={(patch) =>
                          setDraft((current) => ({
                            ...current,
                            artifactCy: { ...current.artifactCy, ...patch },
                          }))
                        }
                        uiLang={uiLang}
                        availableHistoricalPeriods={historicalPeriods}
                        availableHistoricalEras={historicalEras}
                        onAddPeriod={() => setPeriodModalOpen(true)}
                        onAddEra={() => setEraModalOpen(true)}
                      />
                    </>
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
                      language={activeLanguage}
                      cyValue={draft.bioCy}
                      onCyChange={(patch) =>
                        setDraft((current) => ({
                          ...current,
                          bioCy: { ...current.bioCy, ...patch },
                        }))
                      }
                      uiLang={uiLang}
                    />
                  )}

                  <Divider />

                  <ImageManager
                    key={editId ?? savedContentItemId ?? `draft-${draft.contentType}`}
                    contentItemId={savedContentItemId}
                    contentType={draft.contentType}
                    slugValue={draft.slug}
                    onSlugChange={handleSlugManualChange}
                    initialImages={initialImages}
                    initialLocation={initialLocation}
                    sidebarLocations={locations}
                    uiLang={uiLang}
                    onLocationSaved={(newLoc) => {
                      setLocations((current) => {
                        const exists = current.some((l) => l.id === newLoc.id)
                        return exists
                          ? current.map((l) => l.id === newLoc.id ? { ...l, ...newLoc, isAssigned: true } : l)
                          : [...current, { ...newLoc, isAssigned: true }]
                      })
                    }}
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

                  <AudioGuide
                    key={`audio-${editId ?? savedContentItemId ?? `draft-${draft.contentType}`}`}
                    contentItemId={savedContentItemId}
                    contentType={draft.contentType}
                    initialAudio={initialAudio}
                    onError={(msg) => showToast(msg, 'error')}
                    onUploaded={(id) => setPendingAudioAssetId(id)}
                    uiLang={uiLang}
                  />

                  <Divider />

                  <ConnectedContent
                    key={`connected-${editId ?? savedContentItemId ?? `draft-${draft.contentType}`}`}
                    contentItemId={savedContentItemId}
                    contentType={draft.contentType}
                    initialConnected={initialRelatedContent}
                    onError={(msg) => showToast(msg, 'error')}
                    uiLang={uiLang}
                  />

                  <Divider />

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setSeoOpen((current) => !current)}
                      className="flex items-center gap-3 text-left"
                    >
                      <span className="text-[20px] font-semibold text-neutral-900">{t.seo}</span>
                      <span className="text-[18px] text-neutral-500">
                        {seoOpen ? '−' : '+'}
                      </span>
                    </button>

                    {!seoOpen ? (
                      <p className="text-sm text-neutral-600">
                        {t.seoHint}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <Input
                          value={activeLanguage === 'cy' ? draft.seoTitleCy : draft.seoTitle}
                          onChange={(e) => {
                            if (activeLanguage === 'cy') {
                              setDraft((current) => ({ ...current, seoTitleCy: e.target.value }))
                            } else {
                              setSeoTitleEditedManually(true)
                              setDraft((current) => ({ ...current, seoTitle: e.target.value }))
                            }
                          }}
                          placeholder={activeLanguage === 'cy' ? 'Meta Title (Welsh)' : 'Meta Title'}
                        />
                        <Textarea
                          rows={4}
                          value={activeLanguage === 'cy' ? draft.seoDescriptionCy : draft.seoDescription}
                          onChange={(e) => {
                            if (activeLanguage === 'cy') {
                              setDraft((current) => ({
                                ...current,
                                seoDescriptionCy: e.target.value,
                              }))
                            } else {
                              setSeoDescriptionEditedManually(true)
                              setDraft((current) => ({
                                ...current,
                                seoDescription: e.target.value,
                              }))
                            }
                          }}
                          placeholder={activeLanguage === 'cy' ? 'Meta Description (Welsh)' : 'Meta Description'}
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
                        {t.publishingSettings}
                      </span>
                      <span className="text-[18px] text-neutral-500">
                        {publishingSettingsOpen ? '−' : '+'}
                      </span>
                    </button>

                    {!publishingSettingsOpen ? (
                      <p className="text-sm text-neutral-600">
                        {t.publishingHint}
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
                            <span>{t.featured}</span>
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
                            <span>{t.published}</span>
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
                  {uiLang === 'en'
                    ? <>Select <span className="font-semibold text-neutral-900">ADD NEW</span> to begin creating content.</>
                    : <>Dewiswch <span className="font-semibold text-neutral-900">YCHWANEGU NEWYDD</span> i ddechrau creu cynnwys.</>
                  }
                </p>
              </div>
            )}
          </div>
          {!viewAdminUsers && !viewLocations && (
          <div className="shrink-0 border-t border-neutral-300 bg-white px-6 py-6 md:px-12 xl:px-16">
            <div className="mx-auto flex max-w-[920px] items-center justify-between gap-4">
              <button
                type="button"
                disabled={!showEditor || isPending}
                onClick={handleArchiveClick}
                className="text-[18px] font-medium text-neutral-800 transition hover:text-red-600 disabled:opacity-40"
              >
                {t.archive}
              </button>

              <div className="flex flex-wrap justify-end gap-4">
                <BlackButton
                  className="min-w-[140px]"
                  onClick={handleSave}
                  disabled={isPending || !showEditor}
                >
                  {isPending ? (mode === 'edit' ? t.updating : t.saving) : t.save}
                </BlackButton>
                <BlackButton className="min-w-[140px]" disabled={!showEditor} onClick={() => setPreviewModalOpen(true)}>
                  {t.preview}
                </BlackButton>
                <GreenButton className="min-w-[160px]" disabled={!showEditor} onClick={() => setPublishModalOpen(true)}>
                  {t.publish}
                </GreenButton>
              </div>
            </div>
          </div>
          )}
        </main>
      </div>

      <Toast open={toastOpen} message={toastMessage} tone={toastTone} />

      <Modal open={previewModalOpen} title={t.previewTitle} onClose={() => setPreviewModalOpen(false)}>
        <p className="text-neutral-700">{t.previewBody}</p>
        <div className="mt-6 flex justify-end">
          <BlackButton onClick={() => setPreviewModalOpen(false)}>{t.close}</BlackButton>
        </div>
      </Modal>

      <Modal open={publishModalOpen} title={t.publishTitle} onClose={() => setPublishModalOpen(false)}>
        <p className="text-neutral-700">{t.publishBody}</p>
        <div className="mt-6 flex justify-end">
          <BlackButton onClick={() => setPublishModalOpen(false)}>{t.close}</BlackButton>
        </div>
      </Modal>

      <Modal open={archiveModalOpen} title={t.archiveTitle} onClose={() => setArchiveModalOpen(false)}>
        <p className="text-neutral-700">{t.archiveBody}</p>
        <div className="mt-6 flex justify-end gap-3">
          <BlackButton onClick={() => setArchiveModalOpen(false)}>{t.cancel}</BlackButton>
          <BlackButton className="bg-red-600 hover:bg-red-700" onClick={handleConfirmArchive} disabled={isPending}>{t.confirmArchive}</BlackButton>
        </div>
      </Modal>

      <Modal
        open={genreModalOpen}
        title={t.newGenreTitle}
        onClose={() => { setGenreModalOpen(false); setNewGenreTitle(''); setNewGenreTitleCy('') }}
      >
        <div className="space-y-4">
          {uiLang === 'cy' ? (
            <>
              <Input
                value={newGenreTitleCy}
                onChange={(e) => setNewGenreTitleCy(e.target.value)}
                placeholder={t.genrePlaceholderCy}
              />
              <Input
                value={newGenreTitle}
                onChange={(e) => setNewGenreTitle(e.target.value)}
                placeholder={t.genrePlaceholderEn}
              />
            </>
          ) : (
            <>
              <Input
                value={newGenreTitle}
                onChange={(e) => setNewGenreTitle(e.target.value)}
                placeholder={t.genrePlaceholderEn}
              />
              <Input
                value={newGenreTitleCy}
                onChange={(e) => setNewGenreTitleCy(e.target.value)}
                placeholder={t.genrePlaceholderCy}
              />
            </>
          )}

          <div className="flex justify-end gap-3">
            <BlackButton onClick={() => { setGenreModalOpen(false); setNewGenreTitle(''); setNewGenreTitleCy('') }}>
              {t.cancel}
            </BlackButton>
            <GreenButton onClick={handleCreateGenre} disabled={isCreatingGenre}>
              {isCreatingGenre ? t.creating : t.confirm}
            </GreenButton>
          </div>
        </div>
      </Modal>
      <Modal
        open={storyTypeModalOpen}
        title={t.newStoryTypeTitle}
        onClose={() => { setStoryTypeModalOpen(false); setNewStoryTypeLabel(''); setNewStoryTypeLabelCy('') }}
      >
        <div className="space-y-4">
          {uiLang === 'cy' ? (
            <>
              <Input
                value={newStoryTypeLabelCy}
                onChange={(e) => setNewStoryTypeLabelCy(e.target.value)}
                placeholder={t.storyTypePlaceholderCy}
              />
              <Input
                value={newStoryTypeLabel}
                onChange={(e) => setNewStoryTypeLabel(e.target.value)}
                placeholder={t.storyTypePlaceholderEn}
              />
            </>
          ) : (
            <>
              <Input
                value={newStoryTypeLabel}
                onChange={(e) => setNewStoryTypeLabel(e.target.value)}
                placeholder={t.storyTypePlaceholderEn}
              />
              <Input
                value={newStoryTypeLabelCy}
                onChange={(e) => setNewStoryTypeLabelCy(e.target.value)}
                placeholder={t.storyTypePlaceholderCy}
              />
            </>
          )}

          <div className="flex justify-end gap-3">
            <BlackButton onClick={() => { setStoryTypeModalOpen(false); setNewStoryTypeLabel(''); setNewStoryTypeLabelCy('') }}>{t.cancel}</BlackButton>
            <GreenButton onClick={handleCreateStoryType} disabled={isCreatingStoryType}>
              {isCreatingStoryType ? t.creating : t.confirm}
            </GreenButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={mediumModalOpen}
        title={t.newMediumTitle}
        onClose={() => { setMediumModalOpen(false); setNewMediumLabel(''); setNewMediumLabelCy('') }}
      >
        <div className="space-y-4">
          {uiLang === 'cy' ? (
            <>
              <Input
                value={newMediumLabelCy}
                onChange={(e) => setNewMediumLabelCy(e.target.value)}
                placeholder={t.mediumPlaceholderCy}
              />
              <Input
                value={newMediumLabel}
                onChange={(e) => setNewMediumLabel(e.target.value)}
                placeholder={t.mediumPlaceholderEn}
              />
            </>
          ) : (
            <>
              <Input
                value={newMediumLabel}
                onChange={(e) => setNewMediumLabel(e.target.value)}
                placeholder={t.mediumPlaceholderEn}
              />
              <Input
                value={newMediumLabelCy}
                onChange={(e) => setNewMediumLabelCy(e.target.value)}
                placeholder={t.mediumPlaceholderCy}
              />
            </>
          )}

          <div className="flex justify-end gap-3">
            <BlackButton onClick={() => { setMediumModalOpen(false); setNewMediumLabel(''); setNewMediumLabelCy('') }}>{t.cancel}</BlackButton>
            <GreenButton onClick={handleCreateMedium} disabled={isCreatingMedium}>
              {isCreatingMedium ? t.creating : t.confirm}
            </GreenButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={artifactCategoryModalOpen}
        title={t.newCategoryTitle}
        onClose={() => { setArtifactCategoryModalOpen(false); setNewArtifactCategoryLabel(''); setNewArtifactCategoryLabelCy('') }}
      >
        <div className="space-y-4">
          {uiLang === 'cy' ? (
            <>
              <Input
                value={newArtifactCategoryLabelCy}
                onChange={(e) => setNewArtifactCategoryLabelCy(e.target.value)}
                placeholder={t.categoryPlaceholderCy}
              />
              <Input
                value={newArtifactCategoryLabel}
                onChange={(e) => setNewArtifactCategoryLabel(e.target.value)}
                placeholder={t.categoryPlaceholderEn}
              />
            </>
          ) : (
            <>
              <Input
                value={newArtifactCategoryLabel}
                onChange={(e) => setNewArtifactCategoryLabel(e.target.value)}
                placeholder={t.categoryPlaceholderEn}
              />
              <Input
                value={newArtifactCategoryLabelCy}
                onChange={(e) => setNewArtifactCategoryLabelCy(e.target.value)}
                placeholder={t.categoryPlaceholderCy}
              />
            </>
          )}

          <div className="flex justify-end gap-3">
            <BlackButton onClick={() => { setArtifactCategoryModalOpen(false); setNewArtifactCategoryLabel(''); setNewArtifactCategoryLabelCy('') }}>{t.cancel}</BlackButton>
            <GreenButton onClick={handleCreateArtifactCategory} disabled={isCreatingArtifactCategory}>
              {isCreatingArtifactCategory ? t.creating : t.confirm}
            </GreenButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={periodModalOpen}
        title={t.newPeriodTitle}
        onClose={() => { setPeriodModalOpen(false); setNewPeriodName(''); setNewPeriodNameCy('') }}
      >
        <div className="space-y-4">
          {uiLang === 'cy' ? (
            <>
              <Input value={newPeriodNameCy} onChange={(e) => setNewPeriodNameCy(e.target.value)} placeholder={t.periodNamePlaceholder} />
              <Input value={newPeriodName} onChange={(e) => setNewPeriodName(e.target.value)} placeholder={`${t.periodNamePlaceholder} (English)`} />
            </>
          ) : (
            <>
              <Input value={newPeriodName} onChange={(e) => setNewPeriodName(e.target.value)} placeholder={`${t.periodNamePlaceholder} (English)`} />
              <Input value={newPeriodNameCy} onChange={(e) => setNewPeriodNameCy(e.target.value)} placeholder={`${t.periodNamePlaceholder} (Welsh)`} />
            </>
          )}
          <div className="flex justify-end gap-3">
            <BlackButton onClick={() => { setPeriodModalOpen(false); setNewPeriodName(''); setNewPeriodNameCy('') }}>{t.cancel}</BlackButton>
            <GreenButton onClick={handleCreatePeriod} disabled={isCreatingPeriod}>
              {isCreatingPeriod ? t.creating : t.confirm}
            </GreenButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={eraModalOpen}
        title={t.newEraTitle}
        onClose={() => { setEraModalOpen(false); setNewEraName(''); setNewEraNameCy('') }}
      >
        <div className="space-y-4">
          {uiLang === 'cy' ? (
            <>
              <Input value={newEraNameCy} onChange={(e) => setNewEraNameCy(e.target.value)} placeholder={t.eraNamePlaceholder} />
              <Input value={newEraName} onChange={(e) => setNewEraName(e.target.value)} placeholder={`${t.eraNamePlaceholder} (English)`} />
            </>
          ) : (
            <>
              <Input value={newEraName} onChange={(e) => setNewEraName(e.target.value)} placeholder={`${t.eraNamePlaceholder} (English)`} />
              <Input value={newEraNameCy} onChange={(e) => setNewEraNameCy(e.target.value)} placeholder={`${t.eraNamePlaceholder} (Welsh)`} />
            </>
          )}
          <div className="flex justify-end gap-3">
            <BlackButton onClick={() => { setEraModalOpen(false); setNewEraName(''); setNewEraNameCy('') }}>{t.cancel}</BlackButton>
            <GreenButton onClick={handleCreateEra} disabled={isCreatingEra}>
              {isCreatingEra ? t.creating : t.confirm}
            </GreenButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
