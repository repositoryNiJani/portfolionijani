import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png", "logo.webp"],
      manifest: {
        name: "Jhonny M. Sumulong | Portfolio",
        short_name: "Jani Portfolio",
        description:
          "Jhonny M. Sumulong, BSIS student and web developer. Portfolio, projects and resume.",
        theme_color: "#0b1020",
        background_color: "#0b1020",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: [
          "**/*.{js,css,html,woff2}",
          "favicon.png",
          "apple-touch-icon.png",
          "pwa-*.png",
          "logo.webp",
          "*.svg",
        ],
      },
    }),
  ],
});
