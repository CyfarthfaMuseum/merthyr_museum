import { createPublicClient } from "@/utils/supabase/public"
import type { PublicContentType } from "./types"

const CONTENT_TYPES: PublicContentType[] = ["painting", "book", "story", "artefact", "biography"]

/** Which content types currently have at least one published item. */
export async function getAvailableContentTypes(): Promise<Record<PublicContentType, boolean>> {
  const supabase = createPublicClient()

  const [{ data: contentTypes }, { data: statuses }] = await Promise.all([
    supabase.from("content_types").select("id, code"),
    supabase.from("content_statuses").select("id").eq("is_public", true),
  ])

  const publicStatusIds = (statuses ?? []).map((s) => s.id as number)
  const result = Object.fromEntries(CONTENT_TYPES.map((type) => [type, false])) as Record<
    PublicContentType,
    boolean
  >

  if (!contentTypes?.length || !publicStatusIds.length) return result

  const codeById = new Map((contentTypes ?? []).map((ct) => [ct.id as number, ct.code as string]))

  const { data: items } = await supabase
    .from("content_items")
    .select("content_type_id")
    .in("content_status_id", publicStatusIds)

  for (const item of items ?? []) {
    const code = codeById.get(item.content_type_id as number) as PublicContentType | undefined
    if (code && code in result) result[code] = true
  }

  return result
}
