import type { NextRequest } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getStorageClient } from '@/lib/r2'
import { getStorageEnv } from '@/lib/storage-env'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const key = path.map((segment) => decodeURIComponent(segment)).join('/')

  if (!key) {
    return new Response(null, { status: 404 })
  }

  try {
    const { bucketName } = getStorageEnv()
    const object = await getStorageClient().send(
      new GetObjectCommand({ Bucket: bucketName, Key: key })
    )

    if (!object.Body) {
      return new Response(null, { status: 404 })
    }

    const headers: HeadersInit = {
      'Content-Type': object.ContentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600, immutable',
    }
    if (object.ContentLength != null) {
      headers['Content-Length'] = String(object.ContentLength)
    }
    if (object.ETag) {
      headers['ETag'] = object.ETag
    }

    return new Response(object.Body.transformToWebStream(), {
      status: 200,
      headers,
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}
