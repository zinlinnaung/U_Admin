import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  base: "/", // ✅ important for Vercel
  server: {
    port: 3081,
  },
  preview: {
    allowedHosts: ["mypadmin.bitmyanmar.info"],
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
});
