import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import {
  isPublicLanguage,
  publicContentHref,
  type PublicArtefactData,
  type PublicBiographyData,
  type PublicBookData,
  type PublicCatalogueItem,
  type PublicContentItemViewModel,
  type PublicContentType,
  type PublicLanguage,
  type PublicLocationSummary,
  type PublicPaintingData,
  type PublicRelatedContent,
  type PublicStoryData,
  type PublicTag,
} from "./types"
import {
  isAudioMedia,
  isImageMedia,
  mapContentMediaRow,
  type ContentMediaRow,
} from "./media"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

type TranslationRow = {
  language_code?: string | null
  title?: string | null
  summary?: string | null
  body?: string | null
  custom_period_label?: string | null
  seo_title?: string | null
  seo_description?: string | null
}

type ContentItemRow = {
  id: string
  content_type_id: number
  content_status_id: number
  slug: string
  featured?: boolean | null
  published_at?: string | null
  start_date_year?: number | null
  start_date_month?: number | null
  start_date_day?: number | null
  start_date_era?: string | null
  end_date_year?: number | null
  end_date_month?: number | null
  end_date_day?: number | null
  end_date_era?: string | null
}

type LocationTranslationRow = {
  language_code?: string | null
  title?: string | null
  description?: string | null
}

type LocationRow = {
  id: string
  slug: string
  address_line_1?: string | null
  address_line_2?: string | null
  town?: string | null
  postcode?: string | null
  latitude: number | string
  longitude: number | string
  location_type?: string | null
  location_translations?: LocationTranslationRow[] | LocationTranslationRow | null
}

type TagRow = {
  id: string
  slug: string
  tag_type?: string | null
}

type TagTranslationRow = {
  tag_id?: string | null
  language_code?: string | null
  name?: string | null
}

type TypeTranslationRow<T extends object> = {
  language_code?: string | null
} & T

function asArray<T>(value: T[] | T | null | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function normalizeLanguage(lang: string): PublicLanguage {
  return isPublicLanguage(lang) ? lang : "en"
}

function toNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null
}

function toPublicContentType(value: string | null | undefined): PublicContentType | null {
  if (
    value === "book" ||
    value === "story" ||
    value === "painting" ||
    value === "artefact" ||
    value === "biography"
  ) {
    return value
  }

  return null
}

function chooseTranslation(rows: TranslationRow[], lang: PublicLanguage) {
  return (
    rows.find((row) => row.language_code === lang) ??
    rows.find((row) => row.language_code === "en") ??
    rows[0] ??
    null
  )
}

function formatDatePart(year?: number | null, month?: number | null, day?: number | null, era?: string | null) {
  if (!year) return null
  const paddedMonth = month ? String(month).padStart(2, "0") : null
  const paddedDay = day ? String(day).padStart(2, "0") : null
  const date = [year, paddedMonth, paddedDay].filter(Boolean).join("-")
  return era && era !== "AD" ? `${date} ${era}` : date
}

function formatContentDateLabel(item: ContentItemRow) {
  const start = formatDatePart(
    item.start_date_year,
    item.start_date_month,
    item.start_date_day,
    item.start_date_era
  )
  const end = formatDatePart(
    item.end_date_year,
    item.end_date_month,
    item.end_date_day,
    item.end_date_era
  )

  if (start && end) return `${start} to ${end}`
  return start ?? end
}

async function getPublicStatusAndType(
  supabase: SupabaseClient,
  item: ContentItemRow
) {
  const [{ data: status }, { data: type }] = await Promise.all([
    supabase
      .from("content_statuses")
      .select("id, code, is_public")
      .eq("id", item.content_status_id)
      .maybeSingle(),
    supabase
      .from("content_types")
      .select("id, code")
      .eq("id", item.content_type_id)
      .maybeSingle(),
  ])

  const contentType = toPublicContentType(type?.code)
  if (!status?.is_public || !contentType || !type?.id) return null

  return {
    contentType: {
      id: type.id as number,
      code: contentType,
    },
    status: {
      id: status.id as number,
      code: String(status.code),
      isPublic: status.is_public === true,
    },
  }
}

async function getContentTranslation(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
) {
  const languages = lang === "en" ? ["en"] : [lang, "en"]
  const { data } = await supabase
    .from("content_item_translations")
    .select(
      "language_code, title, summary, body, custom_period_label, seo_title, seo_description"
    )
    .eq("content_item_id", contentItemId)
    .in("language_code", languages)

  return chooseTranslation((data ?? []) as TranslationRow[], lang)
}

