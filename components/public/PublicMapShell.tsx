"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Feather,
  Hammer,
  Map,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react"
import { publicHref, type PublicLanguage, type PublicMapContentSummary, type PublicMapLocation } from "@/lib/public/types"
import { t } from "@/lib/public/i18n"
import PublicMapSidebar from "./PublicMapSidebar"

type CategoryKey = "all" | "painting" | "book" | "story" | "artefact" | "biography"
type OpenPanel = "left" | "right" | null
type MapLngLat = [number, number]

type MapEvent = {
  features?: Array<{
    properties: Record<string, unknown>
    geometry: { type: string; coordinates: number[] }
  }>
}

type GeoJSONSource = {
  setData: (data: Record<string, unknown>) => void
}

type MapMarker = {
  addTo: (map: MapInstance) => MapMarker
  remove: () => void
  setLngLat: (coords: MapLngLat) => MapMarker
}

type SourceFeature = {
  properties: Record<string, unknown>
  geometry: { type: string; coordinates: number[] }
}

type MapInstance = {
  addControl: (control: unknown, position?: string) => void
  fitBounds: (bounds: MapBounds, options?: Record<string, unknown>) => void
  on: (event: string, layerOrHandler: string | ((e: MapEvent) => void), handler?: (e: MapEvent) => void) => void
  addSource: (id: string, source: Record<string, unknown>) => void
  addLayer: (layer: Record<string, unknown>) => void
  getSource: (id: string) => GeoJSONSource | undefined
  getCanvas: () => HTMLCanvasElement
  flyTo: (options: Record<string, unknown>) => void
  isSourceLoaded: (id: string) => boolean
  querySourceFeatures: (id: string) => SourceFeature[]
  remove: () => void
  resize: () => void
}

type MapBounds = {
  extend: (coordinates: MapLngLat) => MapBounds
}

type MapTilerSDK = {
  config: { apiKey: string }
  Map: new (options: Record<string, unknown>) => MapInstance
  Marker: new (options: { element: HTMLElement; anchor?: string }) => MapMarker
  LngLatBounds: new (southWest: MapLngLat, northEast: MapLngLat) => MapBounds
}

declare global {
  interface Window {
    maptilersdk?: MapTilerSDK
  }
}

const mapTilerApiKey =
  process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? process.env.NEXT_PUBLIC_MAPTILER_KEY ?? ""
const mapTilerScriptUrl =
  "https://cdn.jsdelivr.net/npm/@maptiler/sdk/dist/maptiler-sdk.umd.min.js"
const mapTilerCssUrl = "https://cdn.jsdelivr.net/npm/@maptiler/sdk/dist/maptiler-sdk.css"
const mapTilerStyleUrl = `https://api.maptiler.com/maps/aquarelle/style.json?key=${encodeURIComponent(
  mapTilerApiKey
)}`
const merthyrTydfilCenter: MapLngLat = [-3.3782, 51.7487]

let mapTilerScriptPromise: Promise<MapTilerSDK> | null = null

function loadMapTiler() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MapTiler can only load in the browser."))
  }

  if (window.maptilersdk) {
    return Promise.resolve(window.maptilersdk)
  }

  if (!document.querySelector(`link[href="${mapTilerCssUrl}"]`)) {
    const css = document.createElement("link")
    css.rel = "stylesheet"
    css.href = mapTilerCssUrl
    document.head.appendChild(css)
  }

  if (!mapTilerScriptPromise) {
    mapTilerScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${mapTilerScriptUrl}"]`
      )

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          if (window.maptilersdk) resolve(window.maptilersdk)
        })
        existingScript.addEventListener("error", () => reject(new Error("MapTiler failed to load.")))
        return
      }

      const script = document.createElement("script")
      script.src = mapTilerScriptUrl
      script.async = true
      script.onload = () => {
        if (window.maptilersdk) {
          resolve(window.maptilersdk)
        } else {
          reject(new Error("MapTiler did not initialize."))
        }
      }
      script.onerror = () => reject(new Error("MapTiler failed to load."))
      document.head.appendChild(script)
    })
  }

  return mapTilerScriptPromise
}

