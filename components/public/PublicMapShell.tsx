"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import {
  publicHref,
  type PublicLanguage,
  type PublicMapContentSummary,
  type PublicMapLocation,
  type PublicRelatedContent,
} from "@/lib/public/types"
import { t } from "@/lib/public/i18n"
import PublicMapSidebar from "./PublicMapSidebar"
import PublicNavPanel from "./PublicNavPanel"

type CategoryKey = "painting" | "book" | "story" | "artefact" | "biography"

const CATEGORY_CONFIG: Record<CategoryKey, { color: string; texture: string; icon: string }> = {
  painting:  { color: "#eca12c", texture: "/watercolour-texture-creativity.jpg", icon: "/Creations_Selected.svg"   },
  story:     { color: "#046335", texture: "/watercolour-texture-stories.jpg",    icon: "/Stories_Selected.svg"     },
  artefact:  { color: "#054693", texture: "/watercolour-texture-events.jpg",     icon: "/Discoveries_Selected.svg" },
  biography: { color: "#685889", texture: "/watercolour-texture-figures.jpg",    icon: "/Figures_Selected.svg"     },
  book:      { color: "#ab4134", texture: "/watercolour-texture-books.jpg",      icon: "/Books_Selected.svg"       },
}
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
    return Promise.resolve(window.maptilersdk as MapTilerSDK)
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
          if (window.maptilersdk) resolve(window.maptilersdk as MapTilerSDK)
        })
        existingScript.addEventListener("error", () => reject(new Error("MapTiler failed to load.")))
        return
      }

      const script = document.createElement("script")
      script.src = mapTilerScriptUrl
      script.async = true
      script.onload = () => {
        if (window.maptilersdk) {
          resolve(window.maptilersdk as MapTilerSDK)
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
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryKey>>(new Set())
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const ALL_CATEGORIES: CategoryKey[] = ["painting", "story", "artefact", "biography", "book"]

  const categories = ALL_CATEGORIES

  const filteredLocations = useMemo(
    () =>
      selectedCategories.size === 0
        ? currentLocations
        : currentLocations.filter((location) =>
            location.categories.some((c) => selectedCategories.has(c))
          ),
    [currentLocations, selectedCategories]
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

  // Related-content click inside the sidebar: select the item on the map instead of
  // navigating to its detail page. Returns false if the item has no map location
  // (e.g. it's been filtered/hidden), so the caller can fall back to normal navigation.
  const selectRelatedItem = useCallback(
    (related: PublicRelatedContent): boolean => {
      for (const location of currentLocations) {
        const content = location.content.find((c) => c.id === related.id)
        if (!content) continue

        setSelectedCategories(new Set())
        openItem({ content, location })

        const coords = coordinatesFor(location)
        if (coords && mapRef.current) {
          mapRef.current.flyTo({ center: coords, zoom: 14.5, duration: 600 })
        }

        return true
      }
      return false
    },
    [currentLocations, openItem]
  )

  function openLeftMenu() {
    setOpenPanel((current) => (current === "left" ? null : "left"))
  }

  function closePanels() {
    setOpenPanel(null)
  }

  function selectCategory(category: CategoryKey) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
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
                const cfg = CATEGORY_CONFIG[mapItem.content.contentType as CategoryKey]
                const pinBg = cfg
                  ? `background-image:url(${cfg.texture});background-size:cover;background-position:center`
                  : "background:#00744b"
                const pinIcon = cfg
                  ? `<img src="${cfg.icon}" alt="" width="26" height="26" style="display:block" />`
                  : `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg);width:22px;height:22px"><path d="M20 10c0 4.99-5.54 10.19-7.4 11.78a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
                el.innerHTML = `
                  <span class="public-map-marker__label">${pinLabel}</span>
                  <span class="public-map-marker__pin" style="${pinBg}">${pinIcon}</span>
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
    const maptilersdk = window.maptilersdk as MapTilerSDK
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
    <main className="relative h-screen overflow-hidden bg-[#f8f6ed] text-neutral-950">
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


        <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-2 overflow-x-auto px-1 pb-1 pt-1">
          {categories.map((category) => {
            const cfg = CATEGORY_CONFIG[category]
            if (!cfg) return null
            const isActive = selectedCategories.size === 0 || selectedCategories.has(category)
            return (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                aria-pressed={selectedCategories.has(category)}
                style={{
                  backgroundImage: `url(${cfg.texture})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className={`flex h-11 shrink-0 items-center gap-2 rounded-full pl-2 pr-4 text-[14px] font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
                  isActive ? "opacity-100" : "opacity-60"
                }`}
              >
                <img
                  src={cfg.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 drop-shadow-sm"
                />
                <span className="drop-shadow-sm">
                  {t(`filter.${category}`, currentLang)}
                </span>
              </button>
            )
          })}
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
            className="h-full w-[min(84vw,330px)]"
            aria-hidden={openPanel !== "left"}
            inert={openPanel !== "left"}
          >
            <PublicNavPanel
              lang={currentLang}
              activePath="/map"
              onLangChange={switchLang}
            />
          </aside>

          {/* Toggle button — rides the right edge of the panel */}
          <button
            type="button"
            onClick={openLeftMenu}
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-950/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-neutral-950/60 lg:h-14 lg:w-14"
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
              className="h-5 w-5 lg:h-7 lg:w-7"
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
            onSelectRelated={selectRelatedItem}
          />
        ) : null}
      </section>
    </main>
  )
}
