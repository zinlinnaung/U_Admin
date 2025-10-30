import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3081,
  },
  base: "/admin/",
  preview: {
    allowedHosts: ["mypadmin.bitmyanmar.info"], // Add your allowed host here
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
});

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3011,
//   },
//   preview: {
//     allowedHosts: ["megawecare-app.tharapa.ai"], // Add your allowed host here
//   },
// });