function coordinatesFor(location: PublicMapLocation): MapLngLat | null {
  if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) return null
  return [location.longitude, location.latitude]
}

export default function PublicMapShell({
  lang,
  locations,
}: {
  lang: PublicLanguage
  locations: PublicMapLocation[]
}) {
  type SelectedItem = { content: PublicMapContentSummary; location: PublicMapLocation }
  type MapItem = { id: string; content: PublicMapContentSummary; location: PublicMapLocation; coordinates: MapLngLat }

  const [currentLang, setCurrentLang] = useState<PublicLanguage>(lang)
  const [currentLocations, setCurrentLocations] = useState<PublicMapLocation[]>(locations)

  function switchLang(newLang: PublicLanguage) {
    setCurrentLang(newLang)
    fetch(`/api/public/map?lang=${newLang}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: PublicMapLocation[]) => {
        setCurrentLocations(data)
        // Keep the sidebar open with an updated content reference in the new language
        setSelectedItem((prev) => {
          if (!prev) return null
          for (const loc of data) {
            const updated = loc.content.find((c) => c.id === prev.content.id)
            if (updated) return { content: updated, location: loc }
          }
          return prev
        })
      })
      .catch((err) => console.error("[lang] map fetch failed:", err))
  }

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const mapItemsRef = useRef<MapItem[]>([])
  const markersByIdRef = useRef<Record<string, MapMarker>>({})
  const onScreenByIdRef = useRef<Record<string, MapMarker>>({})
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all")
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const categories = useMemo(
    () =>
      [
        "all",
        ...new Set(currentLocations.flatMap((location) => location.categories)),
      ] as CategoryKey[],
    [currentLocations]
  )

  const filteredLocations = useMemo(
    () =>
      selectedCategory === "all"
        ? currentLocations
        : currentLocations.filter((location) => location.categories.includes(selectedCategory)),
    [currentLocations, selectedCategory]
  )

  const mapItems = useMemo((): MapItem[] => {
    const items: MapItem[] = []
    for (const location of filteredLocations) {
      const coords = coordinatesFor(location)
      if (!coords) continue
      const contentItems = location.content
      for (let i = 0; i < contentItems.length; i++) {
        const content = contentItems[i]
        const [lng, lat] = coords
        const offsetLng = contentItems.length > 1
          ? lng + (i - (contentItems.length - 1) / 2) * 0.00018
          : lng
        items.push({ id: content.id, content, location, coordinates: [offsetLng, lat] })
      }
    }
    return items
  }, [filteredLocations])

  mapItemsRef.current = mapItems

  const openItem = useCallback((item: SelectedItem) => {
    setSelectedItem(item)
    setOpenPanel("right")
  }, [])

  function openLeftMenu() {
    setOpenPanel((current) => (current === "left" ? null : "left"))
  }

  function closePanels() {
    setOpenPanel(null)
  }

  function selectCategory(category: CategoryKey) {
    setSelectedCategory(category)
    setOpenPanel(null)
  }

  useEffect(() => {
    let cancelled = false

    if (!mapContainerRef.current || mapRef.current || !mapTilerApiKey) return

    loadMapTiler()
      .then((maptilersdk) => {
        if (cancelled || !mapContainerRef.current) return

        maptilersdk.config.apiKey = mapTilerApiKey
        const initialCoordinates =
          currentLocations.map(coordinatesFor).find((coordinates) => coordinates !== null) ??
          merthyrTydfilCenter
        const map = new maptilersdk.Map({
          container: mapContainerRef.current,
          style: mapTilerStyleUrl,
          center: initialCoordinates,
          zoom: currentLocations.length > 1 ? 12.6 : 13.4,
          attributionControl: true,
          navigationControl: false,
          geolocateControl: false,
        })

mapRef.current = map
        window.requestAnimationFrame(() => map.resize())

        map.on("load", () => {
          // ── Street-name label overlay ──────────────────────────────
          map.addSource("maptiler-labels", {
            type: "vector",
            url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${encodeURIComponent(mapTilerApiKey)}`,
          })
          map.addLayer({
            id: "label-roads",
            type: "symbol",
            source: "maptiler-labels",
            "source-layer": "transportation_name",
            layout: {
              "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
              "text-font": ["Open Sans Regular"],
              "text-size": ["interpolate", ["linear"], ["zoom"], 10, 10, 16, 13],
              "symbol-placement": "line",
              "text-max-angle": 30,
            },
            paint: {
              "text-color": "#5c4033",
              "text-halo-color": "rgba(255, 248, 235, 0.85)",
              "text-halo-width": 1.5,
            },
          })
          map.addLayer({
            id: "label-places",
            type: "symbol",
            source: "maptiler-labels",
            "source-layer": "place",
            layout: {
              "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
              "text-font": ["Open Sans SemiBold"],
              "text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 14, 16],
            },
            paint: {
              "text-color": "#3a2218",
              "text-halo-color": "rgba(255, 248, 235, 0.9)",
              "text-halo-width": 2,
            },
          })

          // ── Location pins with clustering ──────────────────────────
          map.addSource("locations", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
            cluster: true,
            clusterMaxZoom: 15,
            clusterRadius: 55,
          })

          // Cluster bubble
          map.addLayer({
            id: "clusters",
            type: "circle",
            source: "locations",
            filter: ["has", "point_count"],
            paint: {
              "circle-color": "#00744b",
              "circle-radius": ["step", ["get", "point_count"], 22, 5, 28, 15, 34],
              "circle-stroke-width": 2.5,
              "circle-stroke-color": "rgba(255,255,255,0.9)",
            },
          })

          // Cluster count label
          map.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "locations",
            filter: ["has", "point_count"],
            layout: {
              "text-field": "{point_count_abbreviated}",
              "text-font": ["Open Sans SemiBold"],
              "text-size": 13,
            },
            paint: { "text-color": "#ffffff" },
          })

          // Cursor: pointer on hover over clusters
          map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer" })
          map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = "" })

          // Click cluster → zoom in
          map.on("click", "clusters", (e: MapEvent) => {
            const feature = e.features?.[0]
            if (!feature) return
            const [lng, lat] = feature.geometry.coordinates
            map.flyTo({ center: [lng, lat], zoom: 14, duration: 500 })
          })

          // On every render, sync custom HTML markers with unclustered GeoJSON features
          function updateMarkers() {
            if (!map.isSourceLoaded("locations")) return

            const newOnScreen: Record<string, MapMarker> = {}

            for (const feature of map.querySourceFeatures("locations")) {
              if (feature.properties.cluster) continue
              const id = String(feature.properties.id)

              if (!markersByIdRef.current[id]) {
                const mapItem = mapItemsRef.current.find((item) => item.id === id)
                if (!mapItem) continue

                const el = document.createElement("button")
                el.type = "button"
                el.className = "public-map-marker"
                el.setAttribute("aria-label", `Open ${mapItem.content.title}`)
                const pinLabel = mapItem.content.title
                el.innerHTML = `
                  <span class="public-map-marker__label">${pinLabel}</span>
                  <span class="public-map-marker__pin">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 10c0 4.99-5.54 10.19-7.4 11.78a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </span>
                `
                el.addEventListener("click", () => {
                  const item = mapItemsRef.current.find((i) => i.id === id)
                  if (item) openItem({ content: item.content, location: item.location })
                })

                markersByIdRef.current[id] = new maptilersdk.Marker({ element: el, anchor: "bottom" })
                  .setLngLat(feature.geometry.coordinates as MapLngLat)
              }

              newOnScreen[id] = markersByIdRef.current[id]
              if (!onScreenByIdRef.current[id]) {
                markersByIdRef.current[id].addTo(map)
              }
            }

            // Remove markers that are now clustered or off-screen
            for (const id of Object.keys(onScreenByIdRef.current)) {
              if (!newOnScreen[id]) onScreenByIdRef.current[id].remove()
            }
            onScreenByIdRef.current = newOnScreen
          }

          map.on("render", updateMarkers)

          console.log("[map] map instance ready")
          setMapReady(true)
        })
      })
      .catch(() => {
        if (!cancelled) {
          setMapError("MapTiler could not be loaded.")
        }
      })

    return () => {
      cancelled = true
      setMapReady(false)
      Object.values(onScreenByIdRef.current).forEach((m) => m.remove())
      onScreenByIdRef.current = {}
      markersByIdRef.current = {}
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [locations])

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.maptilersdk) return

    const map = mapRef.current
    const maptilersdk = window.maptilersdk
    const source = map.getSource("locations")
    if (!source) return

    Object.values(onScreenByIdRef.current).forEach((m) => m.remove())
    onScreenByIdRef.current = {}
    markersByIdRef.current = {}

    source.setData({
      type: "FeatureCollection",
      features: mapItems.map(({ id, content, coordinates }) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates },
        properties: { id, title: content.title },
      })),
    })

    if (mapItems.length === 1) {
      map.fitBounds(
        new maptilersdk.LngLatBounds(mapItems[0].coordinates, mapItems[0].coordinates),
        { maxZoom: 14.5, padding: 120, duration: 600 }
      )
    } else if (mapItems.length > 1) {
      const bounds = new maptilersdk.LngLatBounds(mapItems[0].coordinates, mapItems[0].coordinates)
      mapItems.slice(1).forEach(({ coordinates }) => bounds.extend(coordinates))
      map.fitBounds(bounds, { maxZoom: 14, padding: 120, duration: 600 })
    }
  }, [mapItems, mapReady])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f6ed] text-neutral-950">
      <section className="relative h-screen min-h-[620px]">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 h-full min-h-[620px] w-full"
          aria-label="Merthyr map"
        />
        {!mapTilerApiKey || mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8f2d7] px-6 text-center">
            <div className="max-w-md border border-neutral-200 bg-white/90 p-6 shadow-sm">
              <h1 className="font-serif text-[30px] leading-tight text-neutral-950">
                MapTiler API key needed
              </h1>
              <p className="mt-3 text-[15px] leading-6 text-neutral-700">
                Add `NEXT_PUBLIC_MAPTILER_API_KEY` to the environment to load the interactive
                map.
              </p>
            </div>
          </div>
        ) : null}


        <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-2 overflow-x-auto px-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => selectCategory(category)}
              className={`flex h-11 shrink-0 items-center rounded-full border px-5 text-[15px] font-semibold shadow-sm transition hover:-translate-y-0.5 ${
                selectedCategory === category
                  ? "border-white/80 bg-[#f0a51b] text-white"
                  : "border-white/70 bg-[#00744b] text-white hover:bg-[#00613f]"
              }`}
              aria-pressed={selectedCategory === category}
            >
              {t(`filter.${category}`, currentLang)}
            </button>
          ))}
        </div>

        <div className="relative h-screen min-h-[620px] w-full pointer-events-none" />

        {openPanel ? (
          <button
            type="button"
            onClick={closePanels}
            className="absolute inset-0 z-30 bg-neutral-950/10"
            aria-label="Close open menu"
          />
        ) : null}

        {/* Sliding wrapper — button is attached to the panel's right edge */}
        <div
          className={`absolute inset-y-0 left-0 z-40 flex items-start transition-transform duration-300 ease-out ${
            openPanel === "left" ? "translate-x-0" : "-translate-x-[min(84vw,330px)]"
          }`}
        >
          <aside
            className="flex h-full w-[min(84vw,330px)] flex-col border-r border-neutral-200 bg-white shadow-2xl"
            aria-hidden={openPanel !== "left"}
            inert={openPanel !== "left"}
          >
            <div className="flex flex-col items-center px-6 pb-24 pt-8">
              <Link href={publicHref("/", currentLang)} aria-label="Her Stories">
                <img
                  src={currentLang === "cy" ? "/mainLogo-cy.png" : "/mainLogo.svg"}
                  alt="Her Stories"
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>

            <nav className="space-y-1">
              {([
                { key: "nav.map",        href: "/map",         icon: Map,      active: true },
                { key: "nav.creativity", href: "/paintings",   icon: Sparkles  },
                { key: "nav.activism",   href: "/stories",     icon: Feather   },
                { key: "nav.industry",   href: "/artefacts",   icon: Hammer    },
                { key: "nav.everyday",   href: "/biographies", icon: UserRound },
                { key: "nav.books",      href: "/books",       icon: BookOpen  },
              ] as const).map((item) => {
                const Icon = item.icon
                const label = t(item.key, currentLang)
                return (
                  <Link
                    key={item.key}
                    href={publicHref(item.href, currentLang)}
                    className={`ml-4 flex h-12 items-center justify-between px-4 font-serif text-[18px] font-semibold transition ${"active" in item
                      ? "rounded-l-full bg-neutral-950 text-white"
                      : "rounded-l-full text-neutral-800 hover:bg-neutral-100"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {label}
                    </span>
                    {"active" in item
                      ? null
                      : <ChevronRight className="h-5 w-5 text-neutral-300" />}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto flex flex-col items-center px-6 pb-6">
              <div className="mb-6">
                <img
                  src="/logos.png"
                  alt="Welsh Government and Merthyr Tydfil County Borough Council"
                  className="h-40 w-auto object-contain"
                />
              </div>
              <div className="flex w-full overflow-hidden rounded-full border border-neutral-300">
                {(["en", "cy"] as const).map((l, i) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => switchLang(l)}
                    className={`flex-1 py-2.5 text-[14px] font-medium transition ${
                      i > 0 ? "border-l border-neutral-300" : ""
                    } ${
                      currentLang === l
                        ? "bg-neutral-950 text-white"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {l === "en" ? "English" : "Cymraeg"}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Toggle button — rides the right edge of the panel */}
          <button
            type="button"
            onClick={openLeftMenu}
            className="flex h-14 w-14 shrink-0 items-center justify-center bg-neutral-950/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-neutral-950/60"
            aria-label={openPanel === "left" ? t("nav.closeMenu", currentLang) : "Open menu"}
            aria-expanded={openPanel === "left"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <line
                x1="3" y1="6" x2="21" y2="6"
                style={{
                  transformOrigin: "12px 6px",
                  transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                  transform: openPanel === "left"
                    ? "translateY(6px) rotate(-45deg) scaleX(0.65)"
                    : "none",
                }}
              />
              <line
                x1="3" y1="12" x2="21" y2="12"
                style={{
                  transformOrigin: "center",
                  transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                  transform: openPanel === "left" ? "scaleX(0)" : "none",
                }}
              />
              <line
                x1="3" y1="18" x2="21" y2="18"
                style={{
                  transformOrigin: "12px 18px",
                  transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                  transform: openPanel === "left"
                    ? "translateY(-6px) rotate(45deg) scaleX(0.65)"
                    : "none",
                }}
              />
            </svg>
          </button>
        </div>

        {selectedItem ? (
          <PublicMapSidebar
            content={selectedItem.content}
            location={selectedItem.location}
            lang={currentLang}
            isOpen={openPanel === "right"}
            onClose={closePanels}
          />
        ) : null}
      </section>
    </main>
  )
}
