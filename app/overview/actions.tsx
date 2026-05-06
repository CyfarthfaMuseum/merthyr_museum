'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import type { ContentType, OverviewDraft } from './types'

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

type SaveArgs = {
  draft: OverviewDraft
  mode: 'create' | 'edit'
  editId?: string | null
  languageCode?: string
  pendingMediaAssetIds?: string[]
}

const CONTENT_TYPE_CODE_MAP: Record<ContentType, string> = {
  book: 'book',
  stories: 'story',
  painting: 'painting',
  artifacts: 'artefact',
  bio: 'biography',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

async function getContentTypeId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string
) {
  const { data, error } = await supabase
    .from('content_types')
    .select('id')
    .eq('code', code)
    .single()

  if (error || !data) {
    throw new Error(`Could not find content type "${code}".`)
  }

  return data.id as number
}

async function getContentStatusId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string
) {
  const { data, error } = await supabase
    .from('content_statuses')
    .select('id')
    .eq('code', code)
    .single()

  if (error || !data) {
    throw new Error(`Could not find content status "${code}".`)
  }

  return data.id as number
}

async function getStoryTypeId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string
) {
  const { data, error } = await supabase
    .from('story_types')
    .select('id')
    .eq('code', code)
    .single()

  if (error || !data) {
    throw new Error(`Could not find story type "${code}".`)
  }

  return data.id as number
}

async function ensureActiveAdminAccess(userId: string) {
  const adminSupabase = createAdminClient()

  const { data: adminUser, error } = await adminSupabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .eq('status', 'active')
    .in('role', ['super_admin', 'admin', 'editor'])
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!adminUser) {
    throw new Error('You do not have permission to manage book genres.')
  }
}

async function upsertContentItemTranslation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contentItemId: string,
  languageCode: string,
  values: {
    title: string
    summary?: string | null
    body?: string | null
    customPeriodLabel?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
  }
) {
  const { error } = await supabase.from('content_item_translations').upsert(
    {
      content_item_id: contentItemId,
      language_code: languageCode,
      title: values.title,
      summary: values.summary ?? null,
      body: values.body ?? null,
      custom_period_label: values.customPeriodLabel ?? null,
      seo_title: values.seoTitle ?? null,
      seo_description: values.seoDescription ?? null,
    },
    { onConflict: 'content_item_id,language_code' }
  )

  if (error) {
    throw new Error(error.message)
  }
}

async function syncBookGenres(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bookContentItemId: string,
  genreTitles: string[],
  languageCode: string
) {
  const { data: existingLinks, error: existingLinksError } = await supabase
    .from('book_theme_books')
    .select('book_theme_id')
    .eq('book_content_item_id', bookContentItemId)

  if (existingLinksError) {
    throw new Error(existingLinksError.message)
  }

  const { data: matchedGenres, error: genreLookupError } = await supabase
    .from('book_theme_translations')
    .select('book_theme_id, title')
    .eq('language_code', languageCode)
    .in('title', genreTitles.length ? genreTitles : ['___none___'])

  if (genreLookupError) {
    throw new Error(genreLookupError.message)
  }

  const desiredGenreIds = new Set(
    (matchedGenres ?? []).map((row) => row.book_theme_id as string)
  )
  const existingGenreIds = new Set(
    (existingLinks ?? []).map((row) => row.book_theme_id as string)
  )

  const toDelete = [...existingGenreIds].filter((id) => !desiredGenreIds.has(id))
  const toInsert = [...desiredGenreIds].filter((id) => !existingGenreIds.has(id))

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from('book_theme_books')
      .delete()
      .eq('book_content_item_id', bookContentItemId)
      .in('book_theme_id', toDelete)

    if (error) {
      throw new Error(error.message)
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('book_theme_books').insert(
      toInsert.map((genreId) => ({
        book_theme_id: genreId,
        book_content_item_id: bookContentItemId,
      }))
    )

    if (error) {
      throw new Error(error.message)
    }
  }
}

