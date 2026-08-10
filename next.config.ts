import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nginx handles gzip in front of this app (see deploy/nginx) — avoid
  // double compression from Next's own gzip layer.
  compress: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "300mb",
    },
    // Separate from the Server Actions limit above — this one governs plain
    // Route Handlers (e.g. /api/upload/file-put), previously left at the
    // 10MB default and silently truncating anything larger.
    proxyClientMaxBodySize: "300mb",
  },
  async headers() {
    return [
      {
        // Must always revalidate: the browser needs to see byte-level
        // changes immediately to install a new service worker.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
      {
        source: "/icon-192.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
      {
        source: "/icon-512.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
      {
        source: "/apple-touch-icon.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
      {
        source: "/favicon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
    ];
  },
};

export default nextConfig;
