import PublicHome from "@/components/public/PublicHome"
import { isPublicLanguage, type PublicLanguage } from "@/lib/public/types"

function resolveLang(value: string | string[] | undefined): PublicLanguage {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && isPublicLanguage(candidate) ? candidate : "en"
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string | string[] }>
}) {
  const params = searchParams ? await searchParams : {}
  const lang = resolveLang(params.lang)

  return <PublicHome lang={lang} />
}