async function getUniqueBookThemeSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  desiredSlug: string
) {
  const { data: existingRows, error } = await supabase
    .from('book_themes')
    .select('slug')
    .like('slug', `${desiredSlug}%`)

  if (error) {
    throw new Error(error.message)
  }

  const existingSlugs = new Set((existingRows ?? []).map((row) => row.slug as string))

  if (!existingSlugs.has(desiredSlug)) {
    return desiredSlug
  }

  let suffix = 2
  while (existingSlugs.has(`${desiredSlug}-${suffix}`)) {
    suffix += 1
  }

  return `${desiredSlug}-${suffix}`
}

async function getUniqueContentItemSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  desiredSlug: string,
  excludingContentItemId?: string | null
) {
  const baseSlug = slugify(desiredSlug) || 'untitled'

  let query = supabase
    .from('content_items')
    .select('id, slug')
    .like('slug', `${baseSlug}%`)

  if (excludingContentItemId) {
    query = query.neq('id', excludingContentItemId)
  }

  const { data: existingRows, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const existingSlugs = new Set((existingRows ?? []).map((row) => row.slug as string))

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug
  }

  let suffix = 2
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1
  }

  return `${baseSlug}-${suffix}`
}

async function linkMediaAssetsToContentItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contentItemId: string,
  mediaAssetIds: string[]
) {
  const uniqueMediaAssetIds = [...new Set(mediaAssetIds.filter(Boolean))]

  if (uniqueMediaAssetIds.length === 0) {
    return
  }

  const { data: existingLinks, error: existingLinksError } = await supabase
    .from('content_media')
    .select('media_asset_id')
    .eq('content_item_id', contentItemId)
    .in('media_asset_id', uniqueMediaAssetIds)

  if (existingLinksError) {
    throw new Error(existingLinksError.message)
  }

  const linkedAssetIds = new Set((existingLinks ?? []).map((row) => row.media_asset_id as string))
  const mediaAssetIdsToInsert = uniqueMediaAssetIds.filter((id) => !linkedAssetIds.has(id))

  if (mediaAssetIdsToInsert.length === 0) {
    return
  }

  const { data: highestSortRow, error: sortLookupError } = await supabase
    .from('content_media')
    .select('sort_order')
    .eq('content_item_id', contentItemId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sortLookupError) {
    throw new Error(sortLookupError.message)
  }

  const baseSortOrder = Number(highestSortRow?.sort_order ?? -1)

  const { error: insertError } = await supabase.from('content_media').insert(
    mediaAssetIdsToInsert.map((mediaAssetId, index) => ({
      content_item_id: contentItemId,
      media_asset_id: mediaAssetId,
      role: 'other',
      sort_order: baseSortOrder + index + 1,
      is_primary: false,
    }))
  )

  if (insertError) {
    throw new Error(insertError.message)
  }
}

