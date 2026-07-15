import { createPublicClient } from "@/utils/supabase/public"
import {
  isPublicLanguage,
  publicContentHref,
  type PublicContentType,
  type PublicLanguage,
  type PublicMedia,
} from "./types"
import { isImageMedia, mapContentMediaRow, type ContentMediaRow } from "./media"

export type PublicOverviewItem = {
  id: string
  slug: string
  title: string
  href: string
  contentType: PublicContentType
  /** Contextual: artist / author / occupation */
  creatorLabel: string | null
  /** Contextual: summary snippet for story/artefact */
  summary: string | null
  /** Contextual: date string for artefact/biography */
  dateLabel: string | null
  primaryImage: PublicMedia | null
  locationTitle: string | null
  /** Genre (book) / category (artefact) label, when the type supports one */
  category: string | null
}

type SupabaseClient = ReturnType<typeof createPublicClient>

function normalizeLanguage(lang: string): PublicLanguage {
  return isPublicLanguage(lang) ? lang : "en"
}

// ─── Media ───────────────────────────────────────────────────────────────────

async function batchPrimaryImages(
  supabase: SupabaseClient,
  ids: string[],
  lang: PublicLanguage
): Promise<Map<string, PublicMedia | null>> {
  if (!ids.length) return new Map()

  const { data } = await supabase
    .from("content_media")
    .select(
      `content_item_id, media_asset_id, role, sort_order, is_primary,
       media_assets (
         id, storage_path, file_name, mime_type, width, height, duration_seconds, credit,
         media_asset_translations (language_code, alt_text, caption)
       )`
    )
    .in("content_item_id", ids)
    .order("sort_order", { ascending: true })

  const rowsByItem = new Map<string, ContentMediaRow[]>()
  for (const row of (data ?? []) as (ContentMediaRow & { content_item_id: string })[]) {
    const id = (row as unknown as { content_item_id: string }).content_item_id
    rowsByItem.set(id, [...(rowsByItem.get(id) ?? []), row])
  }

  const result = new Map<string, PublicMedia | null>()
  await Promise.all(
    Array.from(rowsByItem.entries()).map(async ([id, rows]) => {
      const images = (await Promise.all(rows.map((r) => mapContentMediaRow(r, lang))))
        .filter((m): m is NonNullable<typeof m> => m !== null && isImageMedia(m))
      result.set(id, images.find((m) => m.isPrimary) ?? images[0] ?? null)
    })
  )
  return result
}

// ─── Type-specific data ───────────────────────────────────────────────────────

type TypeData = { creatorLabel: string | null; dateLabel: string | null }

async function batchTypeData(
  supabase: SupabaseClient,
  ids: string[],
  type: PublicContentType,
  lang: PublicLanguage
): Promise<Map<string, TypeData>> {
  const empty: TypeData = { creatorLabel: null, dateLabel: null }
  const result = new Map<string, TypeData>(ids.map((id) => [id, { ...empty }]))
  if (!ids.length) return result

  const langs = lang === "en" ? ["en"] : [lang, "en"]

  if (type === "painting") {
    const { data } = await supabase
      .from("paintings")
      .select("content_item_id, artist_name")
      .in("content_item_id", ids)
    for (const row of data ?? [])
      result.set(row.content_item_id as string, { creatorLabel: row.artist_name as string | null, dateLabel: null })
  }

  else if (type === "book") {
    const { data } = await supabase
      .from("book_translations")
      .select("book_content_item_id, language_code, author")
      .in("book_content_item_id", ids)
      .in("language_code", langs)
    const best = new Map<string, string | null>()
    for (const row of data ?? []) {
      const id = row.book_content_item_id as string
      if (!best.has(id) || row.language_code === lang) best.set(id, row.author as string | null)
    }
    for (const [id, author] of best)
      result.set(id, { creatorLabel: author, dateLabel: null })
  }

  else if (type === "artefact") {
    const { data } = await supabase
      .from("artefacts")
      .select("content_item_id, date_created_label")
      .in("content_item_id", ids)
    for (const row of data ?? [])
      result.set(row.content_item_id as string, {
        creatorLabel: null,
        dateLabel: row.date_created_label as string | null,
      })
  }

  else if (type === "biography") {
    const [{ data: bios }, { data: bioTrans }] = await Promise.all([
      supabase
        .from("biographies")
        .select("content_item_id, birth_year, death_year")
        .in("content_item_id", ids),
      supabase
        .from("biography_translations")
        .select("biography_content_item_id, language_code, occupation")
        .in("biography_content_item_id", ids)
        .in("language_code", langs),
    ])
    const occupationById = new Map<string, string | null>()
    for (const row of bioTrans ?? []) {
      const id = row.biography_content_item_id as string
      if (!occupationById.has(id) || row.language_code === lang)
        occupationById.set(id, row.occupation as string | null)
    }
    for (const row of bios ?? []) {
      const by = row.birth_year as number | null
      const dy = row.death_year as number | null
      const dateLabel = by && dy ? `${by} – ${dy}` : by ? `b. ${by}` : dy ? `d. ${dy}` : null
      result.set(row.content_item_id as string, {
        creatorLabel: occupationById.get(row.content_item_id as string) ?? null,
        dateLabel,
      })
    }
  }
  // story: subtitle comes from summary in translations; no extra fetch needed

  return result
}

