import type { PublicLanguage, PublicMedia } from "./types"

type MediaAssetTranslationRow = {
  language_code?: string | null
  alt_text?: string | null
  caption?: string | null
}

type MediaAssetRow = {
  id?: string | null
  storage_path?: string | null
  file_name?: string | null
  mime_type?: string | null
  width?: number | null
  height?: number | null
  duration_seconds?: number | null
  credit?: string | null
  media_asset_translations?: MediaAssetTranslationRow[] | MediaAssetTranslationRow | null
}

export type ContentMediaRow = {
  media_asset_id?: string | null
  role?: string | null
  sort_order?: number | null
  is_primary?: boolean | null
  media_assets?: MediaAssetRow[] | MediaAssetRow | null
}

function asArray<T>(value: T[] | T | null | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

// Storage objects are always served through our own /api/media proxy rather than
// directly from the bucket's domain, so ad/tracker blockers (which commonly flag
// cross-site requests with UUID-style filenames as tracking pixels) don't strip
// images from the public site. This extracts the bare object key whether the
// stored value is already a bare key or a legacy absolute URL into our bucket.
function extractStorageKey(rawValue: string): string | null {
  if (!isAbsoluteUrl(rawValue)) {
    return rawValue.replace(/^\/+/, "")
  }

  try {
    const url = new URL(rawValue)
    if (/\.storage\.dev$/i.test(url.hostname) || /\.tigrisfiles\.io$/i.test(url.hostname)) {
      return decodeURIComponent(url.pathname.replace(/^\/+/, ""))
    }
  } catch {
    return null
  }

  return null
}

export async function resolvePublicMediaUrl(storagePath: string | null | undefined) {
  const rawValue = (storagePath ?? "").trim()
  if (!rawValue) return ""

  const key = extractStorageKey(rawValue)
  if (key === null) {
    // Not one of our buckets (e.g. a genuinely external URL) — pass through as-is.
    return rawValue
  }
  if (!key) return ""

  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`
}

export async function mapContentMediaRow(
  row: ContentMediaRow,
  lang: PublicLanguage
): Promise<PublicMedia | null> {
  const asset = asArray(row.media_assets)[0]
  if (!asset) return null

  const url = await resolvePublicMediaUrl(asset.storage_path)
  if (!url) return null

  const translations = asArray(asset.media_asset_translations)
  const translation =
    translations.find((item) => item.language_code === lang) ??
    translations.find((item) => item.language_code === "en") ??
    translations[0] ??
    null

  const fallbackAlt = asset.file_name ?? "Museum object image"

  return {
    id: asset.id ?? row.media_asset_id ?? "",
    url,
    fileName: asset.file_name ?? "",
    mimeType: asset.mime_type ?? "",
    width: asset.width ?? null,
    height: asset.height ?? null,
    durationSeconds: asset.duration_seconds ?? null,
    credit: asset.credit ?? null,
    altText: translation?.alt_text || fallbackAlt,
    caption: translation?.caption ?? null,
    role: row.role ?? "other",
    isPrimary: row.is_primary === true,
    sortOrder: row.sort_order ?? 0,
  }
}

export function isAudioMedia(media: PublicMedia) {
  return media.role === "audio" || media.role === "audio_en" || media.role === "audio_cy" || media.mimeType.startsWith("audio/")
}

export function isImageMedia(media: PublicMedia) {
  return media.mimeType.startsWith("image/") || !isAudioMedia(media)
}