export async function createBookGenreAction(args: {
  title: string
  languageCode?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to create a genre.' }
  }

  try {
    await ensureActiveAdminAccess(user.id)

    const adminSupabase: Awaited<ReturnType<typeof createClient>> = createAdminClient()
    const languageCode = args.languageCode ?? 'en'
    const title = args.title.trim()

    if (!title) {
      return { success: false, error: 'Genre title is required.' }
    }

    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Step 1: existing translation check
    const { data: existingTranslations, error: existingTranslationsError } = await adminSupabase
      .from('book_theme_translations')
      .select('book_theme_id, title')
      .eq('language_code', languageCode)
      .ilike('title', title)
      .limit(1)

    if (existingTranslationsError) {
      console.error('Step 1 failed', existingTranslationsError)
      return { success: false, error: `Step 1 failed: ${existingTranslationsError.message}` }
    }

    const existingTranslation = existingTranslations?.[0]
    if (existingTranslation?.book_theme_id) {
      return {
        success: true,
        genreTitle: existingTranslation.title,
        alreadyExisted: true,
      }
    }

    // Step 2: find draft status without single()
    const { data: draftStatuses, error: draftStatusError } = await adminSupabase
      .from('content_statuses')
      .select('id, code')
      .eq('code', 'draft')
      .limit(2)

    if (draftStatusError) {
      console.error('Step 2 failed', draftStatusError)
      return { success: false, error: `Step 2 failed: ${draftStatusError.message}` }
    }

    if (!draftStatuses || draftStatuses.length === 0) {
      return { success: false, error: 'Step 2 failed: no draft content status found.' }
    }

    if (draftStatuses.length > 1) {
      return { success: false, error: 'Step 2 failed: multiple draft content statuses found.' }
    }

    const draftStatus = draftStatuses[0]

    // Step 3: check existing theme by slug without maybeSingle()
    const { data: existingThemes, error: existingThemeError } = await adminSupabase
      .from('book_themes')
      .select('id, slug')
      .eq('slug', baseSlug)
      .limit(1)

    if (existingThemeError) {
      console.error('Step 3 failed', existingThemeError)
      return { success: false, error: `Step 3 failed: ${existingThemeError.message}` }
    }

    let bookThemeId = existingThemes?.[0]?.id as string | undefined

    // Step 4: create parent theme row
    if (!bookThemeId) {
      const slug = await getUniqueBookThemeSlug(adminSupabase, baseSlug || 'genre')
      const { data: insertedThemes, error: insertError } = await adminSupabase
        .from('book_themes')
        .insert({
          slug,
          content_status_id: draftStatus.id,
          created_by: user.id,
          updated_by: user.id,
        })
        .select('id, slug')
        .limit(1)

      if (insertError) {
        console.error('Step 4 failed', insertError)
        return { success: false, error: `Step 4 failed: ${insertError.message}` }
      }

      if (!insertedThemes || insertedThemes.length === 0) {
        return {
          success: false,
          error: 'Step 4 failed: theme inserted but no row was returned. Check RLS/select policy.',
        }
      }

      bookThemeId = insertedThemes[0].id
    }

    // Step 5: create translation row
    const { error: translationError } = await adminSupabase
      .from('book_theme_translations')
      .insert({
        book_theme_id: bookThemeId,
        language_code: languageCode,
        title,
        summary: null,
        body: null,
      })

    if (translationError) {
      console.error('Step 5 failed', translationError)
      return { success: false, error: `Step 5 failed: ${translationError.message}` }
    }

    revalidatePath('/overview')

    return {
      success: true,
      genreTitle: title,
      alreadyExisted: false,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create genre.',
    }
  }
}