// ─── Categories (book genre / artefact category) ──────────────────────────────

async function batchCategoryLabels(
  supabase: SupabaseClient,
  ids: string[],
  type: PublicContentType,
  lang: PublicLanguage
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>(ids.map((id) => [id, null]))
  if (!ids.length) return result

  const langs = lang === "en" ? ["en"] : [lang, "en"]

  if (type === "book") {
    const { data: links } = await supabase
      .from("book_theme_books")
      .select("book_content_item_id, book_theme_id")
      .in("book_content_item_id", ids)

    const themeIdByItem = new Map<string, string>()
    for (const row of links ?? []) {
      const itemId = row.book_content_item_id as string
      if (!themeIdByItem.has(itemId)) themeIdByItem.set(itemId, row.book_theme_id as string)
    }

    const themeIds = [...new Set(themeIdByItem.values())]
    if (!themeIds.length) return result

    const { data: translations } = await supabase
      .from("book_theme_translations")
      .select("book_theme_id, language_code, title")
      .in("book_theme_id", themeIds)
      .in("language_code", langs)

    const titleByTheme = new Map<string, string>()
    for (const row of translations ?? []) {
      const themeId = row.book_theme_id as string
      if (!titleByTheme.has(themeId) || row.language_code === lang)
        titleByTheme.set(themeId, row.title as string)
    }

    for (const [itemId, themeId] of themeIdByItem)
      result.set(itemId, titleByTheme.get(themeId) ?? null)
  }

  else if (type === "artefact") {
    const { data: artefacts } = await supabase
      .from("artefacts")
      .select("content_item_id, artefact_category_id")
      .in("content_item_id", ids)

    const categoryIdByItem = new Map<string, string>()
    for (const row of artefacts ?? []) {
      const categoryId = row.artefact_category_id as string | null
      if (categoryId) categoryIdByItem.set(row.content_item_id as string, categoryId)
    }

    const categoryIds = [...new Set(categoryIdByItem.values())]
    if (!categoryIds.length) return result

    const { data: translations } = await supabase
      .from("artefact_category_translations")
      .select("artefact_category_id, language_code, label")
      .in("artefact_category_id", categoryIds)
      .in("language_code", langs)

    const labelByCategory = new Map<string, string>()
    for (const row of translations ?? []) {
      const categoryId = row.artefact_category_id as string
      if (!labelByCategory.has(categoryId) || row.language_code === lang)
        labelByCategory.set(categoryId, row.label as string)
    }

    for (const [itemId, categoryId] of categoryIdByItem)
      result.set(itemId, labelByCategory.get(categoryId) ?? null)
  }

  return result
}

// ─── Locations ───────────────────────────────────────────────────────────────

