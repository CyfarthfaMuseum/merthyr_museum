import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import OverviewContent from './OverviewContent'
import {
  initialDraft,
  type ContentType,
  type EditorMode,
  type SidebarBookGroup,
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
      : Promise.resolve({ count: 0 } as any),
    storyTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', storyTypeId)
      : Promise.resolve({ count: 0 } as any),
    paintingTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', paintingTypeId)
      : Promise.resolve({ count: 0 } as any),
    artefactTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', artefactTypeId)
      : Promise.resolve({ count: 0 } as any),
    biographyTypeId
      ? supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', biographyTypeId)
      : Promise.resolve({ count: 0 } as any),
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

async function getAvailableBookGenres(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string[]> {
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

async function getAvailableStoryTypes(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<StoryTypeOption[]> {
  const { data, error } = await supabase
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
}> {
  if (!type || !id) {
    return { mode: 'create', draft: initialDraft, editId: null, editType: null }
  }

  const resolvedType = CONTENT_TYPE_UI_TO_DB[type]
  if (!resolvedType) {
    return { mode: 'create', draft: initialDraft, editId: null, editType: null }
  }

  const { data: itemTranslation } = await supabase
    .from('content_item_translations')
    .select('*')
    .eq('content_item_id', id)
    .eq('language_code', 'en')
    .maybeSingle()

  const { data: itemRow } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()

  if (!itemRow) {
    return { mode: 'create', draft: initialDraft, editId: null, editType: null }
  }

  if (resolvedType === 'book') {
    const adminSupabase = createAdminClient()

    const { data: book } = await supabase
      .from('books')
      .select('*')
      .eq('content_item_id', id)
      .maybeSingle()

    const { data: translation } = await supabase
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
          publicationDate: book?.publication_year ? String(book.publication_year) : '',
          pagesCount: '',
          genres,
        },
      },
    }
  }

  if (resolvedType === 'stories') {
    const { data: story } = await supabase
      .from('stories')
      .select('*, story_types(code)')
      .eq('content_item_id', id)
      .single()

    if (!story) {
      return { mode: 'create', draft: initialDraft, editId: null, editType: null }
    }

    const { data: translation } = await supabase
      .from('story_translations')
      .select('*')
      .eq('story_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

    const storyCode = story.story_types?.code ?? 'historical'

    return {
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
    const { data: painting } = await supabase
      .from('paintings')
      .select('*')
      .eq('content_item_id', id)
      .single()

    if (!painting) {
      return { mode: 'create', draft: initialDraft, editId: null, editType: null }
    }

    const { data: translation } = await supabase
      .from('painting_translations')
      .select('*')
      .eq('painting_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

    return {
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
    const { data: artefact } = await supabase
      .from('artefacts')
      .select('*')
      .eq('content_item_id', id)
      .single()

    if (!artefact) {
      return { mode: 'create', draft: initialDraft, editId: null, editType: null }
    }

    const { data: translation } = await supabase
      .from('artefact_translations')
      .select('*')
      .eq('artefact_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

    return {
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
    const { data: biography } = await supabase
      .from('biographies')
      .select('*')
      .eq('content_item_id', id)
      .single()

    if (!biography) {
      return { mode: 'create', draft: initialDraft, editId: null, editType: null }
    }

    const { data: translation } = await supabase
      .from('biography_translations')
      .select('*')
      .eq('biography_content_item_id', id)
      .eq('language_code', 'en')
      .maybeSingle()

    return {
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

  return { mode: 'create', draft: initialDraft, editId: null, editType: null }
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

  const [
    sidebarCounts,
    editState,
    availableBookGenres,
    availableStoryTypes,
    sidebarBookGroups,
  ] = await Promise.all([
    getSidebarCounts(supabase),
    getEditDraft(supabase, resolvedParams.type, resolvedParams.id),
    getAvailableBookGenres(supabase),
    getAvailableStoryTypes(supabase),
    getSidebarBookGroups(supabase),
  ])

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
      sidebarBookGroups={sidebarBookGroups}
      showEditor={editState.mode === 'edit' || createSelected}
    />
  )
}
