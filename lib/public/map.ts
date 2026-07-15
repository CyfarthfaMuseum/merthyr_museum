import { createPublicClient } from "@/utils/supabase/public"
import {
  isPublicLanguage,
  publicContentHref,
  type PublicContentType,
  type PublicLanguage,
  type PublicLocationWithContent,
  type PublicMapContentSummary,
  type PublicMapLocation,
  type PublicMedia,
} from "./types"
import { type ContentMediaRow, isImageMedia, mapContentMediaRow } from "./media"

type SupabaseClient = ReturnType<typeof createPublicClient>

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

type ContentTranslationRow = {
  content_item_id?: string | null
  language_code?: string | null
  title?: string | null
}

function normalizeLanguage(lang: string): PublicLanguage {
  return isPublicLanguage(lang) ? lang : "en"
}

function asArray<T>(value: T[] | T | null | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
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

function addressFor(location: LocationRow) {
  return [
    location.address_line_1,
    location.address_line_2,
    location.town,
    location.postcode,
  ]
    .filter(Boolean)
    .join(", ")
}

async function batchFetchMedia(
  supabase: SupabaseClient,
  contentItemIds: string[],
  lang: PublicLanguage
): Promise<Map<string, { primaryImage: PublicMedia | null; galleryMedia: PublicMedia[] }>> {
  if (contentItemIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from("content_media")
    .select(
      `
      content_item_id,
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
    .in("content_item_id", contentItemIds)
    .order("sort_order", { ascending: true })

  if (error) console.error("[map:media] query error:", error)

  const rowsByItemId = new Map<string, ContentMediaRow[]>()
  for (const row of (data ?? []) as (ContentMediaRow & { content_item_id: string })[]) {
    const itemId = (row as unknown as { content_item_id: string }).content_item_id
    const existing = rowsByItemId.get(itemId) ?? []
    existing.push(row)
    rowsByItemId.set(itemId, existing)
  }

  const result = new Map<string, { primaryImage: PublicMedia | null; galleryMedia: PublicMedia[] }>()

  await Promise.all(
    Array.from(rowsByItemId.entries()).map(async ([itemId, rows]) => {
      const mediaItems = (await Promise.all(rows.map((row) => mapContentMediaRow(row, lang))))
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .filter((m) => isImageMedia(m))

      const primaryImage = mediaItems.find((m) => m.isPrimary) ?? mediaItems[0] ?? null
      result.set(itemId, { primaryImage, galleryMedia: mediaItems })
    })
  )

  return result
}

async function getPublicContentSummaries(
  supabase: SupabaseClient,
  contentItemIds: string[],
  lang: PublicLanguage
) {
  if (contentItemIds.length === 0) return new Map<string, PublicMapContentSummary>()

  const [{ data: items }, { data: statuses }, { data: types }, { data: translations }, mediaByItemId] =
    await Promise.all([
      supabase
        .from("content_items")
        .select("id, slug, content_type_id, content_status_id")
        .in("id", contentItemIds),
      supabase.from("content_statuses").select("id, is_public"),
      supabase.from("content_types").select("id, code"),
      supabase
        .from("content_item_translations")
        .select("content_item_id, language_code, title")
        .in("content_item_id", contentItemIds)
        .in("language_code", lang === "en" ? ["en"] : [lang, "en"]),
      batchFetchMedia(supabase, contentItemIds, lang),
    ])

  const publicStatusIds = new Set(
    (statuses ?? [])
      .filter((status) => status.is_public === true)
      .map((status) => status.id as number)
  )
  const typeById = new Map(
    (types ?? []).map((type) => [type.id as number, toPublicContentType(type.code)])
  )
  const translationsByItemId = new Map<string, ContentTranslationRow[]>()
  for (const translation of translations ?? []) {
    const contentItemId = translation.content_item_id as string
    translationsByItemId.set(contentItemId, [
      ...(translationsByItemId.get(contentItemId) ?? []),
      translation,
    ])
  }

  const summaries = new Map<string, PublicMapContentSummary>()

  for (const item of items ?? []) {
    if (!publicStatusIds.has(item.content_status_id as number)) continue

    const contentType = typeById.get(item.content_type_id as number)
    if (!contentType) continue

    const itemTranslations = translationsByItemId.get(item.id as string) ?? []
    const translation =
      itemTranslations.find((row) => row.language_code === lang) ??
      itemTranslations.find((row) => row.language_code === "en") ??
      itemTranslations[0] ??
      null

    if (!translation?.title) continue

    const media = mediaByItemId.get(item.id as string) ?? { primaryImage: null, galleryMedia: [] }
    summaries.set(item.id as string, {
      id: item.id as string,
      slug: item.slug as string,
      title: translation.title as string,
      contentType,
      href: publicContentHref(contentType, item.slug, lang),
      primaryImage: media.primaryImage,
      galleryMedia: media.galleryMedia,
    })
  }

  return summaries
}

export async function getPublicMapLocations(lang: string): Promise<PublicMapLocation[]> {
  const language = normalizeLanguage(lang)
  const supabase = createPublicClient()

  const { data: locations, error: locationsError } = await supabase
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
    .eq("is_published", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("slug", { ascending: true })

  if (locationsError) {
    console.error("[map] locations query error:", locationsError)
  }
  console.log("[map] server: locations returned:", locations?.length ?? 0)

  const locationIds = (locations ?? []).map((location) => location.id as string)
  const { data: links } = locationIds.length
    ? await supabase
        .from("content_locations")
        .select("content_item_id, location_id")
        .in("location_id", locationIds)
    : { data: [] }

  const contentIds = [
    ...new Set((links ?? []).map((link) => link.content_item_id as string).filter(Boolean)),
  ]
  const contentById = await getPublicContentSummaries(supabase, contentIds, language)

  return ((locations ?? []) as LocationRow[]).map((location) => {
    const translations = asArray(location.location_translations)
    const translation =
      translations.find((row) => row.language_code === language) ??
      translations.find((row) => row.language_code === "en") ??
      translations[0] ??
      null
    const address = addressFor(location)
    const content = (links ?? [])
      .filter((link) => link.location_id === location.id)
      .map((link) => contentById.get(link.content_item_id as string))
      .filter((item): item is PublicMapContentSummary => Boolean(item))
    const categories = [...new Set(content.map((item) => item.contentType))]

    return {
      id: location.id as string,
      slug: location.slug as string,
      title: (translation?.title ?? address) || "Location",
      description: translation?.description ?? null,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      type: String(location.location_type ?? "site"),
      address: address || null,
      content,
      categories,
    }
  })
}

export async function getPublicLocationWithContent(
  locationSlug: string,
  lang: string
): Promise<PublicLocationWithContent | null> {
  const language = normalizeLanguage(lang)
  const supabase = createPublicClient()

  const { data: location } = await supabase
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
    .eq("slug", locationSlug)
    .eq("is_published", true)
    .maybeSingle()

  if (!location) return null

  const { data: links } = await supabase
    .from("content_locations")
    .select("content_item_id")
    .eq("location_id", location.id)

  const contentIds = (links ?? []).map((link) => link.content_item_id as string).filter(Boolean)
  const contentById = await getPublicContentSummaries(supabase, contentIds, language)
  const translations = asArray(location.location_translations)
  const translation =
    translations.find((row) => row.language_code === language) ??
    translations.find((row) => row.language_code === "en") ??
    translations[0] ??
    null
  const address = addressFor(location)

  return {
    id: location.id as string,
    slug: location.slug as string,
    title: (translation?.title ?? address) || "Location",
    description: translation?.description ?? null,
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    type: String(location.location_type ?? "site"),
    address: address || null,
    content: contentIds
      .map((id) => contentById.get(id))
      .filter((item): item is PublicMapContentSummary => Boolean(item)),
  }
}
