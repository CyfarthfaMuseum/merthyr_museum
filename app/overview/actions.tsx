'use server'

import { revalidatePath } from 'next/cache'
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
}

const CONTENT_TYPE_CODE_MAP: Record<ContentType, string> = {
  book: 'book',
  stories: 'story',
  painting: 'painting',
  artifacts: 'artefact',
  bio: 'biography',
}

const STORY_TYPE_CODE_MAP: Record<string, string> = {
  myth: 'myth',
  historical: 'historical',
  period: 'period',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

export async function createBookGenreAction(args: {
  title: string
  languageCode?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to create a genre.' as const }
  }

  const languageCode = args.languageCode ?? 'en'
  const title = args.title.trim()

  if (!title) {
    return { success: false, error: 'Genre title is required.' as const }
  }

 const { data: existingTranslations, error: existingError } = await supabase
  .from('book_theme_translations')
  .select('book_theme_id, title')
  .eq('language_code', languageCode)
  .ilike('title', title)
  .limit(1)

if (existingError) {
  return { success: false, error: existingError.message as const }
}

const existingTranslation = existingTranslations?.[0]

if (existingTranslation?.book_theme_id) {
  return {
    success: true,
    genreTitle: existingTranslation.title,
    alreadyExisted: true as const,
  }
}

  const baseSlug = slugify(title)

  const { data: draftStatus, error: draftStatusError } = await supabase
    .from('content_statuses')
    .select('id')
    .eq('code', 'draft')
    .single()

  if (draftStatusError || !draftStatus) {
    return {
      success: false,
      error: draftStatusError?.message ?? 'Could not find draft content status.',
    }
  }

  let bookThemeId: string | null = null

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`
    const candidateId = crypto.randomUUID()

    const { error: themeError } = await supabase.from('book_themes').insert({
      id: candidateId,
      slug,
      content_status_id: draftStatus.id,
      created_by: user.id,
      updated_by: user.id,
    })

    if (!themeError) {
      bookThemeId = candidateId
      break
    }

    const isSlugCollision =
      themeError.code === '23505' && themeError.message.toLowerCase().includes('slug')

    if (!isSlugCollision) {
      return {
        success: false,
        error: themeError.message,
      }
    }
  }

  if (!bookThemeId) {
    return {
      success: false,
      error: 'Failed to create genre slug after multiple attempts.',
    }
  }

  const { error: translationError } = await supabase
    .from('book_theme_translations')
    .insert({
      book_theme_id: bookThemeId,
      language_code: languageCode,
      title,
      summary: null,
      body: null,
    })

  if (translationError) {
    return {
      success: false,
      error: translationError.message,
    }
  }

  revalidatePath('/overview')

  return {
    success: true,
    genreTitle: title,
    alreadyExisted: false as const,
  }
}

export async function saveContentAction({
  draft,
  mode,
  editId,
  languageCode = 'en',
}: SaveArgs): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to save.' }
  }

  try {
    const contentTypeId = await getContentTypeId(
      supabase,
      CONTENT_TYPE_CODE_MAP[draft.contentType]
    )
    const contentStatusId = await getContentStatusId(
      supabase,
      draft.isPublished ? 'published' : 'draft'
    )

    let contentItemId = editId ?? null

    if (mode === 'create') {
      const { data, error } = await supabase
        .from('content_items')
        .insert({
          content_type_id: contentTypeId,
          content_status_id: contentStatusId,
          slug: draft.slug.trim(),
          featured: draft.isFeatured,
          created_by: user.id,
          updated_by: user.id,
          published_by: draft.isPublished ? user.id : null,
          published_at: draft.isPublished ? new Date().toISOString() : null,
        })
        .select('id')
        .single()

      if (error || !data) {
        return {
          success: false,
          error: error?.message ?? 'Failed to create content item.',
        }
      }

      contentItemId = data.id
    } else {
      if (!contentItemId) {
        return { success: false, error: 'Missing content item id for edit.' }
      }

      const { error } = await supabase
        .from('content_items')
        .update({
          content_type_id: contentTypeId,
          content_status_id: contentStatusId,
          slug: draft.slug.trim(),
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

    if (draft.contentType === 'book') {
      const publicationYear = draft.book.publicationDate
        ? Number(String(draft.book.publicationDate).slice(0, 4))
        : null

      const { error: bookError } = await supabase.from('books').upsert(
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

      const { error: translationError } = await supabase
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

      await upsertContentItemTranslation(supabase, contentItemId, languageCode, {
        title: draft.book.title,
        summary: draft.book.summary || null,
        body: draft.book.exposition || null,
        seoTitle: draft.seoTitle || draft.book.title,
        seoDescription: draft.seoDescription || draft.book.summary || null,
      })

      await syncBookGenres(supabase, contentItemId, draft.book.genres, languageCode)
    }

    if (draft.contentType === 'stories') {
      const storyTypeId = await getStoryTypeId(
        supabase,
        STORY_TYPE_CODE_MAP[draft.story.storyType]
      )

      const { error: storyError } = await supabase.from('stories').upsert(
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

      const { error: translationError } = await supabase
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

      await upsertContentItemTranslation(supabase, contentItemId, languageCode, {
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

      const { error: paintingError } = await supabase.from('paintings').upsert(
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

      const { error: translationError } = await supabase
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

      await upsertContentItemTranslation(supabase, contentItemId, languageCode, {
        title: draft.painting.title,
        summary: draft.painting.description || null,
        body: draft.painting.description || null,
        seoTitle: draft.seoTitle || draft.painting.title,
        seoDescription: draft.seoDescription || draft.painting.description || null,
      })
    }

    if (draft.contentType === 'artifacts') {
      const { error: artefactError } = await supabase.from('artefacts').upsert(
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

      const { error: translationError } = await supabase
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

      await upsertContentItemTranslation(supabase, contentItemId, languageCode, {
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

      const { error: biographyError } = await supabase.from('biographies').upsert(
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

      const { error: translationError } = await supabase
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

      await upsertContentItemTranslation(supabase, contentItemId, languageCode, {
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
