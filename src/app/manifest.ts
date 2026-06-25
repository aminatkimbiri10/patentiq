import type { MetadataRoute } from "next";
import { i2paBrand } from "@/config/i2pa-brand";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.productLabel,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0a0a",
    theme_color: i2paBrand.primary,
    lang: "fr",
    categories: ["business", "productivity"],
    icons: [
      {
        src: i2paBrand.appMarkUrl,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: i2paBrand.appMarkUrl,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logos/i2pa.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
