import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getStorageClient } from '@/lib/r2'

const allowedContentTypes = new Set(['book', 'stories', 'painting', 'artifacts', 'bio', 'generic'])
const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const bucket = process.env.STORAGE_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json({ error: 'Missing STORAGE_BUCKET_NAME.' }, { status: 500 })
    }

    const body = await req.json()

    const contentType = body.contentType as string | undefined
    const fileName = body.fileName as string | undefined
    const mimeType = body.mimeType as string | undefined

    if (!contentType || !fileName || !mimeType) {
      return NextResponse.json(
        { error: 'contentType, fileName, and mimeType are required.' },
        { status: 400 }
      )
    }

    if (!allowedContentTypes.has(contentType)) {
      return NextResponse.json({ error: 'Invalid contentType.' }, { status: 400 })
    }

    const safeFileName = sanitizeFileName(fileName)
    const extension = safeFileName.includes('.')
      ? safeFileName.split('.').pop()?.replace(/[^a-z0-9]/g, '')
      : 'bin'

    const objectKey = `content/${contentType}/images/${randomUUID()}.${extension || 'bin'}`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: mimeType,
    })

    const uploadUrl = await getSignedUrl(getStorageClient(), command, { expiresIn: 60 * 5 })

    return NextResponse.json({
      uploadUrl,
      objectKey,
      publicUrl: publicBaseUrl ? `${publicBaseUrl}/${objectKey}` : null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate upload URL.',
      },
      { status: 500 }
    )
  }
}
