import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native image library is loaded at runtime rather than bundled.
  serverExternalPackages: ["sharp", "mysql2"],
  experimental: {
    // Media uploads go through server actions (max 15 MB per file, several at once).
    serverActions: { bodySizeLimit: "60mb" },
    proxyClientMaxBodySize: "60mb",
  },
  async redirects() {
    return [
      // Old PHP URLs from the previous site → clean URLs.
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/:path*.php", destination: "/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
