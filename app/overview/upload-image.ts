type PresignResponse = {
  uploadUrl: string
  objectKey: string
  publicUrl: string | null
}

type UploadImageResult = {
  objectKey: string
  publicUrl: string | null
}

export async function uploadImageToR2(file: File): Promise<UploadImageResult> {
  const presignRes = await fetch('/api/uploads/images/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentType: 'generic',
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
    throw new Error('Upload to R2 failed.')
  }

  return {
    objectKey,
    publicUrl,
  }
}