async function getPublicMedia(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
) {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from("content_media")
    .select(
      `
      media_asset_id,
      role,
      sort_order,
      is_primary,
      media_assets (
        id,
        storage_path,
        file_name,
        mime_type,
        width,
        height,
        duration_seconds,
        credit,
        media_asset_translations (
          language_code,
          alt_text,
          caption
        )
      )
    `
    )
    .eq("content_item_id", contentItemId)
    .order("sort_order", { ascending: true })

  const media = (
    await Promise.all(
      ((data ?? []) as ContentMediaRow[]).map((row) => mapContentMediaRow(row, lang))
    )
  )
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const audioMedia =
    media.find((item) => item.role === `audio_${lang}`) ??
    media.find((item) => item.role === "audio") ??
    media.find(isAudioMedia) ??
    null
  const imageMedia = media.filter(isImageMedia)
  const primaryImage =
    imageMedia.find((item) => item.isPrimary) ??
    imageMedia.find((item) => item.role === "primary") ??
    imageMedia[0] ??
    null

  return {
    primaryImage,
    galleryMedia: imageMedia,
    audioMedia,
  }
}

export async function getPublicCatalogueItems(
  type: "book" | "painting",
  lang: string
): Promise<PublicCatalogueItem[]> {
  const language = normalizeLanguage(lang)
  const supabase = await createClient()

  const [{ data: contentType }, { data: publicStatuses }] = await Promise.all([
    supabase.from("content_types").select("id, code").eq("code", type).maybeSingle(),
    supabase.from("content_statuses").select("id").eq("is_public", true),
  ])

  const publicStatusIds = (publicStatuses ?? []).map((status) => status.id as number)
  if (!contentType?.id || publicStatusIds.length === 0) return []

  const { data: items } = await supabase
    .from("content_items")
    .select(
      `
      id,
      content_type_id,
      content_status_id,
      slug,
      featured,
      published_at,
      start_date_year,
      start_date_month,
      start_date_day,
      start_date_era,
      end_date_year,
      end_date_month,
      end_date_day,
      end_date_era
    `
    )
    .eq("content_type_id", contentType.id)
    .in("content_status_id", publicStatusIds)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })

  const catalogueItems: PublicCatalogueItem[] = []

  for (const item of (items ?? []) as ContentItemRow[]) {
    const translation = await getContentTranslation(supabase, item.id, language)
    if (!translation?.title) continue

    const media = await getPublicMedia(supabase, item.id, language)
    let creatorLabel: string | null = null
    let itemDateLabel = formatContentDateLabel(item)

    if (type === "book") {
      const bookData = await getBookData(supabase, item.id, language)
      creatorLabel = toNullableString(bookData?.author)
      itemDateLabel = bookData?.publicationYear
        ? String(bookData.publicationYear)
        : itemDateLabel
    } else {
      const paintingData = await getPaintingData(supabase, item.id, language)
      creatorLabel = toNullableString(paintingData?.artistName)
      itemDateLabel = paintingData?.yearCreated
        ? String(paintingData.yearCreated)
        : itemDateLabel
    }

    catalogueItems.push({
      id: item.id,
      slug: item.slug,
      title: translation.title,
      summary: translation.summary ?? null,
      href: publicContentHref(type, item.slug, language),
      contentType: type,
      creatorLabel,
      dateLabel: itemDateLabel,
      primaryImage: media.primaryImage,
    })
  }

  return catalogueItems.sort((a, b) => a.title.localeCompare(b.title))
}