export async function createStoryTypeAction(args: { label: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in to create a story type.' }

  try {
    await ensureActiveAdminAccess(user.id)
    const adminSupabase: Awaited<ReturnType<typeof createClient>> = createAdminClient()
    const title = args.label.trim()
    if (!title) return { success: false, error: 'Story type name is required.' }
    const code = toCode(title)

    const { data: existingByCode } = await adminSupabase
      .from('story_types')
      .select('id, code')
      .eq('code', code)
      .limit(1)

    const existingStoryType = existingByCode?.[0]
    if (existingStoryType?.id && existingStoryType?.code) {
      const { data: translation } = await adminSupabase
        .from('story_type_translations')
        .select('label')
        .eq('story_type_id', existingStoryType.id)
        .eq('language_code', 'en')
        .maybeSingle()

      return {
        success: true,
        alreadyExisted: true,
        storyType: {
          code: existingStoryType.code,
          label: translation?.label ?? existingStoryType.code,
        },
      }
    }

    const { data: inserted, error: storyTypeError } = await adminSupabase
      .from('story_types')
      .insert({ code, sort_order: 0 })
      .select('id, code')
      .single()

    if (storyTypeError || !inserted) {
      return { success: false, error: storyTypeError?.message ?? 'Failed to create story type.' }
    }

    const { error: translationError } = await adminSupabase.from('story_type_translations').insert({
      story_type_id: inserted.id,
      language_code: 'en',
      label: title,
    })

    if (translationError) {
      return {
        success: false,
        error: `Story type was created but label could not be saved: ${translationError.message}`,
      }
    }

    revalidatePath('/overview')
    return { success: true, alreadyExisted: false, storyType: { code: inserted.code, label: title } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create story type.' }
  }
}

export async function saveContentAction({
  draft,
  mode,
  editId,
  languageCode = 'en',
  pendingMediaAssetIds = [],
}: SaveArgs): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to save.' }
  }

  try {
    await ensureActiveAdminAccess(user.id)

    const adminSupabase = createAdminClient()

    const contentTypeId = await getContentTypeId(
      adminSupabase,
      CONTENT_TYPE_CODE_MAP[draft.contentType]
    )
    const contentStatusId = await getContentStatusId(
      adminSupabase,
      draft.isPublished ? 'published' : 'draft'
    )

    let contentItemId = editId ?? null
    const uniqueSlug = await getUniqueContentItemSlug(
      adminSupabase,
      draft.slug,
      mode === 'edit' ? contentItemId : null
    )

    if (mode === 'create') {
      const newContentItemId = randomUUID()

      const { error } = await adminSupabase
        .from('content_items')
        .insert({
          id: newContentItemId,
          content_type_id: contentTypeId,
          content_status_id: contentStatusId,
          slug: uniqueSlug,
          featured: draft.isFeatured,
          created_by: user.id,
          updated_by: user.id,
          published_by: draft.isPublished ? user.id : null,
          published_at: draft.isPublished ? new Date().toISOString() : null,
        })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      contentItemId = newContentItemId
    } else {
      if (!contentItemId) {
        return { success: false, error: 'Missing content item id for edit.' }
      }

      const { error } = await adminSupabase
        .from('content_items')
        .update({
          content_type_id: contentTypeId,
          content_status_id: contentStatusId,
          slug: uniqueSlug,
          featured: draft.isFeatured,
          updated_by: user.id,
          published_by: draft.isPublished ? user.id : null,
          published_at: draft.isPublished ? new Date().toISOString() : null,
        })
        .eq('id', contentItemId)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    if (!contentItemId) {
      return { success: false, error: 'Content item id was not created.' }
    }

    await linkMediaAssetsToContentItem(adminSupabase, contentItemId, pendingMediaAssetIds)

    if (draft.contentType === 'book') {
      const publicationYear = draft.book.publicationDate
        ? Number(String(draft.book.publicationDate).slice(0, 4))
        : null

      const { error: bookError } = await adminSupabase.from('books').upsert(
        {
          content_item_id: contentItemId,
          publication_year: Number.isFinite(publicationYear) ? publicationYear : null,
          isbn: draft.book.isbn || null,
          publisher: draft.book.publisher || null,
        },
        { onConflict: 'content_item_id' }
      )

      if (bookError) {
        return { success: false, error: bookError.message }
      }

      const { error: translationError } = await adminSupabase
        .from('book_translations')
        .upsert(
          {
            book_content_item_id: contentItemId,
            language_code: languageCode,
            author: draft.book.author || null,
            excerpt: draft.book.summary || null,
          },
          { onConflict: 'book_content_item_id,language_code' }
        )

      if (translationError) {
        return { success: false, error: translationError.message }
      }

      await upsertContentItemTranslation(adminSupabase, contentItemId, languageCode, {
        title: draft.book.title,
        summary: draft.book.summary || null,
        body: draft.book.exposition || null,
        seoTitle: draft.seoTitle || draft.book.title,
        seoDescription: draft.seoDescription || draft.book.summary || null,
      })

      await syncBookGenres(adminSupabase, contentItemId, draft.book.genres, languageCode)
    }

    if (draft.contentType === 'stories') {
      const storyTypeId = await getStoryTypeId(adminSupabase, draft.story.storyType)

      const { error: storyError } = await adminSupabase.from('stories').upsert(
        {
          content_item_id: contentItemId,
          story_type_id: storyTypeId,
          related_person_name: null,
        },
        { onConflict: 'content_item_id' }
      )

      if (storyError) {
        return { success: false, error: storyError.message }
      }

      const { error: translationError } = await adminSupabase
        .from('story_translations')
        .upsert(
          {
            story_content_item_id: contentItemId,
            language_code: languageCode,
            event_details: draft.story.exposition || null,
          },
          { onConflict: 'story_content_item_id,language_code' }
        )

      if (translationError) {
        return { success: false, error: translationError.message }
      }

      await upsertContentItemTranslation(adminSupabase, contentItemId, languageCode, {
        title: draft.story.title,
        summary: draft.story.summary || null,
        body: draft.story.exposition || null,
        seoTitle: draft.seoTitle || draft.story.title,
        seoDescription: draft.seoDescription || draft.story.summary || null,
      })
    }

    if (draft.contentType === 'painting') {
      const yearCreated = draft.painting.yearCreated
        ? Number(draft.painting.yearCreated)
        : null

      const { error: paintingError } = await adminSupabase.from('paintings').upsert(
        {
          content_item_id: contentItemId,
          artist_name: draft.painting.artist || null,
          year_created: Number.isFinite(yearCreated) ? yearCreated : null,
          medium: draft.painting.medium || null,
          dimensions: draft.painting.dimensions || null,
          current_collection: null,
          image_credit: null,
        },
        { onConflict: 'content_item_id' }
      )

      if (paintingError) {
        return { success: false, error: paintingError.message }
      }

      const { error: translationError } = await adminSupabase
        .from('painting_translations')
        .upsert(
          {
            painting_content_item_id: contentItemId,
            language_code: languageCode,
            detail_notes: draft.painting.description || null,
          },
          { onConflict: 'painting_content_item_id,language_code' }
        )

      if (translationError) {
        return { success: false, error: translationError.message }
      }

      await upsertContentItemTranslation(adminSupabase, contentItemId, languageCode, {
        title: draft.painting.title,
        summary: draft.painting.description || null,
        body: draft.painting.description || null,
        seoTitle: draft.seoTitle || draft.painting.title,
        seoDescription: draft.seoDescription || draft.painting.description || null,
      })
    }

    if (draft.contentType === 'artifacts') {
      const { error: artefactError } = await adminSupabase.from('artefacts').upsert(
        {
          content_item_id: contentItemId,
          maker: null,
          origin_place: null,
          date_created_label: draft.artifact.datePeriod || null,
          material: draft.artifact.material || null,
          dimensions: draft.artifact.dimensions || null,
          collection_holder: null,
          catalogue_reference: null,
        },
        { onConflict: 'content_item_id' }
      )

      if (artefactError) {
        return { success: false, error: artefactError.message }
      }

      const { error: translationError } = await adminSupabase
        .from('artefact_translations')
        .upsert(
          {
            artefact_content_item_id: contentItemId,
            language_code: languageCode,
            notes: draft.artifact.description || null,
          },
          { onConflict: 'artefact_content_item_id,language_code' }
        )

      if (translationError) {
        return { success: false, error: translationError.message }
      }

      await upsertContentItemTranslation(adminSupabase, contentItemId, languageCode, {
        title: draft.artifact.title,
        summary: draft.artifact.description || null,
        body: draft.artifact.description || null,
        seoTitle: draft.seoTitle || draft.artifact.title,
        seoDescription: draft.seoDescription || draft.artifact.description || null,
      })
    }

    if (draft.contentType === 'bio') {
      const birthYear = draft.bio.birthDate
        ? Number(String(draft.bio.birthDate).slice(0, 4))
        : null
      const deathYear = draft.bio.deathDate
        ? Number(String(draft.bio.deathDate).slice(0, 4))
        : null

      const { error: biographyError } = await adminSupabase.from('biographies').upsert(
        {
          content_item_id: contentItemId,
          person_name: draft.bio.name,
          birth_year: Number.isFinite(birthYear) ? birthYear : null,
          death_year: Number.isFinite(deathYear) ? deathYear : null,
          birth_place: null,
        },
        { onConflict: 'content_item_id' }
      )

      if (biographyError) {
        return { success: false, error: biographyError.message }
      }

      const { error: translationError } = await adminSupabase
        .from('biography_translations')
        .upsert(
          {
            biography_content_item_id: contentItemId,
            language_code: languageCode,
            occupation: draft.bio.occupation || null,
            biography_text: draft.bio.content || null,
          },
          { onConflict: 'biography_content_item_id,language_code' }
        )

      if (translationError) {
        return { success: false, error: translationError.message }
      }

      await upsertContentItemTranslation(adminSupabase, contentItemId, languageCode, {
        title: draft.bio.name,
        summary: draft.bio.summary || null,
        body: draft.bio.content || null,
        seoTitle: draft.seoTitle || draft.bio.name,
        seoDescription: draft.seoDescription || draft.bio.summary || null,
      })
    }

    revalidatePath('/overview')
    return { success: true, id: contentItemId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected save error.',
    }
  }
}
