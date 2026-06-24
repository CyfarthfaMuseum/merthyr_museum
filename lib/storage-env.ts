type StorageEnv = {
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicBaseUrl: string
}

function readEnv(name: string) {
  return (process.env[name] ?? '').trim()
}

export function getStorageEnv(): StorageEnv {
  const env = {
    accessKeyId: readEnv('STORAGE_ACCESS_KEY_ID'),
    secretAccessKey: readEnv('STORAGE_SECRET_ACCESS_KEY'),
    bucketName: readEnv('STORAGE_BUCKET_NAME'),
    publicBaseUrl: readEnv('STORAGE_PUBLIC_BASE_URL').replace(/\/+$/, ''),
  }

  const missing = [
    ['STORAGE_ACCESS_KEY_ID', env.accessKeyId],
    ['STORAGE_SECRET_ACCESS_KEY', env.secretAccessKey],
    ['STORAGE_BUCKET_NAME', env.bucketName],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length > 0) {
    throw new Error(
      `Missing storage environment variable${missing.length === 1 ? '' : 's'}: ${missing.join(
        ', '
      )}. If you recently edited .env.local, restart the Next.js dev server.`
    )
  }

  return env
}

export function getOptionalStorageEnv() {
  return {
    bucketName: readEnv('STORAGE_BUCKET_NAME'),
    publicBaseUrl: readEnv('STORAGE_PUBLIC_BASE_URL').replace(/\/+$/, ''),
  }
}
