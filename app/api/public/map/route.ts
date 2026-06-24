import { NextRequest, NextResponse } from "next/server"
import { getPublicMapLocations } from "@/lib/public/map"

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") ?? "en"
  const locations = await getPublicMapLocations(lang)
  return NextResponse.json(locations)
}
