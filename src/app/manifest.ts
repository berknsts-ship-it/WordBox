import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Word Box",
    short_name: "Word Box",
    description: "Личный кабинет ученика английского языка",
    start_url: "/student",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdf8f0",
    theme_color: "#7c5c3e",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
