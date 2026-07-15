import { notFound } from "next/navigation"
import PublicCatalogue from "@/components/public/PublicCatalogue"
import { getPublicOverviewSection } from "@/lib/public/overview"
import { isPublicLanguage, type PublicLanguage } from "@/lib/public/types"

function resolveLang(value: string | string[] | undefined): PublicLanguage {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && isPublicLanguage(candidate) ? candidate : "en"
}

export default async function PublicStoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string | string[] }>
}) {
  if (process.env.NEXT_PUBLIC_SHOW_CATALOGUE !== "true") notFound()
  const params = searchParams ? await searchParams : {}
  const lang = resolveLang(params.lang)
  const items = await getPublicOverviewSection("story", lang, 1000)

  return <PublicCatalogue type="story" lang={lang} items={items} />
}
