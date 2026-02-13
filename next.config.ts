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
          "https://us-central1-lookacross-dba84.cloudfunctions.net/ext-image-processing-api-handler/:path*",
      },
    ];
  },
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
