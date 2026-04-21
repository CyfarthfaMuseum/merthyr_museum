'use client'

import { useState } from 'react'
import Input from '../ui/Input'
import { BlackButton, GreenButton } from '../ui/Buttons'
import SectionTitle from '../ui/SectionTitle'
import { uploadImageToR2 } from '../../upload-image'
import { saveImageMetadataAction } from '../../image-actions'

type Props = {
  contentItemId?: string | null
}

export default function ImageManager({ contentItemId }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [credit, setCredit] = useState('')
  const [isPrimary, setIsPrimary] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

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

      const uploaded = await uploadImageToR2(file)

      const dimensions = await getImageDimensions(file)

      const result = await saveImageMetadataAction({
        contentItemId,
        objectKey: uploaded.objectKey,
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

      setMessage('Image uploaded successfully.')
      setFile(null)
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
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

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

      <div className="flex gap-3">
        <GreenButton onClick={handleUpload} disabled={isUploading}>
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