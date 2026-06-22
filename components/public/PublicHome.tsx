import Link from "next/link"
import { MapPin, Menu } from "lucide-react"
import { publicHref, type PublicLanguage, type PublicMapLocation } from "@/lib/public/types"

export default function PublicHome({
  lang,
  locations,
}: {
  lang: PublicLanguage
  locations: PublicMapLocation[]
}) {
  const itemCount = locations.reduce((total, location) => total + location.content.length, 0)

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <header className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-[30px] leading-none">Her Stories</h1>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center bg-neutral-200"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <section className="mx-auto grid max-w-[1280px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(320px,0.38fr)] lg:px-8 lg:py-14">
        <div className="min-h-[520px] bg-neutral-100 p-5">
          <div className="relative h-full min-h-[480px] border border-neutral-300 bg-white">
            {locations.slice(0, 9).map((location, index) => {
              const x = 14 + ((index * 27) % 72)
              const y = 16 + ((index * 29) % 68)
              return (
                <Link
                  key={location.id}
                  href={publicHref(`/map#${location.slug}`, lang)}
                  className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-neutral-950 text-white shadow-sm"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={location.title}
                >
                  <MapPin className="h-5 w-5" />
                </Link>
              )
            })}
          </div>
        </div>

        <aside className="flex flex-col justify-between border-t border-neutral-200 pt-6 lg:border-t-0 lg:pt-0">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Merthyr Museum
            </p>
            <h2 className="mt-4 font-serif text-[48px] leading-[1.05] text-neutral-950 sm:text-[64px]">
              Hanes-Hi
            </h2>
            <p className="mt-6 text-[18px] leading-8 text-neutral-700">
              {itemCount} public collection item{itemCount === 1 ? "" : "s"} across{" "}
              {locations.length} location{locations.length === 1 ? "" : "s"}.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={publicHref("/map", lang)}
              className="inline-flex h-12 items-center bg-neutral-950 px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
            >
              Open Map
            </Link>
            <Link
              href={publicHref("/books", lang)}
              className="inline-flex h-12 items-center border border-neutral-200 px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950"
            >
              Books
            </Link>
            <Link
              href={publicHref("/paintings", lang)}
              className="inline-flex h-12 items-center border border-neutral-200 px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950"
            >
              Paintings
            </Link>
          </div>
        </aside>
      </section>
    </main>
  )
}
