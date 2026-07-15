import { isPublicLanguage, type PublicLanguage } from "@/lib/public/types"
import { getPublicOverviewSection } from "@/lib/public/overview"
import PublicOverview from "@/components/public/PublicOverview"

export const dynamic = "force-dynamic"

function resolveLang(value: string | string[] | undefined): PublicLanguage {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && isPublicLanguage(candidate) ? candidate : "en"
}

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string | string[] }>
}) {
  const params = searchParams ? await searchParams : {}
  const lang = resolveLang(params.lang)

  const [paintings, artefacts, stories, biographies, books] = await Promise.all([
    getPublicOverviewSection("painting", lang),
    getPublicOverviewSection("artefact", lang),
    getPublicOverviewSection("story", lang),
    getPublicOverviewSection("biography", lang),
    getPublicOverviewSection("book", lang),
  ])

  const sections = { painting: paintings, artefact: artefacts, story: stories, biography: biographies, book: books }

  return <PublicOverview lang={lang} sections={sections} />
}
