import { createPublicClient } from "@/utils/supabase/public"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createPublicClient()
  const { error } = await supabase.from("content_types").select("id").limit(1)

  if (error) {
    return Response.json(
      { ok: false, error: "Supabase keep-awake query failed" },
      { status: 502 }
    )
  }

  return Response.json({ ok: true })
}
