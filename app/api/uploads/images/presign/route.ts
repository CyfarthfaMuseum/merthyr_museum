import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from '@/lib/r2'

const bucket = process.env.R2_BUCKET_NAME
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL

if (!bucket) {
  throw new Error('Missing R2_BUCKET_NAME.')
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(req: NextRequest) {
  try {
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

    const safeFileName = sanitizeFileName(fileName)
    const extension = safeFileName.includes('.')
      ? safeFileName.split('.').pop()
      : 'bin'

    const objectKey = `content/${contentType}/images/${randomUUID()}.${extension}`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: mimeType,
    })

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 * 5 })

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