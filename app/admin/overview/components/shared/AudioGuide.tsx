'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { BlackButton } from '../ui/Buttons'
import SectionTitle from '../ui/SectionTitle'
import { saveAudioAction, deleteAudioAction } from '../../image-actions'
import type { AudioItem } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'

type Props = {
  contentItemId?: string | null
  contentType: string
  initialAudio?: AudioItem | null
  onError?: (message: string) => void
  onUploaded?: (mediaAssetId: string) => void
  uiLang: UiLang
}

const MAX_SIZE = 15 * 1024 * 1024
const allowedAudioExtensions = new Set(['.mp3', '.mp4', '.m4a'])

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

function isAllowedAudioFile(file: File) {
  const extension = getFileExtension(file.name)
  return file.type.includes('audio') || file.type === 'video/mp4' || allowedAudioExtensions.has(extension)
}

function getAudioMimeType(file: File) {
  if (file.type) return file.type

  const extension = getFileExtension(file.name)
  if (extension === '.mp4' || extension === '.m4a') return 'audio/mp4'

  return 'audio/mpeg'
}

export default function AudioGuide({ contentItemId, contentType, initialAudio, onError, onUploaded, uiLang }: Props) {
  const t = uiStrings[uiLang]
  const [audio, setAudio] = useState<AudioItem | null>(initialAudio ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return

    if (!isAllowedAudioFile(file)) {
      onError?.(t.audioMp3Only)
      return
    }

    if (file.size > MAX_SIZE) {
      onError?.(t.audioFileTooLarge)
      return
    }

    setIsUploading(true)
    try {
      const presignRes = await fetch('/admin/api/uploads/audio/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          fileName: file.name,
          mimeType: getAudioMimeType(file),
          fileSizeBytes: file.size,
        }),
      })

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => null)
        throw new Error(err?.error ?? 'Failed to get upload URL.')
      }

      const { uploadUrl, objectKey, publicUrl } = await presignRes.json()

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': getAudioMimeType(file) },
        body: file,
      })

      if (!uploadRes.ok) throw new Error('Upload to storage failed.')

      const result = await saveAudioAction({
        contentItemId,
        objectKey,
        publicUrl,
        fileName: file.name,
        mimeType: getAudioMimeType(file),
        fileSizeBytes: file.size,
      })

      if (!result.success) throw new Error(result.error)

      setAudio({ mediaAssetId: result.mediaAssetId, fileName: file.name, url: publicUrl ?? null })
      if (!contentItemId) {
        onUploaded?.(result.mediaAssetId)
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleRemove() {
    if (!audio || !contentItemId) return
    const result = await deleteAudioAction({
      mediaAssetId: audio.mediaAssetId,
      contentItemId,
    })
    if (!result.success) {
      onError?.(result.error)
      return
    }
    setAudio(null)
  }

  return (
    <div className="space-y-4">
      <SectionTitle>{t.audioGuide}</SectionTitle>

      <div className="flex flex-wrap items-center gap-4">
        <BlackButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !!audio}
        >
          {isUploading ? t.uploadingAudio : t.uploadAudioGuide}
        </BlackButton>
        <span className="text-sm text-neutral-500">
          {t.audioFileRequirements}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.mp4,.m4a,audio/mpeg,audio/mp3,audio/x-mp3,audio/mp4,audio/m4a,audio/x-m4a,video/mp4"
        className="sr-only"
        onChange={handleFileChange}
      />

      {audio && (
        <div className="flex w-fit items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2">
          <span className="text-sm text-neutral-700">{audio.fileName}</span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-neutral-400 hover:text-neutral-700"
            aria-label="Remove audio guide"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
