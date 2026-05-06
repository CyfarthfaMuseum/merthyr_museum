import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_BASE_URL ?? ''
const r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : ''

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2Hostname
      ? [{ protocol: 'https', hostname: r2Hostname }]
      : [],
  },
};

export default nextConfig;