async function getPublicLocations(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
): Promise<PublicLocationSummary[]> {
  const { data: links } = await supabase
    .from("content_locations")
    .select("location_id, relationship_type, sort_order")
    .eq("content_item_id", contentItemId)
    .order("sort_order", { ascending: true })

  const locationIds = (links ?? []).map((row) => row.location_id as string).filter(Boolean)
  if (locationIds.length === 0) return []

  const { data: locations } = await supabase
    .from("locations")
    .select(
      `
      id,
      slug,
      address_line_1,
      address_line_2,
      town,
      postcode,
      latitude,
      longitude,
      location_type,
      is_published,
      location_translations (
        language_code,
        title,
        description
      )
    `
    )
    .in("id", locationIds)
    .eq("is_published", true)

  const linkByLocationId = new Map(
    (links ?? []).map((row) => [
      row.location_id as string,
      {
        relationshipType: row.relationship_type as string,
        sortOrder: (row.sort_order as number | null) ?? 0,
      },
    ])
  )

  const mappedLocations = ((locations ?? []) as LocationRow[])
    .map((location): PublicLocationSummary & { sortOrder: number } => {
      const translations = asArray(location.location_translations)
      const translation =
        translations.find((row) => row.language_code === lang) ??
        translations.find((row) => row.language_code === "en") ??
        translations[0] ??
        null
      const address = [
        location.address_line_1,
        location.address_line_2,
        location.town,
        location.postcode,
      ]
        .filter(Boolean)
        .join(", ")
      const link = linkByLocationId.get(location.id)

      return {
        id: location.id as string,
        slug: location.slug as string,
        title: translation?.title ?? address ?? "Location",
        description: translation?.description ?? null,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        type: String(location.location_type ?? "site"),
        address: address || null,
        relationshipType: link?.relationshipType,
        sortOrder: link?.sortOrder ?? 0,
      }
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return mappedLocations.map((location) => ({
    id: location.id,
    slug: location.slug,
    title: location.title,
    description: location.description,
    latitude: location.latitude,
    longitude: location.longitude,
    type: location.type,
    address: location.address,
    relationshipType: location.relationshipType,
  }))
}

async function getPublicTags(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
): Promise<PublicTag[]> {
  const { data: links } = await supabase
    .from("content_tags")
    .select("tag_id")
    .eq("content_item_id", contentItemId)

  const tagIds = (links ?? []).map((row) => row.tag_id as string).filter(Boolean)
  if (tagIds.length === 0) return []

  const [{ data: tags }, { data: translations }] = await Promise.all([
    supabase.from("tags").select("id, slug, tag_type").in("id", tagIds),
    supabase
      .from("tag_translations")
      .select("tag_id, language_code, name")
      .in("tag_id", tagIds)
      .in("language_code", lang === "en" ? ["en"] : [lang, "en"]),
  ])

  return ((tags ?? []) as TagRow[]).map((tag) => {
    const translationRows = ((translations ?? []) as TagTranslationRow[]).filter(
      (row) => row.tag_id === tag.id
    )
    const translation =
      translationRows.find((row) => row.language_code === lang) ??
      translationRows.find((row) => row.language_code === "en") ??
      translationRows[0] ??
      null

    return {
      id: tag.id as string,
      slug: tag.slug as string,
      name: translation?.name ?? tag.slug,
      type: String(tag.tag_type ?? "tag"),
    }
  })
}

async function getPublicRelatedContent(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
): Promise<PublicRelatedContent[]> {
  const { data: links } = await supabase
    .from("related_content")
    .select("child_content_item_id, relationship_type, sort_order")
    .eq("parent_content_item_id", contentItemId)
    .order("sort_order", { ascending: true })

  const childIds = (links ?? []).map((row) => row.child_content_item_id as string).filter(Boolean)
  if (childIds.length === 0) return []

  const { data: items } = await supabase
    .from("content_items")
    .select(
      "id, slug, content_type_id, content_status_id, published_at"
    )
    .in("id", childIds)

  const related: PublicRelatedContent[] = []

  for (const item of (items ?? []) as ContentItemRow[]) {
    const visibility = await getPublicStatusAndType(supabase, item)
    if (!visibility) continue

    const translation = await getContentTranslation(supabase, item.id, lang)
    if (!translation?.title) continue

    const link = (links ?? []).find((row) => row.child_content_item_id === item.id)

    related.push({
      id: item.id,
      slug: item.slug,
      title: translation.title,
      summary: translation.summary ?? null,
      contentType: visibility.contentType.code,
      href: publicContentHref(visibility.contentType.code, item.slug, lang),
      relationshipType: String(link?.relationship_type ?? "related"),
    })
  }

  return related
}

async function getPaintingData(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
): Promise<PublicPaintingData | null> {
  const [{ data: painting }, { data: translations }] = await Promise.all([
    supabase
      .from("paintings")
      .select(
        "artist_name, year_created, medium, dimensions, current_collection, image_credit"
      )
      .eq("content_item_id", contentItemId)
      .maybeSingle(),
    supabase
      .from("painting_translations")
      .select("language_code, detail_notes")
      .eq("painting_content_item_id", contentItemId)
      .in("language_code", lang === "en" ? ["en"] : [lang, "en"]),
  ])

  if (!painting) return null
  const translationRows = (translations ?? []) as TypeTranslationRow<{ detail_notes?: string | null }>[]
  const translation =
    translationRows.find((row) => row.language_code === lang) ??
    translationRows.find((row) => row.language_code === "en") ??
    null

  return {
    artistName: painting.artist_name ?? null,
    yearCreated: painting.year_created ?? null,
    medium: painting.medium ?? null,
    dimensions: painting.dimensions ?? null,
    currentCollection: painting.current_collection ?? null,
    imageCredit: painting.image_credit ?? null,
    detailNotes: translation?.detail_notes ?? null,
  }
}

async function getBookData(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
): Promise<PublicBookData | null> {
  const [{ data: book }, { data: translations }] = await Promise.all([
    supabase
      .from("books")
      .select("publication_year, isbn, publisher")
      .eq("content_item_id", contentItemId)
      .maybeSingle(),
    supabase
      .from("book_translations")
      .select("language_code, author, excerpt")
      .eq("book_content_item_id", contentItemId)
      .in("language_code", lang === "en" ? ["en"] : [lang, "en"]),
  ])

  if (!book) return null
  const translationRows = (translations ?? []) as TypeTranslationRow<{
    author?: string | null
    excerpt?: string | null
  }>[]
  const translation =
    translationRows.find((row) => row.language_code === lang) ??
    translationRows.find((row) => row.language_code === "en") ??
    null

  return {
    author: translation?.author ?? null,
    excerpt: translation?.excerpt ?? null,
    publicationYear: book.publication_year ?? null,
    isbn: book.isbn ?? null,
    publisher: book.publisher ?? null,
  }
}

async function getStoryData(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
): Promise<PublicStoryData | null> {
  const [{ data: story }, { data: translations }] = await Promise.all([
    supabase
      .from("stories")
      .select("story_type_id, related_person_name")
      .eq("content_item_id", contentItemId)
      .maybeSingle(),
    supabase
      .from("story_translations")
      .select("language_code, event_details")
      .eq("story_content_item_id", contentItemId)
      .in("language_code", lang === "en" ? ["en"] : [lang, "en"]),
  ])

  if (!story) return null
  const translationRows = (translations ?? []) as TypeTranslationRow<{ event_details?: string | null }>[]
  const translation =
    translationRows.find((row) => row.language_code === lang) ??
    translationRows.find((row) => row.language_code === "en") ??
    null

  return {
    storyTypeId: story.story_type_id ?? null,
    relatedPersonName: story.related_person_name ?? null,
    eventDetails: translation?.event_details ?? null,
  }
}

async function getArtefactData(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
): Promise<PublicArtefactData | null> {
  const [{ data: artefact }, { data: translations }] = await Promise.all([
    supabase
      .from("artefacts")
      .select(
        "maker, origin_place, date_created_label, material, dimensions, collection_holder, catalogue_reference"
      )
      .eq("content_item_id", contentItemId)
      .maybeSingle(),
    supabase
      .from("artefact_translations")
      .select("language_code, notes")
      .eq("artefact_content_item_id", contentItemId)
      .in("language_code", lang === "en" ? ["en"] : [lang, "en"]),
  ])

  if (!artefact) return null
  const translationRows = (translations ?? []) as TypeTranslationRow<{ notes?: string | null }>[]
  const translation =
    translationRows.find((row) => row.language_code === lang) ??
    translationRows.find((row) => row.language_code === "en") ??
    null

  return {
    maker: artefact.maker ?? null,
    originPlace: artefact.origin_place ?? null,
    dateCreatedLabel: artefact.date_created_label ?? null,
    material: artefact.material ?? null,
    dimensions: artefact.dimensions ?? null,
    collectionHolder: artefact.collection_holder ?? null,
    catalogueReference: artefact.catalogue_reference ?? null,
    notes: translation?.notes ?? null,
  }
}

async function getBiographyData(
  supabase: SupabaseClient,
  contentItemId: string,
  lang: PublicLanguage
): Promise<PublicBiographyData | null> {
  const [{ data: biography }, { data: translations }] = await Promise.all([
    supabase
      .from("biographies")
      .select("person_name, birth_year, death_year, birth_place")
      .eq("content_item_id", contentItemId)
      .maybeSingle(),
    supabase
      .from("biography_translations")
      .select("language_code, occupation, biography_text")
      .eq("biography_content_item_id", contentItemId)
      .in("language_code", lang === "en" ? ["en"] : [lang, "en"]),
  ])

  if (!biography?.person_name) return null
  const translationRows = (translations ?? []) as TypeTranslationRow<{
    occupation?: string | null
    biography_text?: string | null
  }>[]
  const translation =
    translationRows.find((row) => row.language_code === lang) ??
    translationRows.find((row) => row.language_code === "en") ??
    null

  return {
    personName: biography.person_name,
    birthYear: biography.birth_year ?? null,
    deathYear: biography.death_year ?? null,
    birthPlace: biography.birth_place ?? null,
    occupation: translation?.occupation ?? null,
    biographyText: translation?.biography_text ?? null,
  }
}

async function getTypeSpecificData(
  supabase: SupabaseClient,
  contentItemId: string,
  type: PublicContentType,
  lang: PublicLanguage
) {
  if (type === "painting") {
    return { painting: await getPaintingData(supabase, contentItemId, lang) }
  }
  if (type === "book") {
    return { book: await getBookData(supabase, contentItemId, lang) }
  }
  if (type === "story") {
    return { story: await getStoryData(supabase, contentItemId, lang) }
  }
  if (type === "artefact") {
    return { artefact: await getArtefactData(supabase, contentItemId, lang) }
  }

  return { biography: await getBiographyData(supabase, contentItemId, lang) }
}

export async function getPublicContentItemBySlug(
  slug: string,
  lang: string
): Promise<PublicContentItemViewModel | null> {
  const language = normalizeLanguage(lang)
  const supabase = await createClient()

  const { data: item } = await supabase
    .from("content_items")
    .select(
      `
      id,
      content_type_id,
      content_status_id,
      slug,
      featured,
      published_at,
      start_date_year,
      start_date_month,
      start_date_day,
      start_date_era,
      end_date_year,
      end_date_month,
      end_date_day,
      end_date_era
    `
    )
    .eq("slug", slug)
    .maybeSingle()

  if (!item) return null

  const visibility = await getPublicStatusAndType(supabase, item as ContentItemRow)
  if (!visibility) return null

  const translation = await getContentTranslation(supabase, item.id, language)
  if (!translation?.title) return null

  const [
    media,
    locations,
    relatedContent,
    tags,
    typeSpecificData,
  ] = await Promise.all([
    getPublicMedia(supabase, item.id, language),
    getPublicLocations(supabase, item.id, language),
    getPublicRelatedContent(supabase, item.id, language),
    getPublicTags(supabase, item.id, language),
    getTypeSpecificData(supabase, item.id, visibility.contentType.code, language),
  ])

  return {
    id: item.id,
    slug: item.slug,
    language,
    contentType: visibility.contentType,
    status: visibility.status,
    title: translation.title,
    summary: translation.summary ?? null,
    body: translation.body ?? null,
    seoTitle: translation.seo_title ?? null,
    seoDescription: translation.seo_description ?? null,
    customPeriodLabel: translation.custom_period_label ?? null,
    featured: item.featured === true,
    publishedAt: item.published_at ?? null,
    dateLabel: formatContentDateLabel(item as ContentItemRow),
    primaryImage: media.primaryImage,
    galleryMedia: media.galleryMedia,
    audioMedia: media.audioMedia,
    locations,
    relatedContent,
    tags,
    ...(typeSpecificData.painting ? { painting: typeSpecificData.painting } : {}),
    ...(typeSpecificData.book ? { book: typeSpecificData.book } : {}),
    ...(typeSpecificData.story ? { story: typeSpecificData.story } : {}),
    ...(typeSpecificData.artefact ? { artefact: typeSpecificData.artefact } : {}),
    ...(typeSpecificData.biography ? { biography: typeSpecificData.biography } : {}),
  }
}

export function getContentCreatorLabel(content: PublicContentItemViewModel) {
  return (
    toNullableString(content.painting?.artistName) ??
    toNullableString(content.book?.author) ??
    toNullableString(content.artefact?.maker) ??
    toNullableString(content.story?.relatedPersonName) ??
    toNullableString(content.biography?.personName)
  )
}
