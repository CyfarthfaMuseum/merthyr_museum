import { redirect } from 'next/navigation'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { getStorageClient } from '@/lib/r2'
import OverviewContent from './OverviewContent'
import {
  initialDraft,
  type AudioItem,
  type ArtifactCategoryOption,
  type PaintingMediumOption,
  type BookGenreOption,
  type ConnectedItem,
  type ContentType,
  type EditorMode,
  type HistoricalPeriodOption,
  type HistoricalEraOption,
  type SidebarBookGroup,
  type SidebarStoryGroup,
  type SidebarPaintingGroup,
  type SidebarArtifactGroup,
  type SidebarBio,
  type SidebarLocation,
  type OverviewDraft,
  type SidebarCounts,
  type StoryTypeOption,
} from './types'
import type { AdminUser } from './admin-users-actions'

type PageProps = {
  searchParams?: Promise<{
    type?: string
    id?: string
    new?: string
    view?: string
    lang?: string
  }>
}

const CONTENT_TYPE_UI_TO_DB: Record<string, ContentType> = {
  book: 'book',
  stories: 'stories',
  painting: 'painting',
  artifacts: 'artifacts',
  bio: 'bio',
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

async function resolvePreviewUrl(storagePath: string | null | undefined): Promise<string> {
  const rawValue = (storagePath ?? '').trim()
  if (!rawValue) {
    return ''
  }

  if (isAbsoluteUrl(rawValue)) {
    return rawValue
  }

  const normalizedPath = rawValue.replace(/^\/+/, '')
  if (!normalizedPath) {
    return ''
  }

  const bucket = process.env.STORAGE_BUCKET_NAME
  if (!bucket) {
    return ''
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: normalizedPath,
    })
    return await getSignedUrl(getStorageClient(), command, { expiresIn: 60 * 15 })
  } catch {
    return ''
  }
}

async function getContentTypeIds(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.from('content_types').select('id, code')

  if (error) {
    throw new Error(error.message)
  }

  const map = new Map<string, number>()
  for (const row of data ?? []) {
    map.set(row.code, row.id)
  }

  return map
}

