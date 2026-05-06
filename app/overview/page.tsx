import { redirect } from 'next/navigation'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { getR2Client } from '@/lib/r2'
import OverviewContent from './OverviewContent'
import {
  initialDraft,
  type AudioItem,
  type ConnectedItem,
  type ContentType,
  type EditorMode,
  type SidebarBookGroup,
  type SidebarStoryGroup,
  type SidebarPaintingGroup,
  type SidebarArtifactGroup,
  type SidebarBio,
  type OverviewDraft,
  type SidebarCounts,
  type StoryTypeOption,
} from './types'

type PageProps = {
  searchParams?: Promise<{
    type?: string
    id?: string
    new?: string
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

  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (publicBaseUrl) {
    return `${publicBaseUrl}/${normalizedPath}`
  }

  const bucket = process.env.R2_BUCKET_NAME
  if (!bucket) {
    return ''
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: normalizedPath,
    })
    return await getSignedUrl(getR2Client(), command, { expiresIn: 60 * 15 })
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

  const [{ data: translations }, { data: genreLinks }, { data: genreTranslations }] =
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

  const genresByBookId = new Map<string, string[]>()
  for (const link of genreLinks ?? []) {
    const genreTitle = genreById.get(String(link.book_theme_id))
    if (!genreTitle) continue
    const current = genresByBookId.get(link.book_content_item_id) ?? []
    if (!current.includes(genreTitle)) {
      genresByBookId.set(link.book_content_item_id, [...current, genreTitle])
    }
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

  const grouped = new Map<
    string,
    {
      storyTypeCode: string
      storyTypeLabel: string
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
    const current = grouped.get(storyTypeCode) ?? {
      storyTypeCode,
      storyTypeLabel,
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
        },
      ],
    })
  }

  return [...grouped.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.storyTypeLabel.localeCompare(b.storyTypeLabel))
    .map((group) => ({
      storyTypeCode: group.storyTypeCode,
      storyTypeLabel: group.storyTypeLabel,
      stories: [...group.stories].sort((a, b) => a.title.localeCompare(b.title)),
    }))
}

async function getAvailableBookGenres(): Promise<string[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('book_theme_translations')
    .select('title')
    .eq('language_code', 'en')
    .order('title', { ascending: true })

  if (error) {
    return []
  }

  return [...new Set((data ?? []).map((row) => row.title).filter(Boolean))]
}

