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
  Menu,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react"
import { publicHref, type PublicLanguage, type PublicMapLocation } from "@/lib/public/types"

const categoryLabels = {
  all: "All",
  painting: "Paintings",
  book: "Books",
  story: "Stories",
  artefact: "Artefacts",
  biography: "Biographies",
}

const menuItems = [
  { label: "Map", href: "/map", icon: Map, active: true },
  { label: "Creativity", href: "/paintings", icon: Sparkles },
  { label: "Activism", href: "/stories", icon: Feather },
  { label: "Industry", href: "/artefacts", icon: Hammer },
  { label: "Everyday", href: "/biographies", icon: UserRound },
  { label: "Books", href: "/books", icon: BookOpen },
]

type OpenPanel = "left" | "right" | null
type CategoryKey = keyof typeof categoryLabels
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
  NavigationControl: new (options?: Record<string, unknown>) => unknown
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const locationsRef = useRef<PublicMapLocation[]>(locations)
  const markersByIdRef = useRef<Record<string, MapMarker>>({})
  const onScreenByIdRef = useRef<Record<string, MapMarker>>({})
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const [selectedLocation, setSelectedLocation] = useState<PublicMapLocation | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all")
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  console.log("[map] locations received from server:", locations.length, locations.map(l => ({ id: l.id, lat: l.latitude, lng: l.longitude, title: l.title })))

  const categories = useMemo(
    () =>
      [
        "all",
        ...new Set(locations.flatMap((location) => location.categories)),
      ] as Array<keyof typeof categoryLabels>,
    [locations]
  )
  locationsRef.current = locations

  const filteredLocations = useMemo(
    () =>
      selectedCategory === "all"
        ? locations
        : locations.filter((location) => location.categories.includes(selectedCategory)),
    [locations, selectedCategory]
  )
  const mappedLocations = useMemo(
    () =>
      filteredLocations
        .map((location) => ({ location, coordinates: coordinatesFor(location) }))
        .filter(
          (entry): entry is { location: PublicMapLocation; coordinates: MapLngLat } =>
            Boolean(entry.coordinates)
        ),
    [filteredLocations]
  )

  const openLocation = useCallback((location: PublicMapLocation) => {
    setSelectedLocation(location)
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

  function selectAdjacentLocation(direction: -1 | 1) {
    if (!selectedLocation || filteredLocations.length === 0) return

    const currentIndex = filteredLocations.findIndex((location) => location.id === selectedLocation.id)
    const safeIndex = currentIndex === -1 ? 0 : currentIndex
    const nextIndex =
      (safeIndex + direction + filteredLocations.length) % filteredLocations.length
    const nextLocation = filteredLocations[nextIndex]

    if (nextLocation) {
      setSelectedLocation(nextLocation)
      setOpenPanel("right")
    }
  }

  useEffect(() => {
    let cancelled = false

    if (!mapContainerRef.current || mapRef.current || !mapTilerApiKey) return

    loadMapTiler()
      .then((maptilersdk) => {
        if (cancelled || !mapContainerRef.current) return

        maptilersdk.config.apiKey = mapTilerApiKey
        const initialCoordinates =
          locations.map(coordinatesFor).find((coordinates) => coordinates !== null) ??
          merthyrTydfilCenter
        const map = new maptilersdk.Map({
          container: mapContainerRef.current,
          style: mapTilerStyleUrl,
          center: initialCoordinates,
          zoom: locations.length > 1 ? 12.6 : 13.4,
          attributionControl: true,
        })

        map.addControl(new maptilersdk.NavigationControl({ showCompass: false }), "top-right")
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
                const location = locationsRef.current.find((l) => l.id === id)
                if (!location) continue

                const el = document.createElement("button")
                el.type = "button"
                el.className = "public-map-marker"
                el.setAttribute("aria-label", `Open ${location.title}`)
                const pinLabel = location.address?.split(", ")[0] ?? location.title
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
                  const loc = locationsRef.current.find((l) => l.id === id)
                  if (loc) openLocation(loc)
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
    console.log("[map] data effect — mapReady:", mapReady, "mappedLocations:", mappedLocations.length)
    if (!mapReady || !mapRef.current || !window.maptilersdk) {
      console.log("[map] data effect skipped — map not ready yet")
      return
    }

    const map = mapRef.current
    const maptilersdk = window.maptilersdk
    const source = map.getSource("locations")
    if (!source) {
      console.log("[map] data effect skipped — locations source not found")
      return
    }

    // Clear marker cache so the render listener recreates markers for the new set
    Object.values(onScreenByIdRef.current).forEach((m) => m.remove())
    onScreenByIdRef.current = {}
    markersByIdRef.current = {}

    console.log("[map] updating GeoJSON source with", mappedLocations.length, "features")
    source.setData({
      type: "FeatureCollection",
      features: mappedLocations.map(({ location, coordinates }) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates },
        properties: { id: location.id, title: location.title },
      })),
    })

    if (mappedLocations.length === 1) {
      map.fitBounds(
        new maptilersdk.LngLatBounds(mappedLocations[0].coordinates, mappedLocations[0].coordinates),
        { maxZoom: 14.5, padding: 120, duration: 600 }
      )
    } else if (mappedLocations.length > 1) {
      const bounds = new maptilersdk.LngLatBounds(
        mappedLocations[0].coordinates,
        mappedLocations[0].coordinates
      )
      mappedLocations.slice(1).forEach(({ coordinates }) => bounds.extend(coordinates))
      map.fitBounds(bounds, { maxZoom: 14, padding: 120, duration: 600 })
    }
  }, [mappedLocations, mapReady])

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

        <button
          type="button"
          onClick={openLeftMenu}
          className="absolute left-4 top-4 z-30 flex h-14 w-14 items-center justify-center bg-neutral-950/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-neutral-950/60"
          aria-label="Open menu"
          aria-expanded={openPanel === "left"}
        >
          <Menu className="h-7 w-7" />
        </button>

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
              {categoryLabels[category]}
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

        <aside
          className={`absolute inset-y-0 left-0 z-40 flex w-[min(84vw,330px)] flex-col border-r border-neutral-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
            openPanel === "left" ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-hidden={openPanel !== "left"}
          inert={openPanel !== "left"}
        >
          <div className="flex items-center justify-between px-6 pb-5 pt-8">
            <Link
              href={publicHref("/", lang)}
              className="font-serif text-[30px] leading-none text-[#006b43]"
            >
              HER:STORIES
            </Link>
            <button
              type="button"
              onClick={closePanels}
              className="flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-6 mb-7 flex items-center gap-3 border-b border-neutral-400 pb-3 text-neutral-700">
            <Search className="h-5 w-5" />
            <span className="font-serif text-[18px] font-semibold">Search</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={publicHref(item.href, lang)}
                  className={`mx-4 flex h-12 items-center justify-between px-4 font-serif text-[18px] font-semibold transition ${
                    item.active
                      ? "rounded-full bg-neutral-950 text-white"
                      : "text-neutral-800 hover:bg-neutral-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </span>
                  {!item.active ? <ChevronRight className="h-5 w-5 text-neutral-300" /> : null}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto px-6 pb-6">
            <div className="mb-6 h-20 w-28 rounded-sm bg-[#f1f4ef] p-3 text-[10px] font-semibold uppercase leading-tight text-[#006b43]">
              Merthyr Tydfil County Borough Council
            </div>
            <button
              type="button"
              className="h-11 w-full rounded-full border border-neutral-300 text-[15px] text-neutral-700"
            >
              {lang === "cy" ? "Cymraeg" : "English (UK)"}
            </button>
          </div>
        </aside>

        <aside
          className={`absolute inset-y-0 right-0 z-40 flex w-[min(90vw,390px)] flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
            openPanel === "right" ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={openPanel !== "right"}
          inert={openPanel !== "right"}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 p-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={closePanels}
              className="flex h-11 w-11 items-center justify-center bg-neutral-950/55 text-white transition hover:bg-neutral-950/70"
              aria-label="Close details"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <p className="text-[12px] font-semibold uppercase text-neutral-500">
              Location details
            </p>
          </div>

          {selectedLocation ? (
            <div className="p-5">
              <div className="mb-5 aspect-[4/3] bg-[linear-gradient(135deg,#f7f1dc,#ffffff_48%,#e5ecd9)] p-4">
                <div className="flex h-full items-center justify-center border border-neutral-200 bg-white/55">
                  <MapPin className="h-12 w-12 text-[#00744b]" />
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectAdjacentLocation(-1)}
                  className="flex h-11 w-11 items-center justify-center bg-neutral-950/55 text-white"
                  aria-label="Previous location"
                  disabled={filteredLocations.length < 2}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => selectAdjacentLocation(1)}
                  className="flex h-11 w-11 items-center justify-center bg-neutral-950/55 text-white"
                  aria-label="Next location"
                  disabled={filteredLocations.length < 2}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              <h1 className="font-serif text-[42px] leading-none text-neutral-950">
                {selectedLocation.title}
              </h1>
              {selectedLocation.address ? (
                <p className="mt-2 text-[18px] text-neutral-700">{selectedLocation.address}</p>
              ) : null}
              {selectedLocation.description ? (
                <p className="mt-6 text-[18px] leading-7 text-neutral-800">
                  {selectedLocation.description}
                </p>
              ) : null}

              <div className="mt-7 space-y-3">
                {selectedLocation.content.length > 0 ? (
                  selectedLocation.content.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block border border-neutral-200 p-4 transition hover:border-neutral-950"
                    >
                      <p className="text-[11px] font-semibold uppercase text-[#00744b]">
                        {item.contentType}
                      </p>
                      <p className="mt-1 font-serif text-[22px] leading-tight text-neutral-950">
                        {item.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="border border-neutral-200 p-4 text-[15px] text-neutral-600">
                    No public items linked.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  )
}
