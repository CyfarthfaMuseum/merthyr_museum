'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Pencil, Plus, Printer, Trash2, X } from 'lucide-react'
import Input from '../ui/Input'
import { BlackButton } from '../ui/Buttons'
import SectionTitle from '../ui/SectionTitle'
import { uploadImageToR2 } from '../../upload-image'
import { saveImageMetadataAction } from '../../image-actions'

type Props = {
  contentItemId?: string | null
  contentType: 'book' | 'stories' | 'painting' | 'artifacts' | 'bio'
  slugValue: string
  onSlugChange: (value: string) => void
  onUploaded?: (mediaAssetId: string) => void
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

export default function ImageManager({
  contentItemId,
  contentType,
  slugValue,
  onSlugChange,
  onUploaded,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewObjectUrlsRef = useRef<string[]>([])

  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageryMessage, setImageryMessage] = useState('')
  const [qrMessage, setQrMessage] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrLink, setQrLink] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>({
    phase: 'idle',
    details: '',
  })

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
              <div className="h-32 w-32 rounded-md border border-dashed border-neutral-300 bg-neutral-100" />
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
                  className="flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-neutral-950 text-white disabled:cursor-not-allowed disabled:opacity-70"
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

    </div>
  )
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
