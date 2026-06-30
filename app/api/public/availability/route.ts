import { NextResponse } from "next/server"
import { getAvailableContentTypes } from "@/lib/public/availability"

export async function GET() {
  const availability = await getAvailableContentTypes()
  return NextResponse.json(availability)
}
