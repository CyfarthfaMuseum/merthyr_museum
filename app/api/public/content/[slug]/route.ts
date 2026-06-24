import { NextRequest, NextResponse } from "next/server"
import { getPublicContentItemBySlug } from "@/lib/public/content"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const lang = request.nextUrl.searchParams.get("lang") ?? "en"

  const content = await getPublicContentItemBySlug(slug, lang)
  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(content)
}
