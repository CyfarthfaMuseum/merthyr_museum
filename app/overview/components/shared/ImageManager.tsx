'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { MapPin, Pencil, Plus, Printer, Trash2, X } from 'lucide-react'
import Input from '../ui/Input'
import { BlackButton } from '../ui/Buttons'
import SectionTitle from '../ui/SectionTitle'
import { uploadImageToR2 } from '../../upload-image'
import { saveImageMetadataAction } from '../../image-actions'

type InitialImage = {
  id: string
  previewUrl: string
  fileName: string
  altText: string
  caption: string
  credit: string
  isPrimary: boolean
}

type Props = {
  contentItemId?: string | null
  contentType: 'book' | 'stories' | 'painting' | 'artifacts' | 'bio'
  slugValue: string
  onSlugChange: (value: string) => void
  onUploaded?: (mediaAssetId: string) => void
  initialImages?: InitialImage[]
}

type ImageItem = {
  localId: string
  fileName: string
  previewUrl: string
  mediaAssetId?: string
  altText: string
  caption: string
  credit: string
  isPrimary: boolean
  isUploading: boolean
}

type UploadState = {
  phase: 'idle' | 'requesting-url' | 'uploading-r2' | 'saving-metadata' | 'done' | 'error'
  details: string
}

type LeafletLatLng = { lat: number; lng: number }
type LeafletMouseEvent = { latlng: LeafletLatLng }
type LeafletMap = {
  setView: (center: [number, number], zoom: number) => LeafletMap
  on: (event: 'click', handler: (event: LeafletMouseEvent) => void) => LeafletMap
  invalidateSize: () => void
  remove: () => void
}
type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker
  setLatLng: (position: [number, number]) => LeafletMarker
}
type LeafletNamespace = {
  map: (element: HTMLElement) => LeafletMap
  tileLayer: (urlTemplate: string, options: { maxZoom: number; attribution: string }) => { addTo: (map: LeafletMap) => void }
  marker: (position: [number, number]) => LeafletMarker
}

declare global {
  interface Window {
    L?: LeafletNamespace
  }
}

let leafletLoader: Promise<void> | null = null

function toImageItems(initialImages: InitialImage[]): ImageItem[] {
  return initialImages.map((image) => ({
    localId: image.id,
    mediaAssetId: image.id,
    previewUrl: image.previewUrl,
    fileName: image.fileName,
    altText: image.altText,
    caption: image.caption,
    credit: image.credit,
    isPrimary: image.isPrimary,
    isUploading: false,
  }))
}

