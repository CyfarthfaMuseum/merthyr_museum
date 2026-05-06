import type { NextConfig } from "next";

function getR2Hostname(): string {
  const raw = (process.env.R2_PUBLIC_BASE_URL ?? '').trim().replace(/^=+/, '')
  try {
    return raw ? new URL(raw).hostname : ''
  } catch {
    return ''
  }
}

const r2Hostname = getR2Hostname()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2Hostname
      ? [{ protocol: 'https', hostname: r2Hostname }]
      : [],
  },
};

export default nextConfig;
