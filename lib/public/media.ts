import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getStorageClient } from "@/lib/r2"
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

export async function resolvePublicMediaUrl(storagePath: string | null | undefined) {
  const rawValue = (storagePath ?? "").trim()
  if (!rawValue) return ""

  if (isAbsoluteUrl(rawValue)) {
    return rawValue
  }

  const publicBaseUrl = (process.env.STORAGE_PUBLIC_BASE_URL ?? "").trim().replace(/\/+$/, "")
  const normalizedPath = rawValue.replace(/^\/+/, "")

  if (publicBaseUrl) {
    return `${publicBaseUrl}/${normalizedPath}`
  }

  const bucket = process.env.STORAGE_BUCKET_NAME
  if (!bucket) return ""

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: normalizedPath,
    })
    return await getSignedUrl(getStorageClient(), command, { expiresIn: 60 * 15 })
  } catch {
    return ""
  }
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
  return media.role === "audio" || media.mimeType.startsWith("audio/")
}

export function isImageMedia(media: PublicMedia) {
  return media.mimeType.startsWith("image/") || !isAudioMedia(media)
}
