import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Word Box",
    short_name: "Word Box",
    description: "Личный кабинет ученика английского языка",
    start_url: "/student",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F0E7DA",
    theme_color: "#74070E",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
