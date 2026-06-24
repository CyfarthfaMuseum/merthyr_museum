import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getStorageClient } from '@/lib/r2'
import { getStorageEnv } from '@/lib/storage-env'

const allowedMimeTypes = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/x-mp3',
  'audio/x-mpeg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'video/mp4',
  'application/mp4',
])
const allowedContentTypes = new Set(['book', 'stories', 'painting', 'artifacts', 'bio', 'generic'])
const maxSizeBytes = 15 * 1024 * 1024

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const { bucketName, publicBaseUrl } = getStorageEnv()

    const body = await req.json()
    const { contentType, fileName, mimeType, fileSizeBytes } = body

    if (!contentType || !fileName || !mimeType) {
      return NextResponse.json(
        { error: 'contentType, fileName, and mimeType are required.' },
        { status: 400 }
      )
    }

    if (!allowedContentTypes.has(contentType)) {
      return NextResponse.json({ error: 'Invalid contentType.' }, { status: 400 })
    }

    if (!allowedMimeTypes.has(mimeType)) {
      return NextResponse.json({ error: 'Only MP3 or MP4 audio files are allowed.' }, { status: 400 })
    }

    if (typeof fileSizeBytes === 'number' && fileSizeBytes > maxSizeBytes) {
      return NextResponse.json({ error: 'File exceeds 15MB limit.' }, { status: 400 })
    }

    const safeFileName = sanitizeFileName(fileName)
    const ext = safeFileName.split('.').pop()?.replace(/[^a-z0-9]/g, '') || 'mp3'
    const objectKey = `content/${contentType}/audio/${randomUUID()}.${ext}`

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: mimeType,
    })

    const uploadUrl = await getSignedUrl(getStorageClient(), command, { expiresIn: 60 * 5 })

    return NextResponse.json({
      uploadUrl,
      objectKey,
      publicUrl: publicBaseUrl ? `${publicBaseUrl}/${objectKey}` : null,
    })
  } catch (err) {
    console.error('[presign/audio]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
