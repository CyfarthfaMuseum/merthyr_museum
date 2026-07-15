"use client"

import { useEffect, useRef } from "react"

const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? process.env.NEXT_PUBLIC_MAPTILER_KEY ?? ""
const scriptUrl = "https://cdn.jsdelivr.net/npm/@maptiler/sdk/dist/maptiler-sdk.umd.min.js"
const cssUrl = "https://cdn.jsdelivr.net/npm/@maptiler/sdk/dist/maptiler-sdk.css"
const styleUrl = `https://api.maptiler.com/maps/aquarelle/style.json?key=${encodeURIComponent(apiKey)}`
const center: [number, number] = [-3.3782, 51.7487]

type MapSDK = {
  config: { apiKey: string }
  Map: new (opts: Record<string, unknown>) => { remove: () => void; resize: () => void }
}

declare global {
  interface Window { maptilersdk?: MapSDK }
}

let sdkPromise: Promise<MapSDK> | null = null

function loadSDK(): Promise<MapSDK> {
  if (typeof window === "undefined") return Promise.reject()
  if (window.maptilersdk) return Promise.resolve(window.maptilersdk)

  if (!document.querySelector(`link[href="${cssUrl}"]`)) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = cssUrl
    document.head.appendChild(link)
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`)
      if (existing) {
        existing.addEventListener("load", () => window.maptilersdk && resolve(window.maptilersdk))
        existing.addEventListener("error", reject)
        return
      }
      const script = document.createElement("script")
      script.src = scriptUrl
      script.async = true
      script.onload = () => window.maptilersdk ? resolve(window.maptilersdk) : reject()
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  return sdkPromise
}

export default function PublicOverviewMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ remove: () => void; resize: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!containerRef.current || mapRef.current || !apiKey) return

    loadSDK().then((sdk) => {
      if (cancelled || !containerRef.current) return
      sdk.config.apiKey = apiKey
      const map = new sdk.Map({
        container: containerRef.current,
        style: styleUrl,
        center,
        zoom: 12.5,
        interactive: false,
        attributionControl: false,
        navigationControl: false,
        geolocateControl: false,
      })
      mapRef.current = map
      window.requestAnimationFrame(() => map.resize())
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  if (!apiKey) return null

  return <div ref={containerRef} className="h-full w-full" />
}
