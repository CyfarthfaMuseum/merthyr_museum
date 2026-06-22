import { notFound } from "next/navigation"
import PublicContentDetail from "@/components/public/PublicContentDetail"
import { getPublicContentItemBySlug } from "@/lib/public/content"
import { isPublicLanguage, type PublicLanguage } from "@/lib/public/types"

function resolveLang(value: string | string[] | undefined): PublicLanguage {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && isPublicLanguage(candidate) ? candidate : "en"
}

export default async function PublicArtefactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ lang?: string | string[] }>
}) {
  const { slug } = await params
  const query = searchParams ? await searchParams : {}
  const lang = resolveLang(query.lang)
  const content = await getPublicContentItemBySlug(slug, lang)
  if (!content || content.contentType.code !== "artefact") notFound()

  return <PublicContentDetail content={content} />
}
