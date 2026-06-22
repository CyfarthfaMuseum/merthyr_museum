import { type NextRequest, NextResponse } from "next/server"

export function GET(request: NextRequest) {
  const sourceUrl = new URL(request.url)
  const destination = new URL("/admin/auth/confirm", sourceUrl.origin)
  destination.search = sourceUrl.search

  return NextResponse.redirect(destination)
}
