import { notFound } from "next/navigation"
import PublicCatalogue from "@/components/public/PublicCatalogue"
import { getPublicCatalogueItems } from "@/lib/public/content"
import { isPublicLanguage, type PublicLanguage } from "@/lib/public/types"

function resolveLang(value: string | string[] | undefined): PublicLanguage {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && isPublicLanguage(candidate) ? candidate : "en"
}

export default async function PublicPaintingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string | string[] }>
}) {
  if (process.env.NEXT_PUBLIC_SHOW_CATALOGUE !== "true") notFound()
  const params = searchParams ? await searchParams : {}
  const lang = resolveLang(params.lang)
  const items = await getPublicCatalogueItems("painting", lang)

  return <PublicCatalogue type="painting" lang={lang} items={items} />
}
