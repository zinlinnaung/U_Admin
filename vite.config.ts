import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  base: "/admin/", // ✅ ensures correct asset paths
  server: {
    port: 3081,
  },
  preview: {
    allowedHosts: ["mypadmin.bitmyanmar.info"], // ✅ your domain
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
});
