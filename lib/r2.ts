import { S3Client } from '@aws-sdk/client-s3'

export function getStorageClient() {
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing one or more required storage environment variables: STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY.'
    )
  }

  return new S3Client({
    region: 'auto',
    endpoint: 'https://t3.storage.dev',
    forcePathStyle: false,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}
