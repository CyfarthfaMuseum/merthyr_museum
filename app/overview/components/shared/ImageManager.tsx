'use client'

import { useEffect, useRef, useState } from 'react'
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

export default function ImageManager({ contentItemId, contentType, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [credit, setCredit] = useState('')
  const [isPrimary, setIsPrimary] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const previewObjectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
      }
    }
  }, [])

  function setPreviewFromFile(nextFile: File | null) {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
      previewObjectUrlRef.current = null
    }

    if (!nextFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(nextFile)
    previewObjectUrlRef.current = objectUrl
    setPreviewUrl(objectUrl)
  }

  async function handleUpload() {
    if (!contentItemId) {
      setMessage('Save the content item first, then add images.')
      return
    }

    if (!file) {
      setMessage('Please choose an image first.')
      return
    }

    try {
      setIsUploading(true)
      setMessage('')

      const uploaded = await uploadImageToR2(file, contentType)

      const dimensions = await getImageDimensions(file)

      const result = await saveImageMetadataAction({
        contentItemId,
        objectKey: uploaded.objectKey,
        publicUrl: uploaded.publicUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        width: dimensions.width,
        height: dimensions.height,
        altText,
        caption,
        credit,
        isPrimary,
        sortOrder: 0,
        role: 'other',
        languageCode: 'en',
      })

      if (!result.success) {
        setMessage(result.error)
        return
      }

      if (result.mediaAssetId && onUploaded) {
        onUploaded(result.mediaAssetId)
      }

      setMessage('Image uploaded successfully.')
      setFile(null)
      setPreviewFromFile(null)
      setAltText('')
      setCaption('')
      setCredit('')
      setIsPrimary(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Images</SectionTitle>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] ?? null
          setFile(selectedFile)
          setPreviewFromFile(selectedFile)
          setAltText('')
          setCaption('')
          setCredit('')
          setIsPrimary(true)
        }}
      />

      {previewUrl ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-neutral-300 bg-neutral-50">
            <Image
              src={previewUrl}
              alt={altText || file?.name || 'Selected image preview'}
              width={1200}
              height={900}
              unoptimized
              className="max-h-96 w-full object-contain"
            />
          </div>

          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Alt text"
          />

          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption"
          />

          <Input
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            placeholder="Credit"
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
            <span>Set as primary image</span>
          </label>
        </div>
      ) : null}

      <div className="flex gap-3">
        <GreenButton onClick={handleUpload} disabled={isUploading || !file}>
          {isUploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
        </GreenButton>
      </div>

      {message ? <p className="text-sm text-neutral-700">{message}</p> : null}
    </div>
  )
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

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