async function batchFirstLocations(
  supabase: SupabaseClient,
  ids: string[],
  lang: PublicLanguage
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>(ids.map((id) => [id, null]))
  if (!ids.length) return result

  console.log("[overview:locations] looking up locations for content ids:", ids)

  const { data: links, error: linksError } = await supabase
    .from("content_locations")
    .select("content_item_id, location_id")
    .in("content_item_id", ids)

  console.log("[overview:locations] content_locations query →", { links, error: linksError })

  const firstByItem = new Map<string, string>()
  for (const link of links ?? []) {
    const id = link.content_item_id as string
    if (!firstByItem.has(id)) firstByItem.set(id, link.location_id as string)
  }

  const locationIds = [...new Set(firstByItem.values())]
  console.log("[overview:locations] resolved location ids:", locationIds)
  if (!locationIds.length) return result

  const langs = lang === "en" ? ["en"] : [lang, "en"]
  const [{ data: locs, error: locsError }, { data: trans, error: transError }] = await Promise.all([
    supabase
      .from("locations")
      .select("id, address_line_1, town, postcode")
      .in("id", locationIds),
    supabase
      .from("location_translations")
      .select("location_id, language_code, title")
      .in("location_id", locationIds)
      .in("language_code", langs),
  ])

  console.log("[overview:locations] locations query →", { locs, error: locsError })
  console.log("[overview:locations] location_translations query →", { trans, error: transError })

  const addressByLoc = new Map<string, string>()
  for (const loc of locs ?? []) {
    const parts = [loc.address_line_1, loc.town, loc.postcode].filter(Boolean)
    if (parts.length) addressByLoc.set(loc.id as string, parts.join(", "))
  }

  const titleByLoc = new Map<string, string>()
  for (const t of trans ?? []) {
    const locId = t.location_id as string
    if (!titleByLoc.has(locId) || t.language_code === lang)
      titleByLoc.set(locId, t.title as string)
  }

  for (const [itemId, locId] of firstByItem)
    result.set(itemId, titleByLoc.get(locId) ?? addressByLoc.get(locId) ?? null)

  console.log("[overview:locations] final result:", Object.fromEntries(result))
  return result
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getPublicOverviewSection(
  type: PublicContentType,
  lang: string,
  limit = 10
): Promise<PublicOverviewItem[]> {
  const language = normalizeLanguage(lang)
  const supabase = createPublicClient()

  const [{ data: contentType }, { data: statuses }] = await Promise.all([
    supabase.from("content_types").select("id").eq("code", type).maybeSingle(),
    supabase.from("content_statuses").select("id").eq("is_public", true),
  ])

  if (!contentType?.id) return []
  const publicStatusIds = (statuses ?? []).map((s) => s.id as number)
  if (!publicStatusIds.length) return []

  const { data: items } = await supabase
    .from("content_items")
    .select("id, slug, featured, published_at")
    .eq("content_type_id", contentType.id)
    .in("content_status_id", publicStatusIds)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit)

  if (!items?.length) return []

  const ids = items.map((item) => item.id as string)
  const langs = language === "en" ? ["en"] : [language, "en"]

  const [{ data: translations }, images, typeData, locationTitles, categoryLabels] = await Promise.all([
    supabase
      .from("content_item_translations")
      .select("content_item_id, language_code, title, summary")
      .in("content_item_id", ids)
      .in("language_code", langs),
    batchPrimaryImages(supabase, ids, language),
    batchTypeData(supabase, ids, type, language),
    batchFirstLocations(supabase, ids, language),
    batchCategoryLabels(supabase, ids, type, language),
  ])

  const transByItem = new Map<string, { language_code: string; title: string; summary: string | null }[]>()
  for (const t of translations ?? []) {
    const id = t.content_item_id as string
    transByItem.set(id, [
      ...(transByItem.get(id) ?? []),
      t as { language_code: string; title: string; summary: string | null },
    ])
  }

  const results: PublicOverviewItem[] = []
  for (const item of items) {
    const id = item.id as string
    const rows = transByItem.get(id) ?? []
    const tr =
      rows.find((r) => r.language_code === language) ??
      rows.find((r) => r.language_code === "en") ??
      rows[0]
    if (!tr?.title) continue

    const td = typeData.get(id) ?? { creatorLabel: null, dateLabel: null }

    results.push({
      id,
      slug: item.slug as string,
      title: tr.title,
      href: publicContentHref(type, item.slug as string, language),
      contentType: type,
      creatorLabel: td.creatorLabel,
      summary: tr.summary ?? null,
      dateLabel: td.dateLabel,
      primaryImage: images.get(id) ?? null,
      locationTitle: locationTitles.get(id) ?? null,
      category: categoryLabels.get(id) ?? null,
    })
  }

  return results
}
