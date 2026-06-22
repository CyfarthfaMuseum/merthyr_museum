import PublicMapShell from "@/components/public/PublicMapShell"
import { getPublicMapLocations } from "@/lib/public/map"
import { isPublicLanguage, type PublicLanguage } from "@/lib/public/types"

function resolveLang(value: string | string[] | undefined): PublicLanguage {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && isPublicLanguage(candidate) ? candidate : "en"
}

export default async function PublicMapPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string | string[] }>
}) {
  const params = searchParams ? await searchParams : {}
  const lang = resolveLang(params.lang)
  const locations = await getPublicMapLocations(lang)

  return <PublicMapShell lang={lang} locations={locations} />
}
