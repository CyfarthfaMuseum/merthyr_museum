'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Input from '../ui/Input'
import { GreenButton } from '../ui/Buttons'
import SectionTitle from '../ui/SectionTitle'
import { uploadImageToR2 } from '../../upload-image'
import { saveImageMetadataAction } from '../../image-actions'

type Props = {
  contentItemId?: string | null
  contentType: 'book' | 'stories' | 'painting' | 'artifacts' | 'bio'
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

export default function ImageManager({ contentItemId, contentType, onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewObjectUrlsRef = useRef<string[]>([])

  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

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

  function updateSelectedImage(patch: Partial<Pick<ImageItem, 'altText' | 'caption' | 'credit' | 'isPrimary'>>) {
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

        if (typeof patch.isPrimary === 'boolean') {
          return { ...image, ...patch }
        }

        return { ...image, ...patch }
      })
    )
  }

  async function handleUpload(selectedFile: File) {
    if (!contentItemId) {
      setMessage('Save the content item first, then add images.')
      return
    }

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
      setMessage('')

      console.info('[ImageManager] Starting upload to Cloudflare R2', {
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        mimeType: selectedFile.type,
        contentType,
      })

      const uploaded = await uploadImageToR2(selectedFile, contentType)

      console.info('[ImageManager] Upload to Cloudflare R2 succeeded', {
        objectKey: uploaded.objectKey,
        publicUrl: uploaded.publicUrl,
      })

      const dimensions = await getImageDimensions(selectedFile)

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
        setMessage(result.error ?? 'Upload failed.')
        setImages((current) => current.filter((image) => image.localId !== localId))
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

      if (onUploaded) {
        onUploaded(result.mediaAssetId)
      }

      setMessage('Image uploaded successfully.')
    } catch (error) {
      console.error('[ImageManager] Upload failed', error)
      setMessage(error instanceof Error ? error.message : 'Upload failed.')
      setImages((current) => current.filter((image) => image.localId !== localId))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Images</SectionTitle>

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

      <div className="space-y-4 rounded-2xl border border-neutral-300 bg-neutral-50 p-6">
        {selectedImage ? (
          <div className="overflow-hidden rounded-xl border border-neutral-300 bg-white">
            <Image
              src={selectedImage.previewUrl}
              alt={selectedImage.altText || selectedImage.fileName || 'Selected image preview'}
              width={1200}
              height={700}
              unoptimized
              className="h-[320px] w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-[320px] items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-500">
            Select an image to preview
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="flex w-max items-start gap-3 pb-1">
            {images.map((image) => (
              <button
                key={image.localId}
                type="button"
                onClick={() => setSelectedImageId(image.localId)}
                className={`relative h-24 w-24 overflow-hidden rounded-lg border transition ${
                  selectedImageId === image.localId
                    ? 'border-neutral-900 ring-2 ring-neutral-300'
                    : 'border-neutral-300'
                }`}
                title={image.fileName}
              >
                <Image
                  src={image.previewUrl}
                  alt={image.altText || image.fileName}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
                {image.isUploading ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                    Uploading...
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedImage ? (
        <>
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
        </>
      ) : null}

      <div className="flex gap-3">
        <GreenButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'UPLOADING...' : 'ADD IMAGE'}
        </GreenButton>
      </div>

      {message ? <p className="text-sm text-neutral-700">{message}</p> : null}
    </div>
  )
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      })
      URL.revokeObjectURL(objectUrl)
    }

    img.onerror = () => {
      reject(new Error('Could not read image dimensions.'))
      URL.revokeObjectURL(objectUrl)
    }

    img.src = objectUrl
  })
}