async function getSidebarCounts(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SidebarCounts> {
  const emptyCountResult = { count: 0 }
  const typeIds = await getContentTypeIds(supabase)

  const bookTypeId = typeIds.get('book')
  const storyTypeId = typeIds.get('story')
  const paintingTypeId = typeIds.get('painting')
  const artefactTypeId = typeIds.get('artefact')
  const biographyTypeId = typeIds.get('biography')

  const [
    booksResult,
    storiesResult,
    paintingsResult,
    artefactsResult,
    biographiesResult,
  ] = await Promise.all([
    bookTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', bookTypeId)
      : Promise.resolve(emptyCountResult),
    storyTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', storyTypeId)
      : Promise.resolve(emptyCountResult),
    paintingTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', paintingTypeId)
      : Promise.resolve(emptyCountResult),
    artefactTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', artefactTypeId)
      : Promise.resolve(emptyCountResult),
    biographyTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', biographyTypeId)
      : Promise.resolve(emptyCountResult),
  ])

  const books = booksResult.count ?? 0
  const stories = storiesResult.count ?? 0
  const paintings = paintingsResult.count ?? 0
  const artifacts = artefactsResult.count ?? 0
  const biographies = biographiesResult.count ?? 0

  return {
    totalContent: books + stories + paintings + artifacts + biographies,
    books,
    stories,
    paintings,
    artifacts,
    biographies,
  }
}

async function getSidebarBookGroups(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SidebarBookGroup[]> {
  const adminSupabase = createAdminClient()
  const typeIds = await getContentTypeIds(supabase)
  const bookTypeId = typeIds.get('book')

  if (!bookTypeId) return []

  const { data: bookItems } = await supabase
    .from('content_items')
    .select('id')
    .eq('content_type_id', bookTypeId)

  const bookIds = (bookItems ?? []).map((book) => book.id)
  if (bookIds.length === 0) return []

  const [{ data: translations }, { data: genreLinks }, { data: genreTranslations }, { data: genreTranslationsCy }] =
    await Promise.all([
      supabase
        .from('content_item_translations')
        .select('content_item_id, title')
        .eq('language_code', 'en')
        .in('content_item_id', bookIds),
      adminSupabase
        .from('book_theme_books')
        .select('book_content_item_id, book_theme_id')
        .in('book_content_item_id', bookIds),
      adminSupabase
        .from('book_theme_translations')
        .select('book_theme_id, title')
        .eq('language_code', 'en'),
      adminSupabase
        .from('book_theme_translations')
        .select('book_theme_id, title')
        .eq('language_code', 'cy'),
    ])

  const titleByBookId = new Map<string, string>(
    (translations ?? [])
      .filter((row) => row.title)
      .map((row) => [row.content_item_id as string, row.title as string])
  )

  const genreById = new Map<string, string>(
    (genreTranslations ?? [])
      .filter((row) => row.title)
      .map((row) => [String(row.book_theme_id), row.title as string])
  )

  const genreCyById = new Map<string, string>(
    (genreTranslationsCy ?? [])
      .filter((row) => row.title)
      .map((row) => [String(row.book_theme_id), row.title as string])
  )

  const genresByBookId = new Map<string, string[]>()
  for (const link of genreLinks ?? []) {
    const genreTitle = genreById.get(String(link.book_theme_id))
    if (!genreTitle) continue
    const current = genresByBookId.get(link.book_content_item_id) ?? []
    if (!current.includes(genreTitle)) {
      genresByBookId.set(link.book_content_item_id, [...current, genreTitle])
    }
  }

  // Map EN genre title → CY genre title
  const genreCyByEnGenre = new Map<string, string>()
  for (const link of genreLinks ?? []) {
    const enTitle = genreById.get(String(link.book_theme_id))
    const cyTitle = genreCyById.get(String(link.book_theme_id))
    if (enTitle && cyTitle) genreCyByEnGenre.set(enTitle, cyTitle)
  }

  const grouped = new Map<string, SidebarBookGroup['books']>()
  for (const bookId of bookIds) {
    const title = titleByBookId.get(bookId) ?? 'Untitled book'
    const genres = genresByBookId.get(bookId) ?? []
    const targetGenres = genres.length > 0 ? genres : ['Uncategorised']

    for (const genre of targetGenres) {
      const current = grouped.get(genre) ?? []
      grouped.set(genre, [...current, { id: bookId, title, genres }])
    }
  }

  return [...grouped.entries()]
    .map(([genre, books]) => ({
      genre,
      genreCy: genreCyByEnGenre.get(genre) ?? (genre === 'Uncategorised' ? 'Heb gategori' : undefined),
      books: [...books].sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.genre.localeCompare(b.genre))
}


async function getSidebarStoryGroups(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SidebarStoryGroup[]> {
  const adminSupabase = createAdminClient()
  const typeIds = await getContentTypeIds(supabase)
  const storyContentTypeId = typeIds.get('story')

  if (!storyContentTypeId) return []

  const { data: storyItems } = await supabase
    .from('content_items')
    .select('id')
    .eq('content_type_id', storyContentTypeId)

  const storyIds = (storyItems ?? []).map((story) => story.id)
  if (storyIds.length === 0) return []

  const [
    { data: translations },
    { data: stories },
    { data: storyTypes },
    { data: storyTypeTranslations },
    { data: storyTypeTranslationsCy },
  ] = await Promise.all([
    supabase
      .from('content_item_translations')
      .select('content_item_id, title')
      .eq('language_code', 'en')
      .in('content_item_id', storyIds),
    supabase
      .from('stories')
      .select('content_item_id, story_type_id')
      .in('content_item_id', storyIds),
    adminSupabase
      .from('story_types')
      .select('id, code, sort_order'),
    adminSupabase
      .from('story_type_translations')
      .select('story_type_id, label')
      .eq('language_code', 'en'),
    adminSupabase
      .from('story_type_translations')
      .select('story_type_id, label')
      .eq('language_code', 'cy'),
  ])

  const titleByStoryId = new Map<string, string>(
    (translations ?? [])
      .filter((row) => row.title)
      .map((row) => [row.content_item_id as string, row.title as string])
  )

  const storyTypeById = new Map(
    (storyTypes ?? []).map((row) => [
      String(row.id),
      {
        code: (row.code as string | null) ?? String(row.id),
        sortOrder: (row.sort_order as number | null) ?? 0,
      },
    ])
  )

  const storyTypeLabelById = new Map<string, string>(
    (storyTypeTranslations ?? [])
      .filter((row) => row.label)
      .map((row) => [String(row.story_type_id), row.label as string])
  )

  const storyTypeLabelCyById = new Map<string, string>(
    (storyTypeTranslationsCy ?? [])
      .filter((row) => row.label)
      .map((row) => [String(row.story_type_id), row.label as string])
  )

  const grouped = new Map<
    string,
    {
      storyTypeCode: string
      storyTypeLabel: string
      storyTypeLabelCy?: string
      sortOrder: number
      stories: SidebarStoryGroup['stories']
    }
  >()

  const storyTypeIdByStoryId = new Map<string, string>(
    (stories ?? []).map((row) => [row.content_item_id as string, String(row.story_type_id)])
  )

  for (const storyId of storyIds) {
    const storyTypeId = storyTypeIdByStoryId.get(storyId) ?? ''
    const storyType = storyTypeById.get(storyTypeId)
    const storyTypeCode = storyType?.code ?? 'uncategorised'
    const storyTypeLabel = storyTypeLabelById.get(storyTypeId) ?? (storyTypeCode === 'uncategorised' ? 'Uncategorised' : storyTypeCode)
    const storyTypeLabelCy = storyTypeLabelCyById.get(storyTypeId)
    const current = grouped.get(storyTypeCode) ?? {
      storyTypeCode,
      storyTypeLabel,
      storyTypeLabelCy,
      sortOrder: storyType?.sortOrder ?? Number.MAX_SAFE_INTEGER,
      stories: [],
    }

    grouped.set(storyTypeCode, {
      ...current,
      stories: [
        ...current.stories,
        {
          id: storyId,
          title: titleByStoryId.get(storyId) ?? 'Untitled story',
          storyTypeCode,
          storyTypeLabel,
          storyTypeLabelCy,
        },
      ],
    })
  }

  return [...grouped.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.storyTypeLabel.localeCompare(b.storyTypeLabel))
    .map((group) => ({
      storyTypeCode: group.storyTypeCode,
      storyTypeLabel: group.storyTypeLabel,
      storyTypeLabelCy: group.storyTypeLabelCy,
      stories: [...group.stories].sort((a, b) => a.title.localeCompare(b.title)),
    }))
}

async function getAvailableBookGenres(): Promise<BookGenreOption[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('book_theme_translations')
    .select('book_theme_id, language_code, title')
    .in('language_code', ['en', 'cy'])

  if (error) {
    return []
  }

  const byTheme = new Map<string, { title?: string; titleCy?: string }>()
  for (const row of data ?? []) {
    if (!row.title) continue
    const id = String(row.book_theme_id)
    const current = byTheme.get(id) ?? {}
    if (row.language_code === 'en') byTheme.set(id, { ...current, title: row.title })
    else if (row.language_code === 'cy') byTheme.set(id, { ...current, titleCy: row.title })
  }

  return [...byTheme.values()]
    .filter((g): g is { title: string; titleCy?: string } => !!g.title)
    .map((g) => ({ title: g.title, titleCy: g.titleCy }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

async function getAvailablePaintingMediums(): Promise<PaintingMediumOption[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('painting_mediums')
    .select(
      `
      code,
      sort_order,
      painting_medium_translations (
        language_code,
        label
      )
    `
    )
    .order('sort_order', { ascending: true })

  if (error) return []

  return (data ?? [])
    .filter((row) => row.code)
    .map((row) => {
      const translations = Array.isArray(row.painting_medium_translations)
        ? row.painting_medium_translations
        : []
      const enTranslation =
        translations.find((item) => item.language_code === 'en') ?? translations[0]
      const cyTranslation = translations.find((item) => item.language_code === 'cy')

      return {
        code: row.code as string,
        label: enTranslation?.label ?? (row.code as string),
        labelCy: cyTranslation?.label ?? undefined,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

async function getAvailableArtifactCategories(): Promise<ArtifactCategoryOption[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('artefact_categories')
    .select(
      `
      code,
      sort_order,
      artefact_category_translations (
        language_code,
        label
      )
    `
    )
    .order('sort_order', { ascending: true })

  if (error) return []

  return (data ?? [])
    .filter((row) => row.code)
    .map((row) => {
      const translations = Array.isArray(row.artefact_category_translations)
        ? row.artefact_category_translations
        : []
      const enTranslation =
        translations.find((item) => item.language_code === 'en') ?? translations[0]
      const cyTranslation = translations.find((item) => item.language_code === 'cy')

      return {
        code: row.code as string,
        label: enTranslation?.label ?? (row.code as string),
        labelCy: cyTranslation?.label ?? undefined,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

async function getAvailableHistoricalPeriods(): Promise<HistoricalPeriodOption[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('historical_periods')
    .select(
      `
      id,
      historical_period_translations (
        language_code,
        name
      )
    `
    )

  if (error) return []

  return (data ?? [])
    .map((row) => {
      const translations = Array.isArray(row.historical_period_translations)
        ? row.historical_period_translations
        : []
      const translation =
        translations.find((t) => t.language_code === 'en') ?? translations[0]
      return { id: row.id as string, name: (translation?.name as string | null) ?? '' }
    })
    .filter((p) => p.name)
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function getAvailableHistoricalEras(): Promise<HistoricalEraOption[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('historical_eras')
    .select(
      `
      id,
      historical_era_translations (
        language_code,
        name
      )
    `
    )

  if (error) return []

  return (data ?? [])
    .map((row) => {
      const translations = Array.isArray(row.historical_era_translations)
        ? row.historical_era_translations
        : []
      const translation =
        translations.find((t) => t.language_code === 'en') ?? translations[0]
      return { id: row.id as string, name: (translation?.name as string | null) ?? '' }
    })
    .filter((e) => e.name)
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function getSidebarPaintingGroups(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SidebarPaintingGroup[]> {
  const typeIds = await getContentTypeIds(supabase)
  const paintingTypeId = typeIds.get('painting')
  if (!paintingTypeId) return []

  const { data: paintingItems } = await supabase
    .from('content_items')
    .select('id')
    .eq('content_type_id', paintingTypeId)

  const paintingIds = (paintingItems ?? []).map((p) => p.id)
  if (paintingIds.length === 0) return []

  const adminSupabase = createAdminClient()

  const [{ data: translations }, { data: paintings }, { data: mediumTranslations }, { data: mediumTranslationsCy }] = await Promise.all([
    supabase
      .from('content_item_translations')
      .select('content_item_id, title')
      .eq('language_code', 'en')
      .in('content_item_id', paintingIds),
    supabase
      .from('paintings')
      .select('content_item_id, painting_medium_id')
      .in('content_item_id', paintingIds),
    adminSupabase
      .from('painting_medium_translations')
      .select('painting_medium_id, label')
      .eq('language_code', 'en'),
    adminSupabase
      .from('painting_medium_translations')
      .select('painting_medium_id, label')
      .eq('language_code', 'cy'),
  ])

  const titleById = new Map<string, string>(
    (translations ?? []).filter((r) => r.title).map((r) => [r.content_item_id as string, r.title as string])
  )

  const mediumLabelById = new Map<string, string>(
    (mediumTranslations ?? [])
      .filter((r) => r.label)
      .map((r) => [String(r.painting_medium_id), r.label as string])
  )

  const mediumLabelCyById = new Map<string, string>(
    (mediumTranslationsCy ?? [])
      .filter((r) => r.label)
      .map((r) => [String(r.painting_medium_id), r.label as string])
  )

  const mediumIdByPaintingId = new Map<string, string>(
    (paintings ?? []).map((r) => [r.content_item_id as string, String(r.painting_medium_id)])
  )

  const grouped = new Map<
    string,
    {
      medium: string
      mediumLabelCy?: string
      paintings: SidebarPaintingGroup['paintings']
    }
  >()

  for (const id of paintingIds) {
    const mediumId = mediumIdByPaintingId.get(id) ?? ''
    const medium = mediumId && mediumId !== 'null' ? (mediumLabelById.get(mediumId) ?? mediumId) : 'Uncategorised'
    const mediumLabelCy = mediumId && mediumId !== 'null' ? mediumLabelCyById.get(mediumId) : undefined
    const title = titleById.get(id) ?? 'Untitled painting'
    const current = grouped.get(medium) ?? { medium, mediumLabelCy, paintings: [] }
    grouped.set(medium, {
      ...current,
      paintings: [...current.paintings, { id, title, medium, mediumLabelCy }],
    })
  }

  return [...grouped.values()]
    .map((group) => ({
      medium: group.medium,
      mediumLabelCy: group.mediumLabelCy,
      paintings: [...group.paintings].sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => {
      if (a.medium === 'Uncategorised') return 1
      if (b.medium === 'Uncategorised') return -1
      return a.medium.localeCompare(b.medium)
    })
}

async function getSidebarArtifactGroups(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SidebarArtifactGroup[]> {
  const typeIds = await getContentTypeIds(supabase)
  const artefactTypeId = typeIds.get('artefact')
  if (!artefactTypeId) return []

  const { data: artefactItems } = await supabase
    .from('content_items')
    .select('id')
    .eq('content_type_id', artefactTypeId)

  const artefactIds = (artefactItems ?? []).map((a) => a.id)
  if (artefactIds.length === 0) return []

  const adminSupabase = createAdminClient()

  const [{ data: translations }, { data: artefacts }, { data: categories }, { data: categoryTranslations }, { data: categoryTranslationsCy }] = await Promise.all([
    supabase
      .from('content_item_translations')
      .select('content_item_id, title')
      .eq('language_code', 'en')
      .in('content_item_id', artefactIds),
    supabase
      .from('artefacts')
      .select('content_item_id, artefact_category_id')
      .in('content_item_id', artefactIds),
    adminSupabase
      .from('artefact_categories')
      .select('id, code, sort_order'),
    adminSupabase
      .from('artefact_category_translations')
      .select('artefact_category_id, label')
      .eq('language_code', 'en'),
    adminSupabase
      .from('artefact_category_translations')
      .select('artefact_category_id, label')
      .eq('language_code', 'cy'),
  ])

  const titleById = new Map<string, string>(
    (translations ?? []).filter((r) => r.title).map((r) => [r.content_item_id as string, r.title as string])
  )

  const categoryById = new Map(
    (categories ?? []).map((row) => [
      String(row.id),
      {
        code: (row.code as string | null) ?? String(row.id),
        sortOrder: (row.sort_order as number | null) ?? 0,
      },
    ])
  )

  const categoryLabelById = new Map<string, string>(
    (categoryTranslations ?? [])
      .filter((row) => row.label)
      .map((row) => [String(row.artefact_category_id), row.label as string])
  )

  const categoryLabelCyById = new Map<string, string>(
    (categoryTranslationsCy ?? [])
      .filter((row) => row.label)
      .map((row) => [String(row.artefact_category_id), row.label as string])
  )

  const categoryIdByArtefactId = new Map<string, string>(
    (artefacts ?? []).map((row) => [row.content_item_id as string, String(row.artefact_category_id)])
  )

  const grouped = new Map<
    string,
    {
      categoryCode: string
      categoryLabel: string
      categoryLabelCy?: string
      sortOrder: number
      artifacts: SidebarArtifactGroup['artifacts']
    }
  >()

  for (const id of artefactIds) {
    const catId = categoryIdByArtefactId.get(id) ?? ''
    const cat = categoryById.get(catId)
    const categoryCode = cat?.code ?? 'uncategorised'
    const categoryLabel =
      categoryLabelById.get(catId) ??
      (categoryCode === 'uncategorised' ? 'Uncategorised' : categoryCode)
    const categoryLabelCy = categoryLabelCyById.get(catId)
    const current = grouped.get(categoryCode) ?? {
      categoryCode,
      categoryLabel,
      categoryLabelCy,
      sortOrder: cat?.sortOrder ?? Number.MAX_SAFE_INTEGER,
      artifacts: [],
    }

    grouped.set(categoryCode, {
      ...current,
      artifacts: [
        ...current.artifacts,
        {
          id,
          title: titleById.get(id) ?? 'Untitled artefact',
          categoryCode,
          categoryLabel,
          categoryLabelCy,
        },
      ],
    })
  }

  return [...grouped.values()]
    .sort((a, b) => {
      if (a.categoryCode === 'uncategorised') return 1
      if (b.categoryCode === 'uncategorised') return -1
      return a.sortOrder - b.sortOrder || a.categoryLabel.localeCompare(b.categoryLabel)
    })
    .map((group) => ({
      categoryCode: group.categoryCode,
      categoryLabel: group.categoryLabel,
      categoryLabelCy: group.categoryLabelCy,
      artifacts: [...group.artifacts].sort((a, b) => a.title.localeCompare(b.title)),
    }))
}

function surnameSort(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name
  return parts[parts.length - 1] + ' ' + parts.slice(0, -1).join(' ')
}

async function getSidebarBios(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SidebarBio[]> {
  const typeIds = await getContentTypeIds(supabase)
  const biographyTypeId = typeIds.get('biography')
  if (!biographyTypeId) return []

  const { data: bioItems } = await supabase
    .from('content_items')
    .select('id')
    .eq('content_type_id', biographyTypeId)

  const bioIds = (bioItems ?? []).map((b) => b.id)
  if (bioIds.length === 0) return []

  const { data: translations } = await supabase
    .from('content_item_translations')
    .select('content_item_id, title')
    .eq('language_code', 'en')
    .in('content_item_id', bioIds)

  const titleById = new Map<string, string>(
    (translations ?? []).filter((r) => r.title).map((r) => [r.content_item_id as string, r.title as string])
  )

  return bioIds
    .map((id) => ({ id, name: titleById.get(id) ?? 'Untitled biography' }))
    .sort((a, b) => surnameSort(a.name).localeCompare(surnameSort(b.name)))
}

async function getSidebarLocations(): Promise<SidebarLocation[]> {
  const adminSupabase = createAdminClient()
  const [{ data: locs }, { data: links }] = await Promise.all([
    adminSupabase
      .from('locations')
      .select('id, address_line_1, town, postcode, latitude, longitude, location_translations(language_code, title)')
      .order('address_line_1', { ascending: true }),
    adminSupabase
      .from('content_locations')
      .select('location_id'),
  ])

  const assignedIds = new Set((links ?? []).map((l) => l.location_id as string))

  return (locs ?? []).map((loc) => {
    const translations = Array.isArray(loc.location_translations) ? loc.location_translations : []
    const translation = translations.find((t) => t.language_code === 'en') ?? translations[0]
    const address = translation?.title
      || [loc.address_line_1, loc.town, loc.postcode].filter(Boolean).join(', ')
      || 'Unknown location'
    return {
      id: loc.id as string,
      address,
      lat: Number(loc.latitude),
      lng: Number(loc.longitude),
      isAssigned: assignedIds.has(loc.id as string),
    }
  })
}

async function getAvailableStoryTypes(): Promise<StoryTypeOption[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('story_types')
    .select(
      `
      code,
      sort_order,
      story_type_translations (
        language_code,
        label
      )
    `
    )
    .order('sort_order', { ascending: true })

  if (error) return []

  return (data ?? [])
    .filter((row) => row.code)
    .map((row) => {
      const translations = Array.isArray(row.story_type_translations)
        ? row.story_type_translations
        : []
      const enTranslation =
        translations.find((item) => item.language_code === 'en') ?? translations[0]
      const cyTranslation = translations.find((item) => item.language_code === 'cy')

      return {
        code: row.code as string,
        label: enTranslation?.label ?? (row.code as string),
        labelCy: cyTranslation?.label ?? undefined,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

async function getEditDraft(
  supabase: Awaited<ReturnType<typeof createClient>>,
  type: string | undefined,
  id: string | undefined
): Promise<{
  mode: EditorMode
  draft: OverviewDraft
  editId: string | null
  editType: ContentType | null
  initialLocation: { address: string; lat: number; lng: number } | null
  initialAudio: AudioItem | null
  initialRelatedContent: ConnectedItem[]
}> {
  const noEdit = { mode: 'create' as const, draft: initialDraft, editId: null, editType: null, initialLocation: null, initialAudio: null, initialRelatedContent: [] }
  if (!type || !id) return noEdit

  const resolvedType = CONTENT_TYPE_UI_TO_DB[type]
  if (!resolvedType) return noEdit

  const adminSupabase = createAdminClient()

  const { data: itemTranslation } = await adminSupabase
    .from('content_item_translations')
    .select('*')
    .eq('content_item_id', id)
    .eq('language_code', 'en')
    .maybeSingle()

  const { data: itemRow } = await adminSupabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()

  if (!itemRow) return noEdit

  const rawItem = itemRow as Record<string, unknown>

  // Fetch location via the content_locations → locations join (admin to bypass RLS)
  const { data: locationLink } = await adminSupabase
    .from('content_locations')
    .select('location_id')
    .eq('content_item_id', id)
    .eq('relationship_type', 'primary')
    .maybeSingle()

  let initialLocation: { address: string; lat: number; lng: number } | null = null
  if (locationLink?.location_id) {
    const { data: loc } = await adminSupabase
      .from('locations')
      .select('latitude, longitude, address_line_1, town, postcode')
      .eq('id', locationLink.location_id)
      .maybeSingle()
    if (loc) {
      const parsedLat = Number(loc.latitude)
      const parsedLng = Number(loc.longitude)
      const addressParts = [
        (loc.address_line_1 as string | null) ?? '',
        (loc.town as string | null) ?? '',
        (loc.postcode as string | null) ?? '',
      ].filter(Boolean)
      initialLocation =
        Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
          ? { address: addressParts.join(', '), lat: parsedLat, lng: parsedLng }
          : null
    }
  }

  // Fetch audio guide
  let initialAudio: AudioItem | null = null
  const { data: audioMedia } = await adminSupabase
    .from('content_media')
    .select('media_asset_id, media_assets(file_name, storage_path)')
    .eq('content_item_id', id)
    .eq('role', 'audio')
    .maybeSingle()
  if (audioMedia?.media_asset_id) {
    const asset = (audioMedia.media_assets as unknown as { file_name: string; storage_path: string } | null)
    initialAudio = {
      mediaAssetId: audioMedia.media_asset_id as string,
      fileName: asset?.file_name ?? '',
      url: asset?.storage_path && isAbsoluteUrl(asset.storage_path) ? asset.storage_path : null,
    }
  }

  // Fetch related content
  let initialRelatedContent: ConnectedItem[] = []
  const { data: relatedLinks } = await adminSupabase
    .from('related_content')
    .select('child_content_item_id')
    .eq('parent_content_item_id', id)
  const relatedIds = (relatedLinks ?? []).map((r) => r.child_content_item_id as string)
  if (relatedIds.length > 0) {
    const [{ data: relatedTranslations }, { data: relatedItems }, { data: typeTranslations }] =
      await Promise.all([
        adminSupabase
          .from('content_item_translations')
          .select('content_item_id, title')
          .eq('language_code', 'en')
          .in('content_item_id', relatedIds),
        adminSupabase.from('content_items').select('id, content_type_id').in('id', relatedIds),
        adminSupabase
          .from('content_type_translations')
          .select('content_type_id, label')
          .eq('language_code', 'en'),
      ])
    const titleById = new Map(
      (relatedTranslations ?? []).map((t) => [t.content_item_id as string, t.title as string])
    )
    const typeIdByItemId = new Map(
      (relatedItems ?? []).map((i) => [i.id as string, i.content_type_id as number])
    )
    const typeLabelById = new Map(
      (typeTranslations ?? []).map((t) => [t.content_type_id as number, t.label as string])
    )
    initialRelatedContent = relatedIds.map((relatedId) => {
      const typeId = typeIdByItemId.get(relatedId)
      return {
        id: relatedId,
        title: titleById.get(relatedId) ?? 'Untitled',
        contentTypeCode: String(typeId ?? ''),
        contentTypeLabel: typeId ? (typeLabelById.get(typeId) ?? '') : '',
      }
    })
  }

  if (resolvedType === 'book') {
    const { data: book } = await adminSupabase
      .from('books')
      .select('*')
      .eq('content_item_id', id)
      .maybeSingle()

    const [{ data: translation }, { data: translationCy }, { data: itemTranslationCy }] = await Promise.all([
      adminSupabase
        .from('book_translations')
        .select('*')
        .eq('book_content_item_id', id)
        .eq('language_code', 'en')
        .maybeSingle(),
      adminSupabase
        .from('book_translations')
        .select('*')
        .eq('book_content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
      adminSupabase
        .from('content_item_translations')
        .select('*')
        .eq('content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
    ])

    const { data: genreLinks } = await adminSupabase
      .from('book_theme_books')
      .select('book_theme_id')
      .eq('book_content_item_id', id)

    let genres: string[] = []

    if (genreLinks && genreLinks.length > 0) {
      const ids = genreLinks.map((row) => row.book_theme_id)
      const { data: genreTranslations } = await adminSupabase
        .from('book_theme_translations')
        .select('book_theme_id, title')
        .eq('language_code', 'en')
        .in('book_theme_id', ids)

      genres = (genreTranslations ?? []).map((row) => row.title).filter(Boolean)
    }

    return {
      initialLocation,
      initialAudio,
      initialRelatedContent,
      mode: 'edit',
      editId: id,
      editType: 'book',
      draft: {
        ...initialDraft,
        contentType: 'book',
        slug: itemRow.slug ?? '',
        isFeatured: itemRow.featured ?? false,
        isPublished: !!itemRow.published_at,
        sortOrder: '100',
        featuredImageId: '',
        seoTitle: itemTranslation?.seo_title ?? '',
        seoDescription: itemTranslation?.seo_description ?? '',
        seoTitleCy: itemTranslationCy?.seo_title ?? '',
        seoDescriptionCy: itemTranslationCy?.seo_description ?? '',
        book: {
          title: itemTranslation?.title ?? '',
          author: translation?.author ?? '',
          publisher: book?.publisher ?? '',
          isbn: book?.isbn ?? '',
          summary: translation?.excerpt ?? itemTranslation?.summary ?? '',
          exposition: itemTranslation?.body ?? '',
          publicationDate: book?.publication_year ? `${book.publication_year}-01-01` : '',
          pagesCount: '',
          genres,
        },
        bookCy: {
          title: itemTranslationCy?.title ?? '',
          summary: translationCy?.excerpt ?? itemTranslationCy?.summary ?? '',
          exposition: itemTranslationCy?.body ?? '',
        },
      },
    }
  }

  if (resolvedType === 'stories') {
    const { data: story } = await adminSupabase
      .from('stories')
      .select('*, story_types(code)')
      .eq('content_item_id', id)
      .maybeSingle()

    const [{ data: translation }, { data: translationCy }, { data: itemTranslationCy }] = await Promise.all([
      adminSupabase
        .from('story_translations')
        .select('*')
        .eq('story_content_item_id', id)
        .eq('language_code', 'en')
        .maybeSingle(),
      adminSupabase
        .from('story_translations')
        .select('*')
        .eq('story_content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
      adminSupabase
        .from('content_item_translations')
        .select('*')
        .eq('content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
    ])

    const storyCode = (story?.story_types as { code?: string } | null)?.code ?? 'historical'

    return {
      initialLocation,
      initialAudio,
      initialRelatedContent,
      mode: 'edit',
      editId: id,
      editType: 'stories',
      draft: {
        ...initialDraft,
        contentType: 'stories',
        slug: itemRow.slug ?? '',
        isFeatured: itemRow.featured ?? false,
        isPublished: !!itemRow.published_at,
        sortOrder: '100',
        featuredImageId: '',
        seoTitle: itemTranslation?.seo_title ?? '',
        seoDescription: itemTranslation?.seo_description ?? '',
        seoTitleCy: itemTranslationCy?.seo_title ?? '',
        seoDescriptionCy: itemTranslationCy?.seo_description ?? '',
        story: {
          storyType: storyCode,
          title: itemTranslation?.title ?? '',
          summary: itemTranslation?.summary ?? '',
          exposition: translation?.event_details ?? itemTranslation?.body ?? '',
          sortOrder: '0',
        },
        storyCy: {
          title: itemTranslationCy?.title ?? '',
          summary: itemTranslationCy?.summary ?? '',
          exposition: translationCy?.event_details ?? itemTranslationCy?.body ?? '',
        },
      },
    }
  }

  if (resolvedType === 'painting') {
    const { data: painting } = await adminSupabase
      .from('paintings')
      .select('*')
      .eq('content_item_id', id)
      .single()

    if (!painting) {
      return noEdit
    }

    const [{ data: translation }, { data: translationCy }, { data: itemTranslationCy }, { data: mediumRow }] = await Promise.all([
      adminSupabase
        .from('painting_translations')
        .select('*')
        .eq('painting_content_item_id', id)
        .eq('language_code', 'en')
        .maybeSingle(),
      adminSupabase
        .from('painting_translations')
        .select('*')
        .eq('painting_content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
      adminSupabase
        .from('content_item_translations')
        .select('*')
        .eq('content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
      painting.painting_medium_id
        ? adminSupabase.from('painting_mediums').select('code').eq('id', painting.painting_medium_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    return {
      initialLocation,
      initialAudio,
      initialRelatedContent,
      mode: 'edit',
      editId: id,
      editType: 'painting',
      draft: {
        ...initialDraft,
        contentType: 'painting',
        slug: itemRow.slug ?? '',
        isFeatured: itemRow.featured ?? false,
        isPublished: !!itemRow.published_at,
        sortOrder: '100',
        featuredImageId: '',
        seoTitle: itemTranslation?.seo_title ?? '',
        seoDescription: itemTranslation?.seo_description ?? '',
        seoTitleCy: itemTranslationCy?.seo_title ?? '',
        seoDescriptionCy: itemTranslationCy?.seo_description ?? '',
        painting: {
          title: itemTranslation?.title ?? '',
          artist: painting.artist_name ?? '',
          medium: (mediumRow?.code as string | null) ?? '',
          ...(() => {
            let dimensionsH = '', dimensionsW = ''
            try {
              const dims = JSON.parse((painting.dimensions as string | null) ?? '{}')
              dimensionsH = dims.h != null ? String(dims.h) : ''
              dimensionsW = dims.w != null ? String(dims.w) : ''
            } catch { /* ignore */ }
            return { dimensionsH, dimensionsW }
          })(),
          description: translation?.detail_notes ?? itemTranslation?.body ?? '',
          yearCreated: painting.year_created ? String(painting.year_created) : '',
          itemId: '',
        },
        paintingCy: {
          title: itemTranslationCy?.title ?? '',
          description: translationCy?.detail_notes ?? itemTranslationCy?.body ?? '',
        },
      },
    }
  }

  if (resolvedType === 'artifacts') {
    const { data: artefact } = await adminSupabase
      .from('artefacts')
      .select('*')
      .eq('content_item_id', id)
      .single()

    if (!artefact) {
      return noEdit
    }

    const [{ data: translation }, { data: translationCy }, { data: itemTranslationCy }, { data: itemTranslationEn }] = await Promise.all([
      adminSupabase
        .from('artefact_translations')
        .select('*')
        .eq('artefact_content_item_id', id)
        .eq('language_code', 'en')
        .maybeSingle(),
      adminSupabase
        .from('artefact_translations')
        .select('*')
        .eq('artefact_content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
      adminSupabase
        .from('content_item_translations')
        .select('*')
        .eq('content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
      adminSupabase
        .from('content_item_translations')
        .select('*')
        .eq('content_item_id', id)
        .eq('language_code', 'en')
        .maybeSingle(),
    ])

    let categoryCode = ''
    const rawCategoryId = (artefact as Record<string, unknown>).artefact_category_id
    if (rawCategoryId) {
      const { data: category } = await adminSupabase
        .from('artefact_categories')
        .select('code')
        .eq('id', rawCategoryId)
        .maybeSingle()
      categoryCode = (category?.code as string | null) ?? ''
    }

    return {
      initialLocation,
      initialAudio,
      initialRelatedContent,
      mode: 'edit',
      editId: id,
      editType: 'artifacts',
      draft: {
        ...initialDraft,
        contentType: 'artifacts',
        slug: itemRow.slug ?? '',
        isFeatured: itemRow.featured ?? false,
        isPublished: !!itemRow.published_at,
        sortOrder: '100',
        featuredImageId: '',
        seoTitle: itemTranslation?.seo_title ?? '',
        seoDescription: itemTranslation?.seo_description ?? '',
        seoTitleCy: itemTranslationCy?.seo_title ?? '',
        seoDescriptionCy: itemTranslationCy?.seo_description ?? '',
        artifact: {
          categoryCode,
          title: itemTranslation?.title ?? '',
          maker: (artefact as Record<string, unknown>).maker as string ?? '',
          material: artefact.material ?? '',
          description: translation?.notes ?? itemTranslation?.body ?? '',
          itemId: (artefact.catalogue_reference as string | null) ?? '',
          ...(() => {
            let dimensionsH = '', dimensionsW = '', dimensionsD = ''
            try {
              const dims = JSON.parse((artefact.dimensions as string | null) ?? '{}')
              dimensionsH = dims.h != null ? String(dims.h) : ''
              dimensionsW = dims.w != null ? String(dims.w) : ''
              dimensionsD = dims.d != null ? String(dims.d) : ''
            } catch { /* ignore */ }
            return { dimensionsH, dimensionsW, dimensionsD }
          })(),
          startDay: itemRow.start_date_day != null ? String(itemRow.start_date_day) : '',
          startMonth: itemRow.start_date_month != null ? String(itemRow.start_date_month) : '',
          startYear: itemRow.start_date_year != null ? String(itemRow.start_date_year) : '',
          startEra: ((itemRow.start_date_era as string | null) === 'BC' ? 'BC' : 'AD') as 'AD' | 'BC',
          endDay: itemRow.end_date_day != null ? String(itemRow.end_date_day) : '',
          endMonth: itemRow.end_date_month != null ? String(itemRow.end_date_month) : '',
          endYear: itemRow.end_date_year != null ? String(itemRow.end_date_year) : '',
          endEra: ((itemRow.end_date_era as string | null) === 'BC' ? 'BC' : 'AD') as 'AD' | 'BC',
          periodId: (itemRow.historical_period_id as string | null) ?? '',
          eraId: (itemRow.historical_era_id as string | null) ?? '',
          customPeriod: (itemTranslationEn?.custom_period_label as string | null) ?? '',
        },
        artifactCy: {
          title: itemTranslationCy?.title ?? '',
          description: translationCy?.notes ?? itemTranslationCy?.body ?? '',
        },
      },
    }
  }

  if (resolvedType === 'bio') {
    const { data: biography } = await adminSupabase
      .from('biographies')
      .select('*')
      .eq('content_item_id', id)
      .single()

    if (!biography) {
      return noEdit
    }

    const [{ data: translation }, { data: translationCy }, { data: itemTranslationCy }] = await Promise.all([
      adminSupabase
        .from('biography_translations')
        .select('*')
        .eq('biography_content_item_id', id)
        .eq('language_code', 'en')
        .maybeSingle(),
      adminSupabase
        .from('biography_translations')
        .select('*')
        .eq('biography_content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
      adminSupabase
        .from('content_item_translations')
        .select('*')
        .eq('content_item_id', id)
        .eq('language_code', 'cy')
        .maybeSingle(),
    ])

    return {
      initialLocation,
      initialAudio,
      initialRelatedContent,
      mode: 'edit',
      editId: id,
      editType: 'bio',
      draft: {
        ...initialDraft,
        contentType: 'bio',
        slug: itemRow.slug ?? '',
        isFeatured: itemRow.featured ?? false,
        isPublished: !!itemRow.published_at,
        sortOrder: '100',
        featuredImageId: '',
        seoTitle: itemTranslation?.seo_title ?? '',
        seoDescription: itemTranslation?.seo_description ?? '',
        seoTitleCy: itemTranslationCy?.seo_title ?? '',
        seoDescriptionCy: itemTranslationCy?.seo_description ?? '',
        bio: {
          name: biography.person_name ?? itemTranslation?.title ?? '',
          occupation: translation?.occupation ?? '',
          summary: itemTranslation?.summary ?? '',
          content: translation?.biography_text ?? itemTranslation?.body ?? '',
          birthDate: biography.birth_year ? String(biography.birth_year) : '',
          birthDay: '',
          birthMonth: '',
          birthEra: 'AD',
          deathDate: biography.death_year ? String(biography.death_year) : '',
          deathDay: '',
          deathMonth: '',
          deathEra: 'AD',
        },
        bioCy: {
          occupation: translationCy?.occupation ?? '',
          summary: itemTranslationCy?.summary ?? '',
          content: translationCy?.biography_text ?? itemTranslationCy?.body ?? '',
        },
      },
    }
  }

  return noEdit
}


async function getInitialImages(
  _supabase: Awaited<ReturnType<typeof createClient>>,
  contentItemId: string | null
): Promise<{
  id: string
  previewUrl: string
  fileName: string
  altText: string
  caption: string
  credit: string
  isPrimary: boolean
}[]> {
  if (!contentItemId) return []

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('content_media')
    .select(
      `
      media_asset_id,
      is_primary,
      sort_order,
      media_assets (
        file_name,
        storage_path,
        credit,
        media_asset_translations (
          language_code,
          alt_text,
          caption
        )
      )
    `
    )
    .eq('content_item_id', contentItemId)
    .neq('role', 'audio')
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getInitialImages] Supabase query failed:', JSON.stringify(error, null, 2))
    return []
  }

  const rows = await Promise.all((data ?? []).map(async (row) => {
    const asset = Array.isArray(row.media_assets) ? row.media_assets[0] : row.media_assets
    const storagePath = (asset?.storage_path as string | null) ?? ''
    const previewUrl = await resolvePreviewUrl(storagePath)

    const translations = Array.isArray((asset as any)?.media_asset_translations)
      ? (asset as any).media_asset_translations
      : []
    const translation =
      translations.find((item: any) => item.language_code === 'en') ?? translations[0] ?? null

    return {
      id: row.media_asset_id as string,
      previewUrl,
      fileName: (asset?.file_name as string | null) ?? 'Image',
      altText: (translation?.alt_text as string | null) ?? '',
      caption: (translation?.caption as string | null) ?? '',
      credit: (asset?.credit as string | null) ?? '',
      isPrimary: Boolean(row.is_primary),
    }
  }))

  const deduped = new Map<string, (typeof rows)[number]>()
  for (const row of rows) {
    if (!row.previewUrl) continue
    if (!deduped.has(row.id)) {
      deduped.set(row.id, row)
    }
  }

  return Array.from(deduped.values())
}

async function getAdminUsers(): Promise<AdminUser[]> {
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('admin_users')
    .select('id, email, role, status, created_at')
    .order('created_at', { ascending: true })

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    role: row.role as string,
    status: row.status as string,
    createdAt: row.created_at as string,
  }))
}

export default async function OverviewPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = (await searchParams) ?? {}
  const createSelected = resolvedParams.new === '1'
  const viewAdminUsers = resolvedParams.view === 'admin-users'
  const viewLocations = resolvedParams.view === 'locations'
  const initialUiLang = resolvedParams.lang === 'cy' ? 'cy' : 'en'

  const adminSupabase = createAdminClient()

  const [
    sidebarCounts,
    editState,
    availableBookGenres,
    availableStoryTypes,
    availablePaintingMediums,
    availableArtifactCategories,
    availableHistoricalPeriods,
    availableHistoricalEras,
    sidebarBookGroups,
    sidebarStoryGroups,
    sidebarPaintingGroups,
    sidebarArtifactGroups,
    sidebarBios,
    adminUsers,
    sidebarLocations,
  ] = await Promise.all([
    getSidebarCounts(adminSupabase),
    getEditDraft(supabase, resolvedParams.type, resolvedParams.id),
    getAvailableBookGenres(),
    getAvailableStoryTypes(),
    getAvailablePaintingMediums(),
    getAvailableArtifactCategories(),
    getAvailableHistoricalPeriods(),
    getAvailableHistoricalEras(),
    getSidebarBookGroups(adminSupabase),
    getSidebarStoryGroups(adminSupabase),
    getSidebarPaintingGroups(adminSupabase),
    getSidebarArtifactGroups(adminSupabase),
    getSidebarBios(adminSupabase),
    getAdminUsers(),
    getSidebarLocations(),
  ])

  const initialImages = await getInitialImages(supabase, editState.editId)

  return (
    <OverviewContent
      userEmail={user.email ?? ''}
      userId={user.id}
      initialUiLang={initialUiLang}
      sidebarCounts={sidebarCounts}
      initialDraft={editState.draft}
      mode={editState.mode}
      editId={editState.editId}
      editType={editState.editType}
      availableBookGenres={availableBookGenres}
      availableStoryTypes={availableStoryTypes}
      availablePaintingMediums={availablePaintingMediums}
      availableArtifactCategories={availableArtifactCategories}
      availableHistoricalPeriods={availableHistoricalPeriods}
      availableHistoricalEras={availableHistoricalEras}
      sidebarBookGroups={sidebarBookGroups}
      sidebarStoryGroups={sidebarStoryGroups}
      sidebarPaintingGroups={sidebarPaintingGroups}
      sidebarArtifactGroups={sidebarArtifactGroups}
      sidebarBios={sidebarBios}
      sidebarLocations={sidebarLocations}
      showEditor={editState.mode === 'edit' || createSelected}
      initialImages={initialImages}
      initialLocation={editState.initialLocation}
      initialAudio={editState.initialAudio}
      initialRelatedContent={editState.initialRelatedContent}
      adminUsers={adminUsers}
      viewAdminUsers={viewAdminUsers}
      viewLocations={viewLocations}
    />
  )
}