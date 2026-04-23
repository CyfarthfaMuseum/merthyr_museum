'use server'

import { randomUUID } from 'crypto'
import { createClient } from '@/utils/supabase/server'

type SaveImageArgs = {
  contentItemId?: string | null
  objectKey: string
  publicUrl?: string | null
  fileName: string
  mimeType: string
  fileSizeBytes?: number | null
  width?: number | null
  height?: number | null
  altText?: string | null
  caption?: string | null
  credit?: string | null
  languageCode?: string
  isPrimary?: boolean
  sortOrder?: number
  role?: string
}

export async function saveImageMetadataAction(args: SaveImageArgs) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in.' }
  }

  const languageCode = args.languageCode ?? 'en'
  const isPrimary = args.isPrimary ?? false
  const sortOrder = args.sortOrder ?? 0
  const role = args.role ?? 'other'
  const mediaAssetId = randomUUID()

  const { error: mediaAssetError } = await supabase
    .from('media_assets')
    .insert({
      id: mediaAssetId,
      storage_path: args.publicUrl ?? args.objectKey,
      file_name: args.fileName,
      mime_type: args.mimeType,
      file_size_bytes: args.fileSizeBytes ?? null,
      width: args.width ?? null,
      height: args.height ?? null,
      credit: args.credit ?? null,
      uploaded_by: user.id,
    })

  if (mediaAssetError) {
    return {
      success: false,
      error: mediaAssetError?.message ?? 'Failed to create media asset.',
    }
  }

  if (args.altText || args.caption) {
    const { error: translationError } = await supabase
      .from('media_asset_translations')
      .insert({
        media_asset_id: mediaAssetId,
        language_code: languageCode,
        alt_text: args.altText ?? null,
        caption: args.caption ?? null,
      })

    if (translationError) {
      return { success: false, error: translationError.message }
    }
  }

  if (args.contentItemId) {
    if (isPrimary) {
      const { error: clearPrimaryError } = await supabase
        .from('content_media')
        .update({ is_primary: false })
        .eq('content_item_id', args.contentItemId)

      if (clearPrimaryError) {
        return { success: false, error: clearPrimaryError.message }
      }
    }

    const { error: linkError } = await supabase.from('content_media').insert({
      content_item_id: args.contentItemId,
      media_asset_id: mediaAssetId,
      role,
      sort_order: sortOrder,
      is_primary: isPrimary,
    })

    if (linkError) {
      return { success: false, error: linkError.message }
    }
  }

  return {
    success: true,
    mediaAssetId,
  }
}
