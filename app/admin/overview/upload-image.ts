type PresignResponse = {
  uploadUrl: string
  objectKey: string
  publicUrl: string | null
}

type UploadImageResult = {
  objectKey: string
  publicUrl: string | null
}

type UploadPhase = 'requesting-presigned-url' | 'uploading-to-r2'
type UploadImageOptions = {
  onPhaseChange?: (phase: UploadPhase) => void
}

function buildUploadError(phase: UploadPhase, message: string) {
  return new Error(`[${phase}] ${message}`)
}

export async function uploadImageToR2(
  file: File,
  contentType: 'book' | 'stories' | 'painting' | 'artifacts' | 'bio' | 'generic',
  options?: UploadImageOptions
): Promise<UploadImageResult> {
  options?.onPhaseChange?.('requesting-presigned-url')
  console.info('[uploadImageToR2] Requesting presigned URL', {
    fileName: file.name,
    mimeType: file.type,
    contentType,
  })

  const presignRes = await fetch('/admin/api/uploads/images/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentType,
      fileName: file.name,
      mimeType: file.type,
    }),
  })

  if (!presignRes.ok) {
    const error = await presignRes.json().catch(() => null)
    throw buildUploadError(
      'requesting-presigned-url',
      error?.error ?? 'Failed to get upload URL.'
    )
  }

  const { uploadUrl, objectKey, publicUrl } =
    (await presignRes.json()) as PresignResponse

  options?.onPhaseChange?.('uploading-to-r2')
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!uploadRes.ok) {
    console.error('[uploadImageToR2] Upload to Cloudflare R2 failed', {
      status: uploadRes.status,
      statusText: uploadRes.statusText,
      objectKey,
    })
    throw buildUploadError(
      'uploading-to-r2',
      `Upload to R2 failed with status ${uploadRes.status} ${uploadRes.statusText}.`
    )
  }

  console.info('[uploadImageToR2] Upload to Cloudflare R2 completed', {
    status: uploadRes.status,
    objectKey,
    publicUrl,
  })

  return {
    objectKey,
    publicUrl,
  }
}