export default function ImageManager({
  contentItemId,
  contentType,
  slugValue,
  onSlugChange,
  onUploaded,
  initialImages = [],
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewObjectUrlsRef = useRef<string[]>([])
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const selectedCoordinatesRef = useRef<{ lat: number; lng: number } | null>(null)

  const [images, setImages] = useState<ImageItem[]>(() => toImageItems(initialImages))
  const [selectedImageId, setSelectedImageId] = useState<string | null>(() => toImageItems(initialImages)[0]?.localId ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageryMessage, setImageryMessage] = useState('')
  const [qrMessage, setQrMessage] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrLink, setQrLink] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>({
    phase: 'idle',
    details: '',
  })
  const [locationMessage, setLocationMessage] = useState('')
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [locationAddress, setLocationAddress] = useState('')
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(
    null
  )

  useEffect(() => {
    selectedCoordinatesRef.current = selectedCoordinates
  }, [selectedCoordinates])

  useEffect(() => {
    const previewObjectUrls = previewObjectUrlsRef.current

    return () => {
      previewObjectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const selectedImage = useMemo(
    () => images.find((image) => image.localId === selectedImageId) ?? null,
    [images, selectedImageId]
  )

  const primaryImage = useMemo(
    () => images.find((image) => image.isPrimary) ?? images[0] ?? null,
    [images]
  )
  const additionalImages = useMemo(
    () => images.filter((image) => image.localId !== primaryImage?.localId),
    [images, primaryImage?.localId]
  )

  useEffect(() => {
    if (!isLocationDialogOpen) {
      return
    }

    let isCancelled = false

    const initializeMap = async () => {
      await loadLeaflet()

      if (isCancelled || !mapContainerRef.current) {
        return
      }

      const L = window.L
      if (!L) {
        return
      }

      if (!mapInstanceRef.current) {
        const initialCoordinates = selectedCoordinatesRef.current
        const initialPosition: [number, number] = initialCoordinates
          ? [initialCoordinates.lat, initialCoordinates.lng]
          : [51.7465, -3.378]
        const initialZoom = initialCoordinates ? 16 : 13
        const map = L.map(mapContainerRef.current).setView(initialPosition, initialZoom)
        mapInstanceRef.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        if (initialCoordinates) {
          markerRef.current = L.marker([initialCoordinates.lat, initialCoordinates.lng]).addTo(map)
        }

        map.on('click', (event: LeafletMouseEvent) => {
          const { lat, lng } = event.latlng
          setSelectedCoordinates({ lat, lng })

          if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng]).addTo(map)
          } else {
            markerRef.current.setLatLng([lat, lng])
          }
        })
      }

      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize()
      }, 0)
    }

    void initializeMap()

    return () => {
      isCancelled = true
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [isLocationDialogOpen])

  function updateSelectedImage(
    patch: Partial<Pick<ImageItem, 'altText' | 'caption' | 'credit' | 'isPrimary'>>
  ) {
    if (!selectedImageId) {
      return
    }

    setImages((current) =>
      current.map((image) => {
        if (image.localId !== selectedImageId) {
          if (patch.isPrimary && image.isPrimary) {
            return { ...image, isPrimary: false }
          }

          return image
        }

        return { ...image, ...patch }
      })
    )
  }

  function removeImage(localId: string) {
    setImages((current) => {
      const nextImages = current.filter((image) => image.localId !== localId)

      setSelectedImageId((currentSelectedId) => {
        if (currentSelectedId !== localId) {
          return currentSelectedId
        }

        return nextImages[0]?.localId ?? null
      })

      return nextImages
    })
  }

  async function handleUpload(selectedFile: File) {
    const localId = crypto.randomUUID()
    const previewUrl = URL.createObjectURL(selectedFile)
    previewObjectUrlsRef.current.push(previewUrl)

    const nextItem: ImageItem = {
      localId,
      fileName: selectedFile.name,
      previewUrl,
      altText: '',
      caption: '',
      credit: '',
      isPrimary: images.every((image) => !image.isPrimary),
      isUploading: true,
    }

    setImages((current) => [...current, nextItem])
    setSelectedImageId(localId)

    try {
      setIsUploading(true)
      setImageryMessage('')
      setUploadState({
        phase: 'requesting-url',
        details: 'Requesting upload URL from the server...',
      })

      const uploaded = await uploadImageToR2(selectedFile, contentType, {
        onPhaseChange: (phase) => {
          if (phase === 'requesting-presigned-url') {
            setUploadState({
              phase: 'requesting-url',
              details: 'Requesting upload URL from the server...',
            })
            return
          }

          setUploadState({
            phase: 'uploading-r2',
            details: 'Uploading image bytes to Cloudflare R2...',
          })
        },
      })
      const dimensions = await getImageDimensions(selectedFile)

      setUploadState({
        phase: 'saving-metadata',
        details: 'Saving image metadata in the database...',
      })
      const result = await saveImageMetadataAction({
        contentItemId,
        objectKey: uploaded.objectKey,
        publicUrl: uploaded.publicUrl,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        fileSizeBytes: selectedFile.size,
        width: dimensions.width,
        height: dimensions.height,
        altText: '',
        caption: '',
        credit: '',
        isPrimary: nextItem.isPrimary,
        sortOrder: images.length,
        role: 'other',
        languageCode: 'en',
      })

      if (!result.success || !result.mediaAssetId) {
        const failure = result.error ?? 'Upload failed while saving metadata.'
        setUploadState({
          phase: 'error',
          details: failure,
        })
        setImageryMessage(`Image uploaded to R2, but metadata save failed: ${failure}`)
        setImages((current) =>
          current.map((image) =>
            image.localId === localId
              ? {
                  ...image,
                  isUploading: false,
                }
              : image
          )
        )
        return
      }

      setImages((current) =>
        current.map((image) =>
          image.localId === localId
            ? {
                ...image,
                mediaAssetId: result.mediaAssetId,
                isUploading: false,
              }
            : image
        )
      )

      onUploaded?.(result.mediaAssetId)
      setUploadState({
        phase: 'done',
        details: 'Upload complete.',
      })
      setImageryMessage('Image uploaded successfully.')
    } catch (error) {
      console.error('[ImageManager] Upload failed', error)
      const failureMessage = error instanceof Error ? error.message : 'Upload failed.'
      setUploadState({
        phase: 'error',
        details: failureMessage,
      })
      setImageryMessage(failureMessage)
      removeImage(localId)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleGenerateQr() {
    const slug = slugValue.trim()
    if (!slug) {
      setQrMessage('Please enter a slug before generating a QR code.')
      return
    }

    const qrUrl = `https://merthyrmuseummap.app/location/${contentType}/${contentItemId ?? 'draft'}-${slug}`
    const encoded = encodeURIComponent(qrUrl)
    const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&format=png&data=${encoded}`

    setQrLink(qrUrl)
    setQrDataUrl(generatedQrUrl)
    setQrMessage('QR code generated.')
  }

  async function handleConfirmLocation() {
    if (!selectedCoordinates) {
      setLocationMessage('Please drop a pin before confirming location.')
      return
    }

    const { lat, lng } = selectedCoordinates
    let resolvedAddress = 'Address not found'

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      )
      if (response.ok) {
        const result = await response.json()
        resolvedAddress = result.display_name || resolvedAddress
      }
    } catch (error) {
      console.error('[Location] Reverse geocoding failed', error)
    }

    setLocationAddress(resolvedAddress)
    console.log('[Location selected]', {
      address: resolvedAddress,
      latitude: lat,
      longitude: lng,
    })
    setLocationMessage('Location confirmed. Address and coordinates were logged in the console.')
    setIsLocationDialogOpen(false)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <SectionTitle>Imagery</SectionTitle>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] ?? null
            if (!selectedFile) {
              return
            }

            void handleUpload(selectedFile)
          }}
        />

        <div className="grid gap-6 lg:grid-cols-[160px_minmax(0,1fr)]">
          <div className="space-y-2">
            <p className="text-[18px] text-neutral-800">Primary</p>
            {primaryImage ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImageId(primaryImage.localId)}
                  className="h-32 w-32 overflow-hidden rounded-md border border-neutral-300"
                >
                  <Image
                    src={primaryImage.previewUrl}
                    alt={primaryImage.altText || primaryImage.fileName}
                    width={128}
                    height={128}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </button>
                <div className="flex items-center justify-center gap-3 text-neutral-700">
                  <button type="button" onClick={() => setSelectedImageId(primaryImage.localId)}>
                    <Pencil size={20} />
                  </button>
                  <button type="button" onClick={() => removeImage(primaryImage.localId)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="h-32 w-32 rounded-md border border-dashed border-neutral-300 bg-white" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[18px] text-neutral-800">Additional Imagery</p>
            <div className="max-w-full overflow-x-auto pb-2">
              <div className="flex w-max items-start gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white disabled:cursor-not-allowed disabled:opacity-70"
                  title="Add image"
                >
                  <Plus size={34} />
                </button>

                {additionalImages.map((image) => (
                  <div key={image.localId} className="shrink-0 space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedImageId(image.localId)}
                      className={`relative h-32 w-32 overflow-hidden rounded-md border ${
                        selectedImageId === image.localId ? 'border-neutral-900' : 'border-neutral-300'
                      }`}
                    >
                      <Image
                        src={image.previewUrl}
                        alt={image.altText || image.fileName}
                        width={128}
                        height={128}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                      {image.isUploading ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">
                          Uploading...
                        </span>
                      ) : null}
                    </button>
                    <div className="flex items-center justify-center gap-3 text-neutral-700">
                      <button type="button" onClick={() => setSelectedImageId(image.localId)}>
                        <Pencil size={18} />
                      </button>
                      <button type="button" onClick={() => removeImage(image.localId)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {Array.from({ length: Math.max(0, 4 - additionalImages.length) }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="h-32 w-32 shrink-0 rounded-md bg-neutral-100"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {imageryMessage ? <p className="text-sm text-neutral-700">{imageryMessage}</p> : null}
      </div>

        {selectedImage ? (
          <div className="grid gap-3 rounded-xl border border-neutral-300 p-4 md:grid-cols-2">
            <Input
              value={selectedImage.altText}
              onChange={(e) => updateSelectedImage({ altText: e.target.value })}
              placeholder="Alt text"
            />

            <Input
              value={selectedImage.caption}
              onChange={(e) => updateSelectedImage({ caption: e.target.value })}
              placeholder="Caption"
            />

            <Input
              value={selectedImage.credit}
              onChange={(e) => updateSelectedImage({ credit: e.target.value })}
              placeholder="Credit"
            />

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedImage.isPrimary}
                onChange={(e) => updateSelectedImage({ isPrimary: e.target.checked })}
              />
              <span>Set as primary image</span>
            </label>
          </div>
        ) : null}
      <div className="border-t border-neutral-300 pt-8">
        <SectionTitle>Location</SectionTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            value={locationAddress}
            readOnly
            placeholder="Select from Locations"
            aria-label="Selected location"
          />
          <BlackButton className="min-w-[260px]" onClick={() => setIsLocationDialogOpen(true)}>
            SET LOCATION
          </BlackButton>
        </div>

        {selectedCoordinates ? (
          <div className="mt-4 rounded-xl border border-neutral-300 p-4 text-[16px] text-neutral-800">
            <p className="font-medium">{locationAddress || 'Pin selected'}</p>
            <p className="mt-2 text-neutral-700">
              Lat: {selectedCoordinates.lat.toFixed(6)}, Lng: {selectedCoordinates.lng.toFixed(6)}
            </p>
          </div>
        ) : null}

        {locationMessage ? <p className="mt-3 text-sm text-neutral-700">{locationMessage}</p> : null}
      </div>

      <div className="border-t border-neutral-300 pt-8">
        <SectionTitle>QR Code</SectionTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            value={slugValue}
            onChange={(e) => {
              const nextValue = e.target.value
              setQrMessage('')
              onSlugChange(nextValue)
            }}
            placeholder="Enter slug / QR value"
          />
          <BlackButton
            className="min-w-[260px]"
            onClick={handleGenerateQr}
            disabled={isUploading || !slugValue.trim()}
          >
            GENERATE QR CODE
          </BlackButton>
        </div>

        {qrDataUrl ? (
          <div className="mt-5 grid gap-4 rounded-xl border border-neutral-400 p-4 md:grid-cols-[220px_1fr_auto]">
            <Image src={qrDataUrl} alt="Generated QR code" width={220} height={220} unoptimized />
            <div className="space-y-2 text-[18px] text-neutral-800">
              <p className="font-medium">Slug</p>
              <p>{slugValue}</p>
              <p className="break-all text-neutral-700">{qrLink}</p>
              <BlackButton
                className="mt-3"
                onClick={() => window.open(qrDataUrl, '_blank', 'noopener,noreferrer')}
              >
                <span className="inline-flex items-center gap-2">
                  <Printer size={18} />
                  PRINT QR CODE
                </span>
              </BlackButton>
            </div>
            <button
              type="button"
              onClick={() => {
                setQrDataUrl('')
                setQrLink('')
              }}
              className="self-start justify-self-end text-neutral-700"
              aria-label="Remove QR code"
            >
              <X size={30} />
            </button>
          </div>
        ) : null}

        {qrMessage ? <p className="mt-3 text-sm text-neutral-700">{qrMessage}</p> : null}
      </div>

      {isUploading ? (
        <p className="text-sm text-neutral-600">
          Upload activity: {uploadState.details || 'Preparing upload...'}
        </p>
      ) : null}

      {isLocationDialogOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-neutral-300 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Select Location</h2>
              <p className="text-sm text-neutral-600">Click anywhere on the map to drop a pin.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsLocationDialogOpen(false)}
              aria-label="Close location dialog"
              className="rounded-md p-2 text-neutral-700 hover:bg-white"
            >
              <X size={28} />
            </button>
          </div>

          <div ref={mapContainerRef} className="min-h-0 flex-1" />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-300 px-6 py-4">
            <p className="text-sm text-neutral-700">
              {selectedCoordinates
                ? `Selected: ${selectedCoordinates.lat.toFixed(6)}, ${selectedCoordinates.lng.toFixed(6)}`
                : 'No pin selected yet.'}
            </p>
            <div className="flex items-center gap-3">
              <BlackButton
                className="bg-white text-neutral-900 hover:bg-neutral-300"
                onClick={() => setIsLocationDialogOpen(false)}
              >
                CANCEL
              </BlackButton>
              <BlackButton onClick={() => void handleConfirmLocation()} disabled={!selectedCoordinates}>
                <span className="inline-flex items-center gap-2">
                  <MapPin size={18} />
                  CONFIRM LOCATION
                </span>
              </BlackButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function loadLeaflet(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.L) {
    return Promise.resolve()
  }

  if (leafletLoader) {
    return leafletLoader
  }

  leafletLoader = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-style')) {
      const leafletStyle = document.createElement('link')
      leafletStyle.id = 'leaflet-style'
      leafletStyle.rel = 'stylesheet'
      leafletStyle.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(leafletStyle)
    }

    const existingScript = document.getElementById('leaflet-script') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Could not load Leaflet script.')), {
        once: true,
      })
      return
    }

    const leafletScript = document.createElement('script')
    leafletScript.id = 'leaflet-script'
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    leafletScript.async = true
    leafletScript.onload = () => resolve()
    leafletScript.onerror = () => reject(new Error('Could not load Leaflet script.'))
    document.body.appendChild(leafletScript)
  })

  return leafletLoader
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(objectUrl)
    }

    img.onerror = () => {
      reject(new Error('Could not read image dimensions.'))
      URL.revokeObjectURL(objectUrl)
    }

    img.src = objectUrl
  })
}
