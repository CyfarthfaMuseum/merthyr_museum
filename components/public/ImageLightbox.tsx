"use client"

import { useEffect, useRef, useState } from "react"
import { X, ZoomIn, ZoomOut } from "lucide-react"

type Point = { x: number; y: number }

const MIN_SCALE = 1
const MAX_SCALE = 4

export default function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 })
  const [isInteracting, setIsInteracting] = useState(false)

  const pointersRef = useRef<Map<number, Point>>(new Map())
  const dragStartRef = useRef<Point | null>(null)
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function clampScale(value: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))
  }

  function applyScale(next: number) {
    const clamped = clampScale(next)
    setScale(clamped)
    if (clamped === MIN_SCALE) setPos({ x: 0, y: 0 })
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    applyScale(scale + (e.deltaY < 0 ? 0.3 : -0.3))
  }

  function handleDoubleClick() {
    if (scale > 1) {
      setScale(1)
      setPos({ x: 0, y: 0 })
    } else {
      applyScale(2)
    }
  }

  function pointerDistance(a: Point, b: Point) {
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  function handlePointerDown(e: React.PointerEvent) {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    setIsInteracting(true)

    if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values())
      pinchRef.current = { distance: pointerDistance(a, b), scale }
      dragStartRef.current = null
    } else if (pointersRef.current.size === 1 && scale > 1) {
      dragStartRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const [a, b] = Array.from(pointersRef.current.values())
      const newDistance = pointerDistance(a, b)
      const nextScale = clampScale(
        pinchRef.current.scale * (newDistance / pinchRef.current.distance)
      )
      setScale(nextScale)
      if (nextScale === MIN_SCALE) setPos({ x: 0, y: 0 })
      return
    }

    if (pointersRef.current.size === 1 && dragStartRef.current && scale > 1) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      setPos((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) pinchRef.current = null
    if (pointersRef.current.size === 0) {
      dragStartRef.current = null
      setIsInteracting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-neutral-950/95"
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
    >
      <div className="flex h-14 shrink-0 items-center justify-end gap-1 px-3">
        <button
          type="button"
          onClick={() => applyScale(scale - 0.5)}
          disabled={scale <= MIN_SCALE}
          className="flex h-10 w-10 items-center justify-center text-white/80 transition hover:text-white disabled:opacity-30"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => applyScale(scale + 0.5)}
          disabled={scale >= MAX_SCALE}
          className="flex h-10 w-10 items-center justify-center text-white/80 transition hover:text-white disabled:opacity-30"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center text-white/80 transition hover:text-white"
          aria-label="Close image preview"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        className="relative flex-1 touch-none select-none overflow-hidden"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute left-1/2 top-1/2 h-[90vh] max-w-none object-contain"
          style={{
            transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: isInteracting ? "none" : "transform 150ms ease-out",
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
        />
      </div>
    </div>
  )
}
