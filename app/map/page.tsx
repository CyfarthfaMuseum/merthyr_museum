import { notFound } from "next/navigation"
import PublicMapShell from "@/components/public/PublicMapShell"
import { getPublicMapLocations } from "@/lib/public/map"
import { isPublicLanguage, type PublicLanguage } from "@/lib/public/types"

export const dynamic = "force-dynamic"

function resolveLang(value: string | string[] | undefined): PublicLanguage {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && isPublicLanguage(candidate) ? candidate : "en"
}

export default async function PublicMapPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string | string[] }>
}) {
  if (process.env.NEXT_PUBLIC_SHOW_CATALOGUE !== "true") notFound()
  const params = searchParams ? await searchParams : {}
  const lang = resolveLang(params.lang)
  const locations = await getPublicMapLocations(lang)

  return <PublicMapShell lang={lang} locations={locations} />
}
