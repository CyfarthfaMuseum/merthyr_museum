import { S3Client } from '@aws-sdk/client-s3'
import { getStorageEnv } from '@/lib/storage-env'

export function getStorageClient() {
  const { accessKeyId, secretAccessKey } = getStorageEnv()

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
