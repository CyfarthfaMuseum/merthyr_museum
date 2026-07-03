import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { publicHref, type PublicLanguage } from "@/lib/public/types"

export default function PublicHome({ lang }: { lang: PublicLanguage }) {
  const isWelsh = lang === "cy"

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-neutral-950 md:flex-row">

      {/* Mobile: top bar with language toggle (hidden on desktop) */}
      <div className="flex h-16 flex-none items-center justify-center md:hidden">
        <Link
          href={isWelsh ? "/" : publicHref("/", "cy")}
          className="rounded-full border border-white/40 px-4 py-1.5 text-[13px] text-white/90 transition hover:border-white/70 hover:text-white"
        >
          {isWelsh ? "English" : "Cymraeg"}
        </Link>
      </div>

      {/* Image — top portion on mobile, full left panel on desktop */}
      <div className="h-[40%] w-full flex-none md:h-full md:w-[42%]">
        <img
          src="/splash-hero.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-top"
        />
      </div>

      {/* Text panel — below image on mobile, right panel on desktop */}
      <div className="relative flex flex-1 flex-col items-center justify-center">

        {/* Desktop: language toggle top-right (hidden on mobile) */}
        <div className="absolute right-6 top-6 hidden md:block">
          <Link
            href={isWelsh ? "/" : publicHref("/", "cy")}
            className="rounded-full border border-white/40 px-4 py-1.5 text-[13px] text-white/90 transition hover:border-white/70 hover:text-white"
          >
            {isWelsh ? "English" : "Cymraeg"}
          </Link>
        </div>

        {/* Logo */}
        <img
          src={isWelsh ? "/hanesHi.svg" : "/HerStoriesEng.png"}
          alt={isWelsh ? "Hanes Hi" : "Her Stories"}
          className="w-[80%] max-w-sm object-contain md:w-[60%] md:max-w-xs"
        />

        {/* CTA */}
        <Link
          href={publicHref("/home", lang)}
          className="absolute bottom-10 flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition hover:opacity-70 md:text-[18px]"
        >
          {isWelsh ? "Dechrau" : "Start"}
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
        </Link>
      </div>

    </main>
  )
}
