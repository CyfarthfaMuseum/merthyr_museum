type PresignResponse = {
  uploadUrl: string
  objectKey: string
  publicUrl: string | null
}

type UploadImageResult = {
  objectKey: string
  publicUrl: string | null
}

export async function uploadImageToR2(
  file: File,
  contentType: 'book' | 'stories' | 'painting' | 'artifacts' | 'bio' | 'generic'
): Promise<UploadImageResult> {
  console.info('[uploadImageToR2] Requesting presigned URL', {
    fileName: file.name,
    mimeType: file.type,
    contentType,
  })

  const presignRes = await fetch('/api/uploads/images/presign', {
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
    throw new Error(error?.error ?? 'Failed to get upload URL.')
  }

  const { uploadUrl, objectKey, publicUrl } =
    (await presignRes.json()) as PresignResponse

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
    throw new Error('Upload to R2 failed.')
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
