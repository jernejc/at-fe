import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    loader: "custom",
    loaderFile: "./loader.ts",
  },
  async rewrites() {
    return [
      {
        source: "/_fah/image/:path*",
        destination:
          "<CLOUD_FUNCTIONS_URL>/:path*",
      },
    ];
  },
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
