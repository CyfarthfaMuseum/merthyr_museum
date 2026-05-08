import type { NextConfig } from "next";

function getStorageHostname(): string {
  const raw = (process.env.STORAGE_PUBLIC_BASE_URL ?? '').trim().replace(/^=+/, '')
  try {
    return raw ? new URL(raw).hostname : ''
  } catch {
    return ''
  }
}

const storageHostname = getStorageHostname()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: storageHostname
      ? [{ protocol: 'https', hostname: storageHostname }]
      : [],
  },
};

export default nextConfig;
