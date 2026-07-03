'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import type { ConnectedItem } from './types'
import { resolveThumbnailUrls } from './media-helpers'

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
      storage_path: args.objectKey,
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


type SaveLocationArgs = {
  contentItemId?: string | null
  address: string
  addressLine1?: string | null
  town?: string | null
  postcode?: string | null
  latitude: number
  longitude: number
  forceCreate?: boolean
}

export async function saveLocationAction(args: SaveLocationArgs) {
  if (!args.contentItemId) {
    return { success: false, error: 'Save content before setting a location.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in.' }
  }

  const adminSupabase = createAdminClient()

  console.log('[saveLocationAction] attempting update', {
    contentItemId: args.contentItemId,
    address: args.address,
    lat: args.latitude,
    lng: args.longitude,
    updatedBy: user.id,
  })

  // Check if this content item already has a linked location
  const { data: existingLink } = await adminSupabase
    .from('content_locations')
    .select('location_id')
    .eq('content_item_id', args.contentItemId)
    .eq('relationship_type', 'primary')
    .maybeSingle()

  if (existingLink?.location_id && !args.forceCreate) {
    // Update the existing location record
    const { error } = await adminSupabase
      .from('locations')
      .update({
        latitude: args.latitude,
        longitude: args.longitude,
        address_line_1: args.addressLine1 ?? args.address,
        town: args.town ?? null,
        postcode: args.postcode ?? null,
        updated_by: user.id,
      })
      .eq('id', existingLink.location_id)

    if (error) {
      console.error('[saveLocationAction] update failed:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    console.log('[saveLocationAction] update succeeded')
    revalidatePath('/admin/overview')
    return { success: true as const, locationId: existingLink.location_id }
  } else {
    // Create a new location record — use a UUID-based slug to avoid conflicts
    const slug = `location-${randomUUID()}`
    const { data: newLocation, error: insertError } = await adminSupabase
      .from('locations')
      .insert({
        slug,
        latitude: args.latitude,
        longitude: args.longitude,
        address_line_1: args.addressLine1 ?? args.address,
        town: args.town ?? null,
        postcode: args.postcode ?? null,
        location_type: 'landmark',
        is_published: true,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[saveLocationAction] insert failed:', JSON.stringify(insertError, null, 2))
      return { success: false, error: insertError.message }
    }

    // Link the new location to the content item
    const { error: linkError } = await adminSupabase
      .from('content_locations')
      .insert({
        content_item_id: args.contentItemId,
        location_id: newLocation.id,
        relationship_type: 'primary',
        sort_order: 0,
      })

    if (linkError) {
      console.error('[saveLocationAction] link failed:', JSON.stringify(linkError, null, 2))
      return { success: false, error: linkError.message }
    }

    console.log('[saveLocationAction] insert succeeded')
    revalidatePath('/admin/overview')
    return { success: true as const, locationId: newLocation.id }
  }
}

export async function linkLocationAction(args: { contentItemId: string; locationId: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  const adminSupabase = createAdminClient()

  // Remove any existing primary link for this content item
  const { error: deleteError } = await adminSupabase
    .from('content_locations')
    .delete()
    .eq('content_item_id', args.contentItemId)
    .eq('relationship_type', 'primary')

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  // Link the selected location
  const { error: insertError } = await adminSupabase
    .from('content_locations')
    .insert({
      content_item_id: args.contentItemId,
      location_id: args.locationId,
      relationship_type: 'primary',
      sort_order: 0,
    })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath('/admin/overview')
  return { success: true }
}

type DeleteImageArgs = {
  mediaAssetId: string
  contentItemId: string
}

export async function deleteImageAction(args: DeleteImageArgs) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in.' }
  }

  const adminSupabase = createAdminClient()

  const { error: linkError } = await adminSupabase
    .from('content_media')
    .delete()
    .eq('content_item_id', args.contentItemId)
    .eq('media_asset_id', args.mediaAssetId)

  if (linkError) {
    return { success: false, error: linkError.message }
  }

  const { data: remainingLinks } = await adminSupabase
    .from('content_media')
    .select('media_asset_id')
    .eq('media_asset_id', args.mediaAssetId)

  if (!remainingLinks || remainingLinks.length === 0) {
    await adminSupabase
      .from('media_asset_translations')
      .delete()
      .eq('media_asset_id', args.mediaAssetId)

    await adminSupabase
      .from('media_assets')
      .delete()
      .eq('id', args.mediaAssetId)
  }

  return { success: true }
}

// ---------------------------------------------------------------------------
// Audio guide
// ---------------------------------------------------------------------------

type SaveAudioArgs = {
  contentItemId?: string | null
  language: 'en' | 'cy'
  objectKey: string
  publicUrl?: string | null
  fileName: string
  mimeType?: string | null
  fileSizeBytes?: number | null
}

export async function saveAudioAction(
  args: SaveAudioArgs
): Promise<{ success: true; mediaAssetId: string } | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  const adminSupabase = createAdminClient()
  const mediaAssetId = randomUUID()

  const { error: assetError } = await adminSupabase.from('media_assets').insert({
    id: mediaAssetId,
    storage_path: args.publicUrl ?? args.objectKey,
    file_name: args.fileName,
    mime_type: args.mimeType ?? 'audio/mpeg',
    file_size_bytes: args.fileSizeBytes ?? null,
    uploaded_by: user.id,
  })

  if (assetError) return { success: false, error: assetError.message }

  if (args.contentItemId) {
    const role = args.language === 'cy' ? 'audio_cy' : 'audio_en'

    // Remove existing audio for this content item/language first.
    await adminSupabase
      .from('content_media')
      .delete()
      .eq('content_item_id', args.contentItemId)
      .in('role', args.language === 'en' ? ['audio', 'audio_en'] : ['audio_cy'])

    const { error: linkError } = await adminSupabase.from('content_media').insert({
      content_item_id: args.contentItemId,
      media_asset_id: mediaAssetId,
      role,
      sort_order: args.language === 'en' ? 0 : 1,
      is_primary: false,
    })

    if (linkError) return { success: false, error: linkError.message }
  }

  return { success: true, mediaAssetId }
}

type DeleteAudioArgs = {
  mediaAssetId: string
  contentItemId?: string | null
}

export async function deleteAudioAction(
  args: DeleteAudioArgs
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  const adminSupabase = createAdminClient()

  if (args.contentItemId) {
    await adminSupabase
      .from('content_media')
      .delete()
      .eq('content_item_id', args.contentItemId)
      .eq('media_asset_id', args.mediaAssetId)
  }

  await adminSupabase.from('media_assets').delete().eq('id', args.mediaAssetId)

  return { success: true }
}

// ---------------------------------------------------------------------------
// Connected content
// ---------------------------------------------------------------------------

export async function searchContentAction(args: {
  query: string
  excludeId?: string | null
}): Promise<{ success: true; results: ConnectedItem[] } | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  if (!args.query.trim()) return { success: true, results: [] }

  const adminSupabase = createAdminClient()

  const { data: translations, error } = await adminSupabase
    .from('content_item_translations')
    .select('content_item_id, title')
    .eq('language_code', 'en')
    .ilike('title', `%${args.query}%`)
    .limit(50)

  if (error) return { success: false, error: error.message }

  const ids = (translations ?? [])
    .map((t) => t.content_item_id as string)
    .filter((id) => id !== args.excludeId)

  if (ids.length === 0) return { success: true, results: [] }

  const [{ data: items }, { data: typeTranslations }, imageUrlById] = await Promise.all([
    adminSupabase.from('content_items').select('id, content_type_id').in('id', ids),
    adminSupabase
      .from('content_type_translations')
      .select('content_type_id, label')
      .eq('language_code', 'en'),
    resolveThumbnailUrls(adminSupabase, ids),
  ])

  const typeIdByItemId = new Map(
    (items ?? []).map((i) => [i.id as string, i.content_type_id as number])
  )
  const typeLabelById = new Map(
    (typeTranslations ?? []).map((t) => [t.content_type_id as number, t.label as string])
  )
  const titleById = new Map(
    (translations ?? []).map((t) => [t.content_item_id as string, t.title as string])
  )

  const results: ConnectedItem[] = ids.map((id) => {
    const typeId = typeIdByItemId.get(id)
    return {
      id,
      title: titleById.get(id) ?? 'Untitled',
      contentTypeCode: String(typeId ?? ''),
      contentTypeLabel: typeId ? (typeLabelById.get(typeId) ?? '') : '',
      imageUrl: imageUrlById.get(id) ?? null,
    }
  })

  return { success: true, results }
}

export async function saveRelatedContentAction(args: {
  parentId: string
  childId: string
}): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase.from('related_content').upsert(
    {
      parent_content_item_id: args.parentId,
      child_content_item_id: args.childId,
      relationship_type: 'related',
      sort_order: 0,
    },
    { onConflict: 'parent_content_item_id,child_content_item_id' }
  )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function removeRelatedContentAction(args: {
  parentId: string
  childId: string
}): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('related_content')
    .delete()
    .eq('parent_content_item_id', args.parentId)
    .eq('child_content_item_id', args.childId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteLocationAction(args: {
  locationId: string
}): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('locations')
    .delete()
    .eq('id', args.locationId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/overview')
  return { success: true }
}
