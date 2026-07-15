import type { createAdminClient } from '@/utils/supabase/admin'

const AUDIO_ROLES = ['audio', 'audio_en', 'audio_cy']

/**
 * Resolves a thumbnail URL per content item: the explicit primary image if one is
 * set, otherwise the first image by sort order. Keeps search results and connected
 * content previews populated even when nobody has flagged a primary image yet.
 */
export async function resolveThumbnailUrls(
  adminSupabase: ReturnType<typeof createAdminClient>,
  contentItemIds: string[]
): Promise<Map<string, string | null>> {
  const urlByItemId = new Map<string, string | null>()
  if (contentItemIds.length === 0) return urlByItemId

  const { data: media } = await adminSupabase
    .from('content_media')
    .select('content_item_id, is_primary, sort_order, media_assets(storage_path)')
    .in('content_item_id', contentItemIds)
    .not('role', 'in', `(${AUDIO_ROLES.join(',')})`)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })

  for (const row of media ?? []) {
    const itemId = row.content_item_id as string
    if (urlByItemId.has(itemId)) continue
    const asset = row.media_assets as unknown as { storage_path: string } | null
    urlByItemId.set(itemId, asset?.storage_path ?? null)
  }

  return urlByItemId
}
