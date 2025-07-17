import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173,
    allowedHosts : ['cbdb0ebf919e.ngrok-free.app']
  },
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
});
