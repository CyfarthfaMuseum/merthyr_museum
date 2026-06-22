import Link from "next/link"
import { MapPin, Menu } from "lucide-react"
import { publicHref, type PublicLanguage, type PublicMapLocation } from "@/lib/public/types"

const categoryLabels = {
  all: "All",
  painting: "Paintings",
  book: "Books",
  story: "Stories",
  artefact: "Artefacts",
  biography: "Biographies",
}

export default function PublicMapShell({
  lang,
  locations,
}: {
  lang: PublicLanguage
  locations: PublicMapLocation[]
}) {
  const categories = [
    "all",
    ...new Set(locations.flatMap((location) => location.categories)),
  ] as Array<keyof typeof categoryLabels>

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-[320px] shrink-0 border-r border-neutral-200 bg-white p-6 lg:block">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href={publicHref("/", lang)}
              className="font-serif text-[28px] leading-none text-neutral-950"
            >
              Her Stories
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center bg-neutral-200"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            {locations.slice(0, 8).map((location) => (
              <Link
                key={location.id}
                href={`#${location.slug}`}
                className="block border-t border-neutral-200 pt-4"
              >
                <p className="text-[15px] font-semibold text-neutral-950">{location.title}</p>
                <p className="mt-1 text-[13px] text-neutral-600">
                  {location.content.length} item{location.content.length === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[72px] items-center justify-between border-b border-neutral-200 px-4 sm:px-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Public Map
              </p>
              <h1 className="font-serif text-[30px] leading-tight text-neutral-950">
                Explore the collection
              </h1>
            </div>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center bg-neutral-200"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </header>

          <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 px-4 py-3 sm:px-6">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="shrink-0 border border-neutral-200 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-neutral-700 transition hover:border-neutral-950"
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>

          <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="relative min-h-[520px] overflow-hidden bg-neutral-100">
              <div className="absolute inset-6 border border-neutral-300 bg-white">
                <div className="relative h-full w-full">
                  {locations.map((location, index) => {
                    const x = 12 + ((index * 23) % 76)
                    const y = 18 + ((index * 31) % 66)
                    return (
                      <a
                        id={location.slug}
                        key={location.id}
                        href={`#location-${location.slug}`}
                        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        aria-label={location.title}
                      >
                        <span className="flex h-11 w-11 items-center justify-center bg-neutral-950 text-white shadow-sm">
                          <MapPin className="h-5 w-5" />
                        </span>
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            <aside className="border-l border-neutral-200 bg-white p-5">
              <div className="space-y-5">
                {locations.map((location) => (
                  <section
                    key={location.id}
                    id={`location-${location.slug}`}
                    className="border-t border-neutral-200 pt-5"
                  >
                    <h2 className="font-serif text-[24px] leading-tight text-neutral-950">
                      {location.title}
                    </h2>
                    {location.address ? (
                      <p className="mt-1 text-[13px] text-neutral-600">{location.address}</p>
                    ) : null}
                    {location.content.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        {location.content.slice(0, 4).map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className="block border border-neutral-200 p-3 transition hover:border-neutral-950"
                          >
                            <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                              {item.contentType}
                            </p>
                            <p className="mt-1 text-[15px] font-medium text-neutral-950">
                              {item.title}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-[14px] text-neutral-600">No public items linked.</p>
                    )}
                  </section>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