async function getAvailablePaintingMediums(): Promise<string[]> {
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase.from('paintings').select('medium')
  return [...new Set((data ?? []).map((row) => (row.medium as string | null) ?? '').filter(Boolean))].sort()
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

  const [{ data: translations }, { data: paintings }] = await Promise.all([
    supabase
      .from('content_item_translations')
      .select('content_item_id, title')
      .eq('language_code', 'en')
      .in('content_item_id', paintingIds),
    supabase
      .from('paintings')
      .select('content_item_id, medium')
      .in('content_item_id', paintingIds),
  ])

  const titleById = new Map<string, string>(
    (translations ?? []).filter((r) => r.title).map((r) => [r.content_item_id as string, r.title as string])
  )
  const mediumById = new Map<string, string>(
    (paintings ?? []).map((r) => [r.content_item_id as string, (r.medium as string | null) ?? ''])
  )

  const grouped = new Map<string, SidebarPaintingGroup['paintings']>()
  for (const id of paintingIds) {
    const medium = mediumById.get(id) || 'Uncategorised'
    const title = titleById.get(id) ?? 'Untitled painting'
    const current = grouped.get(medium) ?? []
    grouped.set(medium, [...current, { id, title, medium }])
  }

  return [...grouped.entries()]
    .map(([medium, paintings]) => ({
      medium,
      paintings: [...paintings].sort((a, b) => a.title.localeCompare(b.title)),
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

  const [{ data: translations }, { data: artefacts }] = await Promise.all([
    supabase
      .from('content_item_translations')
      .select('content_item_id, title')
      .eq('language_code', 'en')
      .in('content_item_id', artefactIds),
    supabase
      .from('artefacts')
      .select('content_item_id, material')
      .in('content_item_id', artefactIds),
  ])

  const titleById = new Map<string, string>(
    (translations ?? []).filter((r) => r.title).map((r) => [r.content_item_id as string, r.title as string])
  )
  const materialById = new Map<string, string>(
    (artefacts ?? []).map((r) => [r.content_item_id as string, (r.material as string | null) ?? ''])
  )

  const grouped = new Map<string, SidebarArtifactGroup['artifacts']>()
  for (const id of artefactIds) {
    const material = materialById.get(id) || 'Uncategorised'
    const title = titleById.get(id) ?? 'Untitled artefact'
    const current = grouped.get(material) ?? []
    grouped.set(material, [...current, { id, title, material }])
  }

  return [...grouped.entries()]
    .map(([material, artifacts]) => ({
      material,
      artifacts: [...artifacts].sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => {
      if (a.material === 'Uncategorised') return 1
      if (b.material === 'Uncategorised') return -1
      return a.material.localeCompare(b.material)
    })
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
      const translation =
        translations.find((item) => item.language_code === 'en') ?? translations[0]

      return { code: row.code as string, label: translation?.label ?? (row.code as string) }
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

    const { data: translation } = await adminSupabase
      .from('book_translations')
      .select('*')
      .eq('book_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

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
      },
    }
  }

  if (resolvedType === 'stories') {
    const { data: story } = await adminSupabase
      .from('stories')
      .select('*, story_types(code)')
      .eq('content_item_id', id)
      .maybeSingle()

    const { data: translation } = await adminSupabase
      .from('story_translations')
      .select('*')
      .eq('story_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

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
        story: {
          storyType: storyCode,
          title: itemTranslation?.title ?? '',
          summary: itemTranslation?.summary ?? '',
          exposition: translation?.event_details ?? itemTranslation?.body ?? '',
          sortOrder: '0',
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

    const { data: translation } = await adminSupabase
      .from('painting_translations')
      .select('*')
      .eq('painting_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

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
        painting: {
          title: itemTranslation?.title ?? '',
          artist: painting.artist_name ?? '',
          medium: painting.medium ?? '',
          dimensions: painting.dimensions ?? '',
          description: translation?.detail_notes ?? itemTranslation?.body ?? '',
          yearCreated: painting.year_created ? String(painting.year_created) : '',
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

    const { data: translation } = await adminSupabase
      .from('artefact_translations')
      .select('*')
      .eq('artefact_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

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
        artifact: {
          title: itemTranslation?.title ?? '',
          material: artefact.material ?? '',
          dimensions: artefact.dimensions ?? '',
          description: translation?.notes ?? itemTranslation?.body ?? '',
          datePeriod: artefact.date_created_label ?? '',
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

    const { data: translation } = await adminSupabase
      .from('biography_translations')
      .select('*')
      .eq('biography_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

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
        bio: {
          name: biography.person_name ?? itemTranslation?.title ?? '',
          occupation: translation?.occupation ?? '',
          summary: itemTranslation?.summary ?? '',
          content: translation?.biography_text ?? itemTranslation?.body ?? '',
          birthDate: biography.birth_year ? String(biography.birth_year) : '',
          deathDate: biography.death_year ? String(biography.death_year) : '',
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

  const adminSupabase = createAdminClient()

  const [
    sidebarCounts,
    editState,
    availableBookGenres,
    availableStoryTypes,
    availablePaintingMediums,
    sidebarBookGroups,
    sidebarStoryGroups,
    sidebarPaintingGroups,
    sidebarArtifactGroups,
    sidebarBios,
  ] = await Promise.all([
    getSidebarCounts(adminSupabase),
    getEditDraft(supabase, resolvedParams.type, resolvedParams.id),
    getAvailableBookGenres(),
    getAvailableStoryTypes(),
    getAvailablePaintingMediums(),
    getSidebarBookGroups(adminSupabase),
    getSidebarStoryGroups(adminSupabase),
    getSidebarPaintingGroups(adminSupabase),
    getSidebarArtifactGroups(adminSupabase),
    getSidebarBios(adminSupabase),
  ])

  const initialImages = await getInitialImages(supabase, editState.editId)

  return (
    <OverviewContent
      userEmail={user.email ?? ''}
      sidebarCounts={sidebarCounts}
      initialDraft={editState.draft}
      mode={editState.mode}
      editId={editState.editId}
      editType={editState.editType}
      availableBookGenres={availableBookGenres}
      availableStoryTypes={availableStoryTypes}
      availablePaintingMediums={availablePaintingMediums}
      sidebarBookGroups={sidebarBookGroups}
      sidebarStoryGroups={sidebarStoryGroups}
      sidebarPaintingGroups={sidebarPaintingGroups}
      sidebarArtifactGroups={sidebarArtifactGroups}
      sidebarBios={sidebarBios}
      showEditor={editState.mode === 'edit' || createSelected}
      initialImages={initialImages}
      initialLocation={editState.initialLocation}
      initialAudio={editState.initialAudio}
      initialRelatedContent={editState.initialRelatedContent}
    />
  )
}